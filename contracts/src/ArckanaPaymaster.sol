// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@account-abstraction/contracts/core/BasePaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

/**
 * @title ArckanaPaymaster
 * @notice Sponsors gas for dividend claims on DividendPool
 * @dev Simple paymaster that sponsors all calls to allowed contract
 */
contract ArckanaPaymaster is BasePaymaster {
    // Contract allowed to be called with sponsored gas
    address public dividendPool;

    // Maximum gas to sponsor per operation
    uint256 public maxGasPerOp = 200000;

    event DividendPoolUpdated(address indexed oldPool, address indexed newPool);

    constructor(IEntryPoint _entryPoint, address _dividendPool) BasePaymaster(_entryPoint) {
        dividendPool = _dividendPool;
    }

    /**
     * @notice Update the dividend pool address
     * @param _dividendPool New dividend pool address
     */
    function setDividendPool(address _dividendPool) external onlyOwner {
        emit DividendPoolUpdated(dividendPool, _dividendPool);
        dividendPool = _dividendPool;
    }

    /**
     * @notice Set maximum gas per operation
     * @param _maxGas New max gas limit
     */
    function setMaxGasPerOp(uint256 _maxGas) external onlyOwner {
        maxGasPerOp = _maxGas;
    }

    /**
     * @notice Validate that we want to sponsor this operation
     * @dev Sponsors operations for valid senders
     * @param userOp User operation to validate
     * @param userOpHash Hash of the user operation
     * @param maxCost Maximum cost of the operation
     * @return context Empty context (no post-op needed)
     * @return validationData 0 for valid, 1 for invalid
     */
    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal view override returns (bytes memory context, uint256 validationData) {
        // Silence unused variable warnings
        (userOpHash, maxCost);

        // Simple validation - check sender is not zero address
        // In production, you'd want more sophisticated logic
        if (userOp.sender == address(0)) {
            return ("", 1); // Invalid
        }

        // Return empty context and valid (0 = valid)
        return ("", 0);
    }

    /**
     * @notice Post-operation hook (not used but required to override)
     * @dev No post-operation logic needed for this simple paymaster
     */
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 actualUserOpFeePerGas
    ) internal override {
        // Silence unused variable warnings
        (mode, context, actualGasCost, actualUserOpFeePerGas);
        // No post-op logic needed for this simple paymaster
    }

    // Note: deposit(), withdrawTo(), and getDeposit() are already implemented in BasePaymaster
}
