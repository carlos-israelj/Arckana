// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/ArckanaToken.sol";
import "../src/DividendPool.sol";
import "../src/ArckanaPaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address entryPoint = vm.envAddress("ENTRYPOINT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Arckana Token (treasury token)
        ArckanaToken arckanaToken = new ArckanaToken();
        console.log("ArckanaToken deployed at:", address(arckanaToken));

        // 2. Deploy Payment Token (for dividend payouts - another instance of ArckanaToken for testing)
        ArckanaToken paymentToken = new ArckanaToken();
        console.log("PaymentToken deployed at:", address(paymentToken));

        // 3. Deploy Dividend Pool
        DividendPool dividendPool = new DividendPool(address(paymentToken));
        console.log("DividendPool deployed at:", address(dividendPool));

        // 4. Deploy Paymaster (for gasless transactions)
        ArckanaPaymaster paymaster = new ArckanaPaymaster(IEntryPoint(entryPoint), address(dividendPool));
        console.log("ArckanaPaymaster deployed at:", address(paymaster));

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Update these addresses in frontend/src/lib/contracts.ts:");
        console.log("NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS=", address(arckanaToken));
        console.log("NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=", address(paymentToken));
        console.log("NEXT_PUBLIC_DIVIDEND_POOL_ADDRESS=", address(dividendPool));
        console.log("NEXT_PUBLIC_PAYMASTER_ADDRESS=", address(paymaster));
    }
}
