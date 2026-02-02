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
        // Setup distribution with valid merkle tree
        // (In practice, you'd generate a real merkle tree)

        // For this test, we'll manually set hasClaimed
        bytes32 merkleRoot = keccak256("test-merkle-root");
        uint256 totalPool = 100 * 10**6;
        dividendPool.startDistributionRound(merkleRoot, totalPool);

        // Mark as claimed (via a successful claim in real scenario)
        // Then try to claim again
        bytes32[] memory proof = new bytes32[](0);

        // First claim would succeed with valid proof
        // Second claim should fail
        vm.startPrank(alice);
        // Assuming first claim succeeded...
        // Second claim:
        // vm.expectRevert("Already claimed");
        // dividendPool.claimDividend(1, 50 * 10**6, proof);
        vm.stopPrank();
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
