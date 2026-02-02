// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/ArckanaToken.sol";
import "../src/DividendPool.sol";
import "../src/ArckanaPaymaster.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address entryPoint = vm.envAddress("ENTRYPOINT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ArckanaToken (mock treasury token)
        ArckanaToken arckanaToken = new ArckanaToken();
        console.log("ArckanaToken deployed at:", address(arckanaToken));

        // Deploy payment token (for dividends) - in production, this would be USDC
        // For demo, we'll deploy another token to represent USDC
        ArckanaToken paymentToken = new ArckanaToken();
        console.log("PaymentToken deployed at:", address(paymentToken));

        // Deploy DividendPool
        DividendPool dividendPool = new DividendPool(address(paymentToken));
        console.log("DividendPool deployed at:", address(dividendPool));

        // Deploy ArckanaPaymaster
        ArckanaPaymaster paymaster = new ArckanaPaymaster(
            IEntryPoint(entryPoint),
            address(dividendPool)
        );
        console.log("ArckanaPaymaster deployed at:", address(paymaster));

        // Fund paymaster with some ETH for gas sponsorship
        paymaster.deposit{value: 0.1 ether}();
        console.log("Paymaster funded with 0.1 ETH");

        vm.stopBroadcast();

        // Output deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("ArckanaToken:", address(arckanaToken));
        console.log("PaymentToken:", address(paymentToken));
        console.log("DividendPool:", address(dividendPool));
        console.log("ArckanaPaymaster:", address(paymaster));
    }
}
