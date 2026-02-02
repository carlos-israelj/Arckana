// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DividendPool
 * @notice Confidential dividend distribution using Merkle proofs
 * @dev Merkle root is set by authorized operator after TEE computation
 */
contract DividendPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Payment token (e.g., USDC for dividend payouts)
    IERC20 public immutable paymentToken;

    // Current distribution round
    uint256 public currentRound;

    // Merkle root for each round
    mapping(uint256 => bytes32) public merkleRoots;

    // Track claimed status: round => holder => claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // Total distributed per round
    mapping(uint256 => uint256) public totalDistributed;

    // Authorized operator (can be iExec oracle or admin)
    address public operator;

    // Events
    event RoundStarted(uint256 indexed round, bytes32 merkleRoot, uint256 totalPool);
    event DividendClaimed(uint256 indexed round, address indexed holder, uint256 amount);
    event OperatorUpdated(address indexed oldOperator, address indexed newOperator);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        operator = msg.sender;
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == owner(), "Not authorized");
        _;
    }

    /**
     * @notice Set the operator address
     * @param _operator New operator address
     */
    function setOperator(address _operator) external onlyOwner {
        emit OperatorUpdated(operator, _operator);
        operator = _operator;
    }

    /**
     * @notice Start a new distribution round with Merkle root from TEE
     * @param _merkleRoot Merkle root computed by iApp
     * @param _totalPool Total dividend pool for this round
     */
    function startDistributionRound(bytes32 _merkleRoot, uint256 _totalPool) external onlyOperator {
        require(_merkleRoot != bytes32(0), "Invalid merkle root");

        currentRound++;
        merkleRoots[currentRound] = _merkleRoot;
        totalDistributed[currentRound] = _totalPool;

        // Transfer dividend pool to contract
        paymentToken.safeTransferFrom(msg.sender, address(this), _totalPool);

        emit RoundStarted(currentRound, _merkleRoot, _totalPool);
    }

    /**
     * @notice Claim dividend for a specific round
     * @param round Distribution round number
     * @param amount Dividend amount to claim
     * @param merkleProof Proof of inclusion in Merkle tree
     */
    function claimDividend(
        uint256 round,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        require(round <= currentRound && round > 0, "Invalid round");
        require(!hasClaimed[round][msg.sender], "Already claimed");

        // Verify Merkle proof
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));
        require(MerkleProof.verify(merkleProof, merkleRoots[round], leaf), "Invalid proof");

        // Mark as claimed
        hasClaimed[round][msg.sender] = true;

        // Transfer dividend
        paymentToken.safeTransfer(msg.sender, amount);

        emit DividendClaimed(round, msg.sender, amount);
    }

    /**
     * @notice Check if an address can claim (verify proof without claiming)
     * @param round Distribution round
     * @param holder Holder address
     * @param amount Claimed amount
     * @param merkleProof Merkle proof
     * @return valid True if proof is valid and not yet claimed
     */
    function canClaim(
        uint256 round,
        address holder,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external view returns (bool valid) {
        if (round > currentRound || round == 0) return false;
        if (hasClaimed[round][holder]) return false;

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(holder, amount))));
        return MerkleProof.verify(merkleProof, merkleRoots[round], leaf);
    }

    /**
     * @notice Get distribution info for a round
     * @param round Round number
     * @return root Merkle root
     * @return total Total pool amount
     */
    function getRoundInfo(uint256 round) external view returns (bytes32 root, uint256 total) {
        return (merkleRoots[round], totalDistributed[round]);
    }
}
