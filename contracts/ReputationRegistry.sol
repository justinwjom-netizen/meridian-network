// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationRegistry
 * @notice Open agent discovery and reputation scoring for Meridian network.
 * Any agent can register, stake collateral, and build on-chain verifiable reputation
 * driven by cryptographic attestations from the Auditor Agent.
 */
contract ReputationRegistry {
    enum AgentRole {
        Signal,
        Risk,
        Execution,
        Auditor,
        Strategist,
        Custom
    }

    struct AgentInfo {
        address agentAddress;
        AgentRole role;
        string name;
        string endpoint;
        string metadataUri;
        uint256 stake;
        uint256 score;             // 0 to 1000 scale, default 500
        uint256 totalTasks;
        uint256 successfulTasks;
        uint256 slashedStake;
        bool isActive;
        uint256 registeredAt;
    }

    event AgentRegistered(address indexed agentAddress, AgentRole role, string name, string endpoint);
    event AgentStaked(address indexed agentAddress, uint256 amount, uint256 newTotalStake);
    event StakeWithdrawn(address indexed agentAddress, uint256 amount);
    event ReputationUpdated(address indexed agentAddress, uint256 newScore, int256 delta, bytes32 attestationHash);
    event AgentSlashed(address indexed agentAddress, uint256 amount, string reason);

    error Unauthorized();
    error AgentAlreadyRegistered();
    error AgentNotFound();
    error InsufficientStake();
    error InvalidScore();

    address public owner;
    address public authorizedAuditor;

    mapping(address => AgentInfo) public agents;
    address[] public agentList;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuditorOrOwner() {
        if (msg.sender != owner && msg.sender != authorizedAuditor) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAuthorizedAuditor(address _auditor) external onlyOwner {
        authorizedAuditor = _auditor;
    }

    function registerAgent(
        AgentRole _role,
        string calldata _name,
        string calldata _endpoint,
        string calldata _metadataUri
    ) external payable {
        if (agents[msg.sender].agentAddress != address(0)) revert AgentAlreadyRegistered();

        agents[msg.sender] = AgentInfo({
            agentAddress: msg.sender,
            role: _role,
            name: _name,
            endpoint: _endpoint,
            metadataUri: _metadataUri,
            stake: msg.value,
            score: 500, // Starts at neutral 500 / 1000
            totalTasks: 0,
            successfulTasks: 0,
            slashedStake: 0,
            isActive: true,
            registeredAt: block.timestamp
        });

        agentList.push(msg.sender);
        emit AgentRegistered(msg.sender, _role, _name, _endpoint);
        if (msg.value > 0) {
            emit AgentStaked(msg.sender, msg.value, msg.value);
        }
    }

    function stake() external payable {
        AgentInfo storage agent = agents[msg.sender];
        if (agent.agentAddress == address(0)) revert AgentNotFound();

        agent.stake += msg.value;
        emit AgentStaked(msg.sender, msg.value, agent.stake);
    }

    function withdrawStake(uint256 amount) external {
        AgentInfo storage agent = agents[msg.sender];
        if (agent.agentAddress == address(0)) revert AgentNotFound();
        if (agent.stake < amount) revert InsufficientStake();

        agent.stake -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) revert Unauthorized();

        emit StakeWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Updates agent reputation score based on Auditor-signed attestations
     */
    function recordAttestation(
        address agentAddress,
        bool taskSuccessful,
        int256 scoreDelta,
        bytes32 attestationHash
    ) external onlyAuditorOrOwner {
        AgentInfo storage agent = agents[agentAddress];
        if (agent.agentAddress == address(0)) revert AgentNotFound();

        agent.totalTasks += 1;
        if (taskSuccessful) {
            agent.successfulTasks += 1;
        }

        int256 newScore = int256(agent.score) + scoreDelta;
        if (newScore > 1000) newScore = 1000;
        if (newScore < 0) newScore = 0;

        agent.score = uint256(newScore);

        emit ReputationUpdated(agentAddress, agent.score, scoreDelta, attestationHash);
    }

    /**
     * @notice Slashing mechanism: penalties for providing provably falsified data or bad execution
     */
    function slashAgent(address agentAddress, uint256 amount, string calldata reason) external onlyOwner {
        AgentInfo storage agent = agents[agentAddress];
        if (agent.agentAddress == address(0)) revert AgentNotFound();
        if (agent.stake < amount) {
            amount = agent.stake;
        }

        agent.stake -= amount;
        agent.slashedStake += amount;
        if (agent.score >= 100) {
            agent.score -= 100;
        } else {
            agent.score = 0;
        }

        emit AgentSlashed(agentAddress, amount, reason);
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getAllAgents() external view returns (AgentInfo[] memory) {
        AgentInfo[] memory result = new AgentInfo[](agentList.length);
        for (uint256 i = 0; i < agentList.length; i++) {
            result[i] = agents[agentList[i]];
        }
        return result;
    }
}
