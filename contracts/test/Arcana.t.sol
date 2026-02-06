// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/ArckanaToken.sol";
import "../src/DividendPool.sol";

contract ArckanaTest is Test {
    ArckanaToken public arckanaToken;
    ArckanaToken public paymentToken;
    DividendPool public dividendPool;

    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);

    function setUp() public {
        // Deploy tokens
        arckanaToken = new ArckanaToken();
        paymentToken = new ArckanaToken();

        // Deploy dividend pool
        dividendPool = new DividendPool(address(paymentToken));

        // Mint tokens to holders
        arckanaToken.mint(alice, 1000 * 10**6);
        arckanaToken.mint(bob, 500 * 10**6);
        arckanaToken.mint(charlie, 500 * 10**6);

        // Mint payment tokens to pool operator
        paymentToken.mint(owner, 1000 * 10**6);
        paymentToken.approve(address(dividendPool), type(uint256).max);
    }

    function testMintTokens() public {
        assertEq(arckanaToken.balanceOf(alice), 1000 * 10**6);
        assertEq(arckanaToken.balanceOf(bob), 500 * 10**6);
    }

    function testStartDistributionRound() public {
        bytes32 merkleRoot = keccak256("test-merkle-root");
        uint256 totalPool = 100 * 10**6;

        dividendPool.startDistributionRound(merkleRoot, totalPool);

        assertEq(dividendPool.currentRound(), 1);
        assertEq(dividendPool.merkleRoots(1), merkleRoot);
        assertEq(dividendPool.totalDistributed(1), totalPool);
    }

    function testCannotStartWithZeroRoot() public {
        bytes32 zeroRoot = bytes32(0);
        uint256 totalPool = 100 * 10**6;

        vm.expectRevert("Invalid merkle root");
        dividendPool.startDistributionRound(zeroRoot, totalPool);
    }

    function testClaimDividend() public {
        // Setup distribution
        bytes32 merkleRoot = keccak256("test-merkle-root");
        uint256 totalPool = 100 * 10**6;
        dividendPool.startDistributionRound(merkleRoot, totalPool);

        // Simulate valid proof (this is simplified - real proof would be different)
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = keccak256("sibling");

        // This will fail because proof is invalid, but tests the revert
        vm.prank(alice);
        vm.expectRevert("Invalid proof");
        dividendPool.claimDividend(1, 50 * 10**6, proof);
    }

    function testCannotClaimTwice() public {
        // Setup distribution with real merkle tree using OpenZeppelin's format
        // Leaf format: keccak256(bytes.concat(keccak256(abi.encode(address, amount))))
        bytes32 aliceLeaf = keccak256(bytes.concat(keccak256(abi.encode(alice, uint256(50 * 10**6)))));
        bytes32 bobLeaf = keccak256(bytes.concat(keccak256(abi.encode(bob, uint256(30 * 10**6)))));
        bytes32 charlieLeaf = keccak256(bytes.concat(keccak256(abi.encode(charlie, uint256(20 * 10**6)))));

        // Build merkle tree
        bytes32 node1 = _hashPair(aliceLeaf, bobLeaf);
        bytes32 merkleRoot = _hashPair(node1, charlieLeaf);

        uint256 totalPool = 100 * 10**6;
        dividendPool.startDistributionRound(merkleRoot, totalPool);

        // Valid proof for alice
        bytes32[] memory proof = new bytes32[](2);
        proof[0] = bobLeaf;
        proof[1] = charlieLeaf;

        // First claim succeeds
        vm.prank(alice);
        dividendPool.claimDividend(1, 50 * 10**6, proof);

        // Verify claim was successful
        assertTrue(dividendPool.hasClaimed(1, alice));

        // Second claim fails
        vm.prank(alice);
        vm.expectRevert("Already claimed");
        dividendPool.claimDividend(1, 50 * 10**6, proof);
    }

    function testMultipleHoldersClaimSuccessfully() public {
        // Create merkle tree with 3 holders using OpenZeppelin format
        bytes32 aliceLeaf = keccak256(bytes.concat(keccak256(abi.encode(alice, uint256(50 * 10**6)))));
        bytes32 bobLeaf = keccak256(bytes.concat(keccak256(abi.encode(bob, uint256(30 * 10**6)))));
        bytes32 charlieLeaf = keccak256(bytes.concat(keccak256(abi.encode(charlie, uint256(20 * 10**6)))));

        bytes32 node1 = _hashPair(aliceLeaf, bobLeaf);
        bytes32 merkleRoot = _hashPair(node1, charlieLeaf);

        uint256 totalPool = 100 * 10**6;
        dividendPool.startDistributionRound(merkleRoot, totalPool);

        // Alice claims
        bytes32[] memory aliceProof = new bytes32[](2);
        aliceProof[0] = bobLeaf;
        aliceProof[1] = charlieLeaf;

        uint256 aliceBalanceBefore = paymentToken.balanceOf(alice);
        vm.prank(alice);
        dividendPool.claimDividend(1, 50 * 10**6, aliceProof);
        assertEq(paymentToken.balanceOf(alice), aliceBalanceBefore + 50 * 10**6);

        // Bob claims
        bytes32[] memory bobProof = new bytes32[](2);
        bobProof[0] = aliceLeaf;
        bobProof[1] = charlieLeaf;

        uint256 bobBalanceBefore = paymentToken.balanceOf(bob);
        vm.prank(bob);
        dividendPool.claimDividend(1, 30 * 10**6, bobProof);
        assertEq(paymentToken.balanceOf(bob), bobBalanceBefore + 30 * 10**6);

        // Charlie claims
        bytes32[] memory charlieProof = new bytes32[](1);
        charlieProof[0] = node1;

        uint256 charlieBalanceBefore = paymentToken.balanceOf(charlie);
        vm.prank(charlie);
        dividendPool.claimDividend(1, 20 * 10**6, charlieProof);
        assertEq(paymentToken.balanceOf(charlie), charlieBalanceBefore + 20 * 10**6);
    }

    function testCannotClaimWithWrongAmount() public {
        bytes32[] memory leaves = new bytes32[](1);
        leaves[0] = keccak256(abi.encodePacked(alice, uint256(50 * 10**6)));
        bytes32 merkleRoot = leaves[0];

        uint256 totalPool = 50 * 10**6;
        dividendPool.startDistributionRound(merkleRoot, totalPool);

        // Try to claim wrong amount
        bytes32[] memory proof = new bytes32[](0);
        vm.prank(alice);
        vm.expectRevert("Invalid proof");
        dividendPool.claimDividend(1, 100 * 10**6, proof); // Wrong amount!
    }

    function testCannotClaimFromInvalidRound() public {
        bytes32 merkleRoot = keccak256("test-merkle-root");
        bytes32[] memory proof = new bytes32[](0);

        // No round started yet
        vm.prank(alice);
        vm.expectRevert("Invalid round");
        dividendPool.claimDividend(999, 50 * 10**6, proof);
    }

    function testMultipleRounds() public {
        // Round 1
        bytes32 merkleRoot1 = keccak256("merkle-root-1");
        dividendPool.startDistributionRound(merkleRoot1, 100 * 10**6);
        assertEq(dividendPool.currentRound(), 1);

        // Round 2
        bytes32 merkleRoot2 = keccak256("merkle-root-2");
        dividendPool.startDistributionRound(merkleRoot2, 200 * 10**6);
        assertEq(dividendPool.currentRound(), 2);

        // Verify both roots are stored
        assertEq(dividendPool.merkleRoots(1), merkleRoot1);
        assertEq(dividendPool.merkleRoots(2), merkleRoot2);
        assertEq(dividendPool.totalDistributed(1), 100 * 10**6);
        assertEq(dividendPool.totalDistributed(2), 200 * 10**6);
    }

    function testInsufficientAllowance() public {
        // Reset approval
        paymentToken.approve(address(dividendPool), 0);

        bytes32 merkleRoot = keccak256("test-merkle-root");
        uint256 totalPool = 100 * 10**6;

        // Should revert when trying to transfer without approval
        vm.expectRevert();
        dividendPool.startDistributionRound(merkleRoot, totalPool);
    }

    // Helper function for merkle tree
    function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    function testOnlyOperatorCanStartRound() public {
        bytes32 merkleRoot = keccak256("test-merkle-root");
        uint256 totalPool = 100 * 10**6;

        vm.prank(alice);
        vm.expectRevert("Not authorized");
        dividendPool.startDistributionRound(merkleRoot, totalPool);
    }

    function testSetOperator() public {
        dividendPool.setOperator(alice);
        assertEq(dividendPool.operator(), alice);

        // Now alice can start rounds
        paymentToken.mint(alice, 100 * 10**6);
        vm.startPrank(alice);
        paymentToken.approve(address(dividendPool), type(uint256).max);

        bytes32 merkleRoot = keccak256("test-merkle-root");
        dividendPool.startDistributionRound(merkleRoot, 100 * 10**6);
        vm.stopPrank();

        assertEq(dividendPool.currentRound(), 1);
    }
}
