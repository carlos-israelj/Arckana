// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArckanaToken
 * @notice Mock tokenized treasury fund (simulates BUIDL)
 * @dev 1 token = $1 USD, represents share in treasury fund
 */
contract ArckanaToken is ERC20, Ownable {
    uint8 private constant DECIMALS = 6; // Same as USDC/BUIDL

    constructor() ERC20("Arckana Treasury Token", "ARCKANA") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mint tokens to simulate fund deposits
     * @param to Recipient address
     * @param amount Amount to mint (6 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Batch mint for demo purposes
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
}
