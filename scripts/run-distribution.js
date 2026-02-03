#!/usr/bin/env node
/**
 * Arckana Distribution Runner
 *
 * This script executes the full dividend distribution flow:
 * 1. Fetches all protected balances that granted access to the iApp
 * 2. Runs the iApp in TEE to calculate dividends and generate Merkle tree
 * 3. Publishes the Merkle root to DividendPool contract
 *
 * Usage:
 *   node scripts/run-distribution.js <total_pool_amount>
 *
 * Example:
 *   node scripts/run-distribution.js 1000000000
 *   (distributes 1000 USDC with 6 decimals)
 *
 * Requirements:
 *   - .env file with ADMIN_PRIVATE_KEY
 *   - Protected data already granted access to iApp
 *   - Sufficient balance in PaymentToken for distribution
 */

const { ethers } = require('ethers');
const { IExecDataProtector } = require('@iexec/dataprotector');

// Contract addresses (Arbitrum Sepolia)
const CONTRACTS = {
  dividendPool: '0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217',
  paymentToken: '0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D',
  iappAddress: '0x4dF342F232BD89705090c00081924555E849FDb5',
};

// DividendPool ABI (minimal)
const DIVIDEND_POOL_ABI = [
  'function startDistributionRound(bytes32 merkleRoot, uint256 totalPool) external',
  'function currentRound() external view returns (uint256)',
  'event RoundStarted(uint256 indexed round, bytes32 merkleRoot, uint256 totalPool)',
];

// PaymentToken ABI (minimal)
const PAYMENT_TOKEN_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
];

async function main() {
  try {
    // Get total pool from command line
    const totalPool = process.argv[2];
    if (!totalPool) {
      console.error('Usage: node run-distribution.js <total_pool_amount>');
      console.error('Example: node run-distribution.js 1000000000');
      process.exit(1);
    }

    console.log('\n🚀 Arckana Distribution Runner\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');

    // Load private key from environment
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ Error: ADMIN_PRIVATE_KEY not found in environment');
      console.error('Please set it in your .env file or export it:');
      console.error('export ADMIN_PRIVATE_KEY=0x...');
      process.exit(1);
    }

    const signer = new ethers.Wallet(privateKey, provider);
    const adminAddress = await signer.getAddress();

    console.log('📋 Configuration:');
    console.log(`   Admin Address: ${adminAddress}`);
    console.log(`   iApp Address: ${CONTRACTS.iappAddress}`);
    console.log(`   Total Pool: ${totalPool} (${ethers.formatUnits(totalPool, 6)} USDC)`);
    console.log();

    // Initialize contracts
    const dividendPool = new ethers.Contract(CONTRACTS.dividendPool, DIVIDEND_POOL_ABI, signer);
    const paymentToken = new ethers.Contract(CONTRACTS.paymentToken, PAYMENT_TOKEN_ABI, signer);

    // Step 1: Check admin has enough payment tokens
    console.log('💰 Step 1: Checking PaymentToken balance...');
    const balance = await paymentToken.balanceOf(adminAddress);
    console.log(`   Balance: ${ethers.formatUnits(balance, 6)} USDC`);

    if (balance < BigInt(totalPool)) {
      console.error(`   ❌ Insufficient balance. Need ${ethers.formatUnits(totalPool, 6)} USDC`);
      process.exit(1);
    }
    console.log('   ✅ Sufficient balance\n');

    // Step 2: Approve DividendPool to spend PaymentToken
    console.log('🔓 Step 2: Approving DividendPool...');
    const approveTx = await paymentToken.approve(CONTRACTS.dividendPool, totalPool);
    console.log(`   Transaction: ${approveTx.hash}`);
    await approveTx.wait();
    console.log('   ✅ Approval confirmed\n');

    // Step 3: Fetch protected data with access granted
    console.log('🔍 Step 3: Fetching protected data...');
    console.log('   Note: This requires DataProtector SDK integration');
    console.log('   For now, using manual test data\n');

    // TODO: Replace with actual DataProtector query
    // const dataProtector = new IExecDataProtector(signer);
    // const protectedDataList = await dataProtector.fetchGrantedAccess({
    //   authorizedApp: CONTRACTS.iappAddress,
    // });

    // Step 4: Run iApp with protected data
    console.log('⚙️  Step 4: Running iApp in TEE...');
    console.log('   Note: Full iApp execution requires DataProtector integration');
    console.log('   Using pre-computed Merkle root from test execution\n');

    // TODO: Replace with actual iApp execution
    // const taskId = await dataProtector.processData({
    //   app: CONTRACTS.iappAddress,
    //   dataset: protectedDataList,
    //   params: { totalPool },
    // });
    // const result = await dataProtector.waitForTask(taskId);
    // const merkleRoot = result.merkleRoot;

    // For demo: use pre-computed Merkle root from test
    const merkleRoot = '0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494';
    console.log(`   Merkle Root: ${merkleRoot}\n`);

    // Step 5: Publish Merkle root to DividendPool
    console.log('📤 Step 5: Publishing distribution round...');
    const currentRound = await dividendPool.currentRound();
    console.log(`   Current Round: ${currentRound}`);
    console.log(`   Starting Round: ${Number(currentRound) + 1}`);

    const tx = await dividendPool.startDistributionRound(merkleRoot, totalPool);
    console.log(`   Transaction: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`   ✅ Distribution round started!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}\n`);

    // Step 6: Verify round was created
    const newRound = await dividendPool.currentRound();
    console.log('✅ Step 6: Verification');
    console.log(`   New Round: ${newRound}`);
    console.log(`   Merkle Root: ${merkleRoot}`);
    console.log(`   Total Pool: ${ethers.formatUnits(totalPool, 6)} USDC\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Distribution Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Round: ${newRound}`);
    console.log(`   Amount: ${ethers.formatUnits(totalPool, 6)} USDC`);
    console.log(`   Transaction: https://sepolia.arbiscan.io/tx/${tx.hash}\n`);
    console.log('💡 Next Steps:');
    console.log('   1. Token holders can now claim their dividends');
    console.log('   2. Check frontend at https://arckana.lat/');
    console.log('   3. Verify on block explorer\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    process.exit(1);
  }
}

// Run the script
main();
