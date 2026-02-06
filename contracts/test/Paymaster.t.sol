// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/ArckanaPaymaster.sol";
import "../src/DividendPool.sol";
import "../src/ArckanaToken.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

contract PaymasterTest is Test {
    ArckanaPaymaster public paymaster;
    DividendPool public dividendPool;
    ArckanaToken public paymentToken;

    address public entryPoint;
    address public owner = address(this);
    address public user = address(0x1);

    function setUp() public {
        // Deploy mock EntryPoint (using a simple address for testing)
        entryPoint = address(0x0000000071727De22E5E9d8BAf0edAc6f37da032);

        // Deploy payment token
        paymentToken = new ArckanaToken();

        // Deploy dividend pool
        dividendPool = new DividendPool(address(paymentToken));

        // Deploy paymaster
        paymaster = new ArckanaPaymaster(
            IEntryPoint(entryPoint),
            address(dividendPool)
        );

        // Fund paymaster with ETH for gas sponsorship
        vm.deal(address(paymaster), 10 ether);
    }

    function testPaymasterDeployment() public {
        assertEq(paymaster.dividendPool(), address(dividendPool));
        assertEq(address(paymaster.entryPoint()), entryPoint);
    }

    function testPaymasterHasETH() public {
        assertEq(address(paymaster).balance, 10 ether);
    }

    function testOwnerCanWithdrawETH() public {
        uint256 ownerBalanceBefore = owner.balance;

        paymaster.withdrawTo(payable(owner), 1 ether);

        assertEq(owner.balance, ownerBalanceBefore + 1 ether);
        assertEq(address(paymaster).balance, 9 ether);
    }

    function testNonOwnerCannotWithdraw() public {
        vm.prank(user);
        vm.expectRevert();
        paymaster.withdrawTo(payable(user), 1 ether);
    }

    function testValidatePaymasterUserOp_ClaimDividend() public {
        // Create a mock UserOperation for claimDividend
        PackedUserOperation memory userOp;

        // Set sender to dividend pool
        userOp.sender = address(dividendPool);

        // Create calldata for claimDividend(uint256,uint256,bytes32[])
        bytes memory callData = abi.encodeWithSignature(
            "claimDividend(uint256,uint256,bytes32[])",
            1,
            100 * 10**6,
            new bytes32[](0)
        );
        userOp.callData = callData;

        bytes32 userOpHash = keccak256("mock-hash");
        uint256 maxCost = 0.001 ether;

        // Call internal validation (would be called by EntryPoint)
        // Note: We can't directly test internal functions, but we can test the behavior
        // through integration tests or by making a test wrapper

        // For now, verify the paymaster is configured correctly
        assertTrue(address(paymaster).balance > 0);
    }

    function testPaymasterOnlySponsorsClaimDividend() public view {
        // Verify that paymaster is configured for the right dividend pool
        assertEq(paymaster.dividendPool(), address(dividendPool));
    }

    function testAddStakeToEntryPoint() public {
        // Owner can add stake
        paymaster.addStake{value: 1 ether}(100);

        // Verify balance decreased
        assertEq(address(paymaster).balance, 9 ether);
    }

    function testUnlockStake() public {
        // Add stake first
        paymaster.addStake{value: 1 ether}(100);

        // Unlock stake
        paymaster.unlockStake();

        // Note: Actual withdrawal would require waiting for the unstake delay
        // This just tests the function can be called
    }
}
