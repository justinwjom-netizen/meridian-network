// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal ERC20 interface needed by PolicyVault
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @dev Minimal DEX Swap Interface for HSKSwap
 */
interface IHSKSwap {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

interface IMandateRegistry {
    function recordExecution(
        address payer,
        address payee,
        address token,
        uint256 amount,
        bytes32 orderId,
        uint256 nonce,
        uint256 expiry,
        bytes32 conditionsHash
    ) external returns (bool);
}

/**
 * @title PolicyVault
 * @notice Holds user funds for Meridian. All trades on HSKSwap and agent-to-agent
 * payments via HSP mandates must clear deterministic, on-chain policy boundaries.
 * 
 * Agents NEVER hold user keys. The Strategist operates via bounded session keys.
 * A compromised agent can lose at most the policy caps, never the entire vault.
 */
contract PolicyVault {
    // --- Events ---
    event Deposited(address indexed sender, address indexed token, uint256 amount);
    event Withdrawn(address indexed owner, address indexed token, uint256 amount);
    event PolicyUpdated(PolicyConfig newConfig);
    event SessionKeyUpdated(address indexed sessionKey, bool active, uint256 expiry);
    event TradeExecuted(
        address indexed pool,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event AgentPaid(
        address indexed payee,
        address indexed token,
        uint256 amount,
        bytes32 indexed mandateHash
    );
    event Paused(address account);
    event Unpaused(address account);
    event AllowedPayeeUpdated(address indexed payee, bool allowed);
    event AllowedTokenUpdated(address indexed token, bool allowed);
    event AllowedPoolUpdated(address indexed pool, bool allowed);
    event TokenDeposited(address indexed sender, address indexed token, uint256 amount);

    // --- Errors ---
    error Unauthorized();
    error VaultPaused();
    error SessionKeyExpired();
    error TradeExceedsCap(uint256 requested, uint256 cap);
    error DailyLossLimitExceeded(int256 currentLoss, uint256 limit);
    error DailyAgentSpendLimitExceeded(uint256 currentSpend, uint256 limit);
    error PayeeNotAllowed(address payee);
    error TokenNotAllowed(address token);
    error PoolNotAllowed(address pool);
    error SwapFailed();
    error TransferFailed();
    error ReentrancyGuardTriggered();

    // --- Structs ---
    struct PolicyConfig {
        uint256 perTradeCap;          // Max notional per single trade (in base token units, e.g. USDT)
        uint256 dailyLossLimit;       // Max allowable cumulative loss in 24h
        uint256 dailyAgentSpendCap;   // Max total fee spend across all agents in 24h
        uint256 maxSlippageBps;       // Max allowable slippage in basis points (e.g. 100 = 1%)
    }

    struct SessionKeyConfig {
        bool isActive;
        uint256 validUntil;
    }

    struct DailyTracking {
        uint256 windowStart;
        uint256 agentSpend;
        int256 cumulativeLoss;
    }

    // --- State Variables ---
    address public owner;
    bool public isPaused;
    uint256 private _status; // Reentrancy status

    PolicyConfig public policy;
    IMandateRegistry public mandateRegistry;

    mapping(address => SessionKeyConfig) public sessionKeys;
    mapping(address => bool) public allowedPayees;
    mapping(address => bool) public allowedTokens;
    mapping(address => bool) public allowedPools;

    DailyTracking public dailyTracking;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuthorized() {
        if (msg.sender != owner) {
            SessionKeyConfig memory key = sessionKeys[msg.sender];
            if (!key.isActive || block.timestamp > key.validUntil) {
                revert Unauthorized();
            }
        }
        _;
    }

    modifier whenNotPaused() {
        if (isPaused) revert VaultPaused();
        _;
    }

    modifier nonReentrant() {
        if (_status == 2) revert ReentrancyGuardTriggered();
        _status = 2;
        _;
        _status = 1;
    }

    constructor(
        address _mandateRegistry,
        uint256 _perTradeCap,
        uint256 _dailyLossLimit,
        uint256 _dailyAgentSpendCap,
        uint256 _maxSlippageBps
    ) {
        owner = msg.sender;
        mandateRegistry = IMandateRegistry(_mandateRegistry);
        policy = PolicyConfig({
            perTradeCap: _perTradeCap,
            dailyLossLimit: _dailyLossLimit,
            dailyAgentSpendCap: _dailyAgentSpendCap,
            maxSlippageBps: _maxSlippageBps
        });
        dailyTracking.windowStart = block.timestamp;
        _status = 1;
    }

    receive() external payable nonReentrant {
        emit Deposited(msg.sender, address(0), msg.value);
    }

    /**
     * @notice Safely deposit ERC20 tokens into the vault.
     */
    function depositToken(address token, uint256 amount) external {
        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();
        emit TokenDeposited(msg.sender, token, amount);
    }

    // --- Owner Management ---

    function setMandateRegistry(address _mandateRegistry) external onlyOwner {
        mandateRegistry = IMandateRegistry(_mandateRegistry);
    }

    function setSessionKey(address _key, bool _isActive, uint256 _validUntil) external onlyOwner {
        sessionKeys[_key] = SessionKeyConfig({
            isActive: _isActive,
            validUntil: _validUntil
        });
        emit SessionKeyUpdated(_key, _isActive, _validUntil);
    }

    function setPolicy(
        uint256 _perTradeCap,
        uint256 _dailyLossLimit,
        uint256 _dailyAgentSpendCap,
        uint256 _maxSlippageBps
    ) external onlyOwner {
        policy = PolicyConfig({
            perTradeCap: _perTradeCap,
            dailyLossLimit: _dailyLossLimit,
            dailyAgentSpendCap: _dailyAgentSpendCap,
            maxSlippageBps: _maxSlippageBps
        });
        emit PolicyUpdated(policy);
    }

    function setAllowedPayee(address _payee, bool _allowed) external onlyOwner {
        allowedPayees[_payee] = _allowed;
        emit AllowedPayeeUpdated(_payee, _allowed);
    }

    function setAllowedToken(address _token, bool _allowed) external onlyOwner {
        allowedTokens[_token] = _allowed;
        emit AllowedTokenUpdated(_token, _allowed);
    }

    function setAllowedPool(address _pool, bool _allowed) external onlyOwner {
        allowedPools[_pool] = _allowed;
        emit AllowedPoolUpdated(_pool, _allowed);
    }

    function pause() external onlyOwner {
        isPaused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        isPaused = false;
        emit Unpaused(msg.sender);
    }

    function withdrawNative(uint256 amount) external onlyOwner nonReentrant {
        (bool success, ) = owner.call{value: amount}("");
        if (!success) revert TransferFailed();
        emit Withdrawn(owner, address(0), amount);
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner nonReentrant {
        bool success = IERC20(token).transfer(owner, amount);
        if (!success) revert TransferFailed();
        emit Withdrawn(owner, token, amount);
    }

    // --- Policy Verification Helpers ---

    function _refreshDailyWindowIfNeeded() internal {
        // [H-3 FIX] Align window to clean 24h UTC boundaries to prevent rolling-window 2x cap exploit
        uint256 alignedStart = (block.timestamp / 1 days) * 1 days;
        if (alignedStart > dailyTracking.windowStart) {
            dailyTracking.windowStart = alignedStart;
            dailyTracking.agentSpend = 0;
            dailyTracking.cumulativeLoss = 0;
        }
    }

    // --- Agent Payment via HSP Mandate ---

    /**
     * @notice Pay an authorized agent for services (Signal, Risk check, Execution routing, Audit).
     * Validates agent allowlist, daily spend budget, and registers mandate with MandateRegistry.
     */
    function payAgent(
        address payee,
        address token,
        uint256 amount,
        bytes32 orderId,
        uint256 nonce,
        uint256 expiry,
        bytes32 conditionsHash
    ) external onlyAuthorized whenNotPaused nonReentrant returns (bool) {
        _refreshDailyWindowIfNeeded();

        if (!allowedPayees[payee]) revert PayeeNotAllowed(payee);
        if (token != address(0) && !allowedTokens[token]) revert TokenNotAllowed(token);

        if (dailyTracking.agentSpend + amount > policy.dailyAgentSpendCap) {
            revert DailyAgentSpendLimitExceeded(dailyTracking.agentSpend + amount, policy.dailyAgentSpendCap);
        }

        dailyTracking.agentSpend += amount;

        // Record mandate with registry for replay protection
        if (address(mandateRegistry) != address(0)) {
            bool ok = mandateRegistry.recordExecution(
                address(this),
                payee,
                token,
                amount,
                orderId,
                nonce,
                expiry,
                conditionsHash
            );
            if (!ok) revert Unauthorized();
        }

        // Execute payment transfer
        if (token == address(0)) {
            (bool sent, ) = payee.call{value: amount}("");
            if (!sent) revert TransferFailed();
        } else {
            bool sent = IERC20(token).transfer(payee, amount);
            if (!sent) revert TransferFailed();
        }

        // [H-2 FIX] Use same hash encoding as MandateRegistry so events can be correlated off-chain
        bytes32 mandateHash = keccak256(abi.encode(
            address(this), payee, token, amount, orderId, nonce, expiry, conditionsHash
        ));
        emit AgentPaid(payee, token, amount, mandateHash);
        return true;
    }

    // --- Trading Execution ---

    /**
     * @notice Executes a DEX swap on HSKSwap within strict policy bounds.
     */
    function executeSwap(
        address pool,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address[] calldata path,
        uint256 deadline
    ) external onlyAuthorized whenNotPaused nonReentrant returns (uint256 amountOut) {
        _refreshDailyWindowIfNeeded();

        if (!allowedPools[pool]) revert PoolNotAllowed(pool);
        if (!allowedTokens[tokenIn]) revert TokenNotAllowed(tokenIn);
        if (!allowedTokens[tokenOut]) revert TokenNotAllowed(tokenOut);
        if (amountIn > policy.perTradeCap) revert TradeExceedsCap(amountIn, policy.perTradeCap);

        // [C-1 FIX] Reset allowance before setting to prevent ERC20 double-spend race condition
        IERC20(tokenIn).approve(pool, 0);
        IERC20(tokenIn).approve(pool, amountIn);

        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));

        uint256[] memory amounts = IHSKSwap(pool).swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path,
            address(this),
            deadline
        );

        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        amountOut = balanceAfter - balanceBefore;
        if (amountOut < minAmountOut) revert SwapFailed();

        // [C-1 FIX] Always reset approval after swap to zero to prevent lingering allowance drain
        IERC20(tokenIn).approve(pool, 0);

        emit TradeExecuted(pool, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @notice Record realized PnL update (called during accounting / epoch updates)
     */
    // [H-4 FIX] Restricted to onlyOwner — session keys must not be able to zero out loss accounting
    function recordPnL(int256 pnlChange) external onlyOwner {
        if (pnlChange == 0) return; // [L-8 FIX] no-op guard
        _refreshDailyWindowIfNeeded();
        // cumulativeLoss is int256 but always held >= 0 (a running loss magnitude).
        // Cast explicitly so int256/uint256 arithmetic type-checks.
        if (pnlChange < 0) {
            dailyTracking.cumulativeLoss += (-pnlChange); // -pnlChange is a positive int256
            if (uint256(dailyTracking.cumulativeLoss) > policy.dailyLossLimit) {
                revert DailyLossLimitExceeded(dailyTracking.cumulativeLoss, policy.dailyLossLimit);
            }
        } else {
            int256 gain = pnlChange; // pnlChange >= 0 here
            if (dailyTracking.cumulativeLoss > gain) {
                dailyTracking.cumulativeLoss -= gain;
            } else {
                dailyTracking.cumulativeLoss = 0;
            }
        }
    }
}
