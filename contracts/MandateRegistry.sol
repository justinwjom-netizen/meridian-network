// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MandateRegistry
 * @notice On-chain registry for HSP Payment Mandates.
 * Prevents double-spending, replay attacks, enforces deadline expiries,
 * and tracks the state of agent-to-agent payment agreements.
 */
contract MandateRegistry {
    enum MandateStatus {
        None,
        Approved,
        Executed,
        Revoked
    }

    struct Mandate {
        address payer;
        address payee;
        address token;
        uint256 amount;
        bytes32 orderId;
        uint256 nonce;
        uint256 expiry;
        bytes32 conditionsHash;
        MandateStatus status;
        uint256 executedAt;
    }

    event MandateRegistered(
        bytes32 indexed mandateHash,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        bytes32 orderId
    );
    event MandateExecuted(bytes32 indexed mandateHash, uint256 executedAt);
    event MandateRevoked(bytes32 indexed mandateHash);

    error MandateAlreadyExists();
    error MandateExpired();
    error NonceAlreadyUsed(address payer, uint256 nonce);
    error Unauthorized();
    error InvalidParameters();

    address public owner;
    mapping(address => bool) public authorizedVaults;

    // payer => nonce => used
    mapping(address => mapping(uint256 => bool)) public usedNonces;
    // mandateHash => Mandate
    mapping(bytes32 => Mandate) public mandates;
    // orderId => mandateHash
    mapping(bytes32 => bytes32) public orderToMandate;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyVaultOrOwner() {
        if (msg.sender != owner && !authorizedVaults[msg.sender]) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setVaultAuthorization(address vault, bool authorized) external onlyOwner {
        authorizedVaults[vault] = authorized;
    }

    function computeMandateHash(
        address payer,
        address payee,
        address token,
        uint256 amount,
        bytes32 orderId,
        uint256 nonce,
        uint256 expiry,
        bytes32 conditionsHash
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                payer,
                payee,
                token,
                amount,
                orderId,
                nonce,
                expiry,
                conditionsHash
            )
        );
    }

    /**
     * @notice Records the execution of an HSP Payment Mandate from an authorized PolicyVault.
     */
    function recordExecution(
        address payer,
        address payee,
        address token,
        uint256 amount,
        bytes32 orderId,
        uint256 nonce,
        uint256 expiry,
        bytes32 conditionsHash
    ) external onlyVaultOrOwner returns (bool) {
        // [H-1 FIX] >= prevents a mandate expiring at exactly this block from being executed
        if (block.timestamp >= expiry) revert MandateExpired();
        if (usedNonces[payer][nonce]) revert NonceAlreadyUsed(payer, nonce);

        bytes32 mandateHash = computeMandateHash(
            payer,
            payee,
            token,
            amount,
            orderId,
            nonce,
            expiry,
            conditionsHash
        );

        if (mandates[mandateHash].status != MandateStatus.None) {
            revert MandateAlreadyExists();
        }

        usedNonces[payer][nonce] = true;
        mandates[mandateHash] = Mandate({
            payer: payer,
            payee: payee,
            token: token,
            amount: amount,
            orderId: orderId,
            nonce: nonce,
            expiry: expiry,
            conditionsHash: conditionsHash,
            status: MandateStatus.Executed,
            executedAt: block.timestamp
        });

        orderToMandate[orderId] = mandateHash;

        emit MandateRegistered(mandateHash, payer, payee, amount, orderId);
        emit MandateExecuted(mandateHash, block.timestamp);
        return true;
    }

    function getMandateByOrderId(bytes32 orderId) external view returns (Mandate memory) {
        bytes32 hash = orderToMandate[orderId];
        return mandates[hash];
    }

    function isMandateExecuted(bytes32 mandateHash) external view returns (bool) {
        return mandates[mandateHash].status == MandateStatus.Executed;
    }
}
