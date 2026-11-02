// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Minimal {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title PnLAttestation
 * @notice Stores epoch PnL attestations cryptographically signed by the Auditor Agent.
 * Enforces a High-Water Mark rule on performance fees: performance fees are released to
 * specialist agents (e.g. Signal Agent) only when verified PnL exceeds the previous high-water mark.
 */
contract PnLAttestation {
    struct EpochReport {
        uint256 epochId;
        address vault;
        int256 realizedPnL;        // Can be negative (loss) or positive (profit)
        uint256 totalVolume;
        uint256 totalTrades;
        uint256 maxDrawdownBps;     // Basis points (e.g., 250 = 2.5%)
        bytes32 pnlHash;
        uint256 timestamp;
        bool verified;
    }

    struct PerformanceEscrow {
        address depositor;
        address recipient;
        address token;
        uint256 amount;
        uint256 epochId;
        bool released;
        bool refunded;
    }

    event EpochAttestationRecorded(
        uint256 indexed epochId,
        address indexed vault,
        int256 realizedPnL,
        uint256 maxDrawdownBps,
        bytes32 pnlHash
    );
    event PerformanceFeeDeposited(uint256 indexed escrowId, uint256 indexed epochId, uint256 amount);
    event PerformanceFeeReleased(uint256 indexed escrowId, address indexed recipient, uint256 amount);
    event PerformanceFeeRefunded(uint256 indexed escrowId, address indexed depositor, uint256 amount);

    error Unauthorized();
    error EpochAlreadyRecorded();
    error InvalidSignature();
    error HighWaterMarkNotMet(int256 currentPnL, int256 highWaterMark);
    error EscrowAlreadyResolved();
    error TransferFailed();

    address public owner;
    address public auditor;

    // vault => highWaterMark (cumulative net profit threshold)
    mapping(address => int256) public highWaterMarks;
    // vault => cumulativePnL
    mapping(address => int256) public cumulativeVaultPnL;

    // epochId => EpochReport
    mapping(uint256 => EpochReport) public epochReports;
    uint256 public nextEpochId;

    // escrowId => PerformanceEscrow
    mapping(uint256 => PerformanceEscrow) public escrows;
    uint256 public nextEscrowId;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuditor() {
        if (msg.sender != auditor && msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address _auditor) {
        owner = msg.sender;
        auditor = _auditor;
        nextEpochId = 1;
        nextEscrowId = 1;
    }

    function setAuditor(address _auditor) external onlyOwner {
        auditor = _auditor;
    }

    function computeEpochHash(
        uint256 epochId,
        address vault,
        int256 realizedPnL,
        uint256 totalVolume,
        uint256 totalTrades,
        uint256 maxDrawdownBps,
        uint256 timestamp
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                epochId,
                vault,
                realizedPnL,
                totalVolume,
                totalTrades,
                maxDrawdownBps,
                timestamp
            )
        );
    }

    /**
     * @notice Submit an audited epoch report signed by the Auditor agent.
     */
    function recordEpochAttestation(
        address vault,
        int256 realizedPnL,
        uint256 totalVolume,
        uint256 totalTrades,
        uint256 maxDrawdownBps,
        bytes calldata signature
    ) external returns (uint256 epochId) {
        epochId = nextEpochId++;
        uint256 timestamp = block.timestamp;
        bytes32 pnlHash = computeEpochHash(
            epochId,
            vault,
            realizedPnL,
            totalVolume,
            totalTrades,
            maxDrawdownBps,
            timestamp
        );

        // [C-4 FIX] Always verify signature — remove owner bypass that allowed forged attestations
        // Owner can call setAuditor() to rotate auditor; no need for a bypass here.
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", pnlHash)
        );
        address recovered = recoverSigner(ethSignedMessageHash, signature);
        if (recovered == address(0) || recovered != auditor) {
            // [L-4 FIX] also reject if ecrecover returned zero (malformed sig)
            revert InvalidSignature();
        }

        epochReports[epochId] = EpochReport({
            epochId: epochId,
            vault: vault,
            realizedPnL: realizedPnL,
            totalVolume: totalVolume,
            totalTrades: totalTrades,
            maxDrawdownBps: maxDrawdownBps,
            pnlHash: pnlHash,
            timestamp: timestamp,
            verified: true
        });

        // Update cumulative vault PnL
        cumulativeVaultPnL[vault] += realizedPnL;

        // Update high-water mark if new high achieved
        if (cumulativeVaultPnL[vault] > highWaterMarks[vault]) {
            highWaterMarks[vault] = cumulativeVaultPnL[vault];
        }

        emit EpochAttestationRecorded(epochId, vault, realizedPnL, maxDrawdownBps, pnlHash);
    }

    /**
     * @notice Deposit performance fee into escrow pending Auditor attestation of the epoch.
     */
    function depositPerformanceEscrow(
        address recipient,
        address token,
        uint256 amount,
        uint256 epochId
    ) external returns (uint256 escrowId) {
        escrowId = nextEscrowId++;

        if (token != address(0)) {
            bool ok = IERC20Minimal(token).transferFrom(msg.sender, address(this), amount);
            if (!ok) revert TransferFailed();
        }

        escrows[escrowId] = PerformanceEscrow({
            depositor: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            epochId: epochId,
            released: false,
            refunded: false
        });

        emit PerformanceFeeDeposited(escrowId, epochId, amount);
    }

    /**
     * @notice Release performance fee if attested PnL for the epoch was profitable and above HWM.
     * Otherwise refunds the fee to the vault depositor.
     */
    function resolvePerformanceEscrow(uint256 escrowId) external {
        PerformanceEscrow storage escrow = escrows[escrowId];
        if (escrow.released || escrow.refunded) revert EscrowAlreadyResolved();

        EpochReport memory report = epochReports[escrow.epochId];
        if (!report.verified) revert Unauthorized();

        // [M-3 FIX] Enforce high-water mark: release only if epoch was profitable AND vault PnL exceeds HWM
        int256 vaultCumPnL = cumulativeVaultPnL[escrow.depositor];
        int256 hwm = highWaterMarks[escrow.depositor];
        bool aboveHWM = report.realizedPnL > 0 && vaultCumPnL > hwm;

        if (aboveHWM) {
            escrow.released = true;
            if (escrow.token != address(0)) {
                bool ok = IERC20Minimal(escrow.token).transfer(escrow.recipient, escrow.amount);
                if (!ok) revert TransferFailed();
            } else {
                (bool sent, ) = escrow.recipient.call{value: escrow.amount}("");
                if (!sent) revert TransferFailed();
            }
            emit PerformanceFeeReleased(escrowId, escrow.recipient, escrow.amount);
        } else {
            // PnL negative, zero, or did not exceed HWM → refund to vault depositor
            escrow.refunded = true;
            if (escrow.token != address(0)) {
                bool ok = IERC20Minimal(escrow.token).transfer(escrow.depositor, escrow.amount);
                if (!ok) revert TransferFailed();
            } else {
                (bool sent, ) = escrow.depositor.call{value: escrow.amount}("");
                if (!sent) revert TransferFailed();
            }
            emit PerformanceFeeRefunded(escrowId, escrow.depositor, escrow.amount);
        }
    }

    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly ("memory-safe") {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        return ecrecover(hash, v, r, s);
    }
}
