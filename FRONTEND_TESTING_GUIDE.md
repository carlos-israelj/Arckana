# Frontend Testing Guide - Arckana

## 🚀 Frontend Server Status: ✅ RUNNING

Your Next.js development server is now running at:
**http://localhost:3000**

---

## Step 1: Open the Application

1. Open your web browser (Chrome, Firefox, Brave, etc.)
2. Navigate to: **http://localhost:3000**
3. You should see the Arckana homepage

---

## Step 2: Configure Your Wallet

### Add Arbitrum Sepolia Network

Before connecting, make sure your wallet has Arbitrum Sepolia configured:

#### MetaMask Configuration

1. Open MetaMask
2. Click on the network dropdown (top of the extension)
3. Click "Add Network" or "Add a network manually"
4. Enter the following details:

```
Network Name: Arbitrum Sepolia
RPC URL: https://sepolia-rollup.arbitrum.io/rpc
Chain ID: 421614
Currency Symbol: ETH
Block Explorer: https://sepolia.arbiscan.io/
```

5. Click "Save"

### Get Test ETH

You'll need some Arbitrum Sepolia ETH for gas fees:

1. Go to: https://faucet.quicknode.com/arbitrum/sepolia
2. Or: https://www.alchemy.com/faucets/arbitrum-sepolia
3. Enter your wallet address
4. Request test ETH

---

## Step 3: Connect Your Wallet

1. Click the **"Connect Wallet"** button on the homepage
2. Select your wallet provider (MetaMask, WalletConnect, etc.)
3. Approve the connection in your wallet popup
4. Make sure you're on **Arbitrum Sepolia** network (Chain ID: 421614)
5. If prompted to switch networks, approve it

**Expected Result**: Your wallet address should appear in the top-right corner

---

## Step 4: Test Components

### 4.1 Protect Balance Component

This component allows token holders to encrypt their balance data.

**Test Steps**:
1. Navigate to the "Protect Balance" section
2. Enter a test balance (e.g., `1000000000`)
3. Click "Protect My Balance"
4. Review the transaction in your wallet
5. Approve the transaction

**Expected Result**:
- Transaction submitted successfully
- Protected data address returned
- Confirmation message displayed

**Troubleshooting**:
- If you see errors, check browser console (F12)
- Make sure you have ETH for gas fees
- Verify you're on Arbitrum Sepolia network

### 4.2 Distribution Status Component

This component shows the current distribution round status.

**Test Steps**:
1. Navigate to "Distribution Status" section
2. Component should display:
   - Current round number
   - Merkle root (if available)
   - Total distributed amount (if available)

**Expected Result**:
- Current round: `0` (if no rounds started yet)
- Or current round details if distribution already started

### 4.3 Claim Dividend Component

This component allows holders to claim their dividends.

**Test Steps**:
1. Navigate to "Claim Dividend" section
2. If a distribution round is active:
   - Enter round number
   - Enter your entitled amount
   - Enter Merkle proof (comma-separated hashes)
3. Click "Claim Dividend"

**Expected Result**:
- Transaction submitted
- Dividend transferred to wallet
- Gas may be sponsored by Paymaster

**Note**: This requires an active distribution round with a published Merkle root.

---

## Step 5: Check Browser Console

Open Developer Tools (F12) and check for:

### Expected Messages
```
✅ Wallet connected: 0x...
✅ Network: Arbitrum Sepolia (421614)
✅ Contracts loaded
```

### Common Errors to Check

#### Error: "Unsupported chain"
**Solution**: Switch to Arbitrum Sepolia in your wallet

#### Error: "Contract not found"
**Solution**: Verify .env.local has correct addresses
```bash
cat .env.local | grep ADDRESS
```

#### Error: "Insufficient funds"
**Solution**: Get test ETH from faucet

#### Error: "User rejected transaction"
**Solution**: Approve transaction in wallet popup

---

## Step 6: Verify Smart Contract Interactions

### Read Operations (No Gas Required)

Open browser console (F12) and run:

```javascript
// Check current round
console.log('Current round:', await window.ethereum.request({
  method: 'eth_call',
  params: [{
    to: '0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217',
    data: '0x8a19c8bc' // currentRound() selector
  }, 'latest']
}));
```

### Write Operations (Requires Gas)

Try interacting through the UI:
1. Protect Balance → Creates protected data
2. Claim Dividend → Claims entitled dividend

---

## Step 7: Monitor Network Activity

### In MetaMask
1. Click on "Activity" tab
2. You should see pending/confirmed transactions
3. Click on any transaction to view details

### On Arbiscan
1. Go to: https://sepolia.arbiscan.io/
2. Enter your wallet address
3. View transaction history
4. Click on any transaction to see details

---

## Step 8: Test Error Handling

Try these scenarios to test robustness:

### Test 1: Wrong Network
1. Switch to Ethereum Mainnet in MetaMask
2. Try to interact with the app
3. **Expected**: Error message or prompt to switch networks

### Test 2: No Wallet Connected
1. Disconnect wallet
2. Try to use a component
3. **Expected**: Prompt to connect wallet

### Test 3: Insufficient Balance
1. Try to claim more than entitled
2. **Expected**: Transaction reverts with error

---

## Checklist de Pruebas

### Básico
- [ ] Frontend carga correctamente en localhost:3000
- [ ] Página principal se ve bien (sin errores de layout)
- [ ] Botones y componentes son visibles

### Conexión de Wallet
- [ ] Botón "Connect Wallet" aparece
- [ ] Click en "Connect Wallet" abre popup de wallet
- [ ] Wallet se conecta exitosamente
- [ ] Dirección de wallet aparece en la UI
- [ ] Red correcta (Arbitrum Sepolia) seleccionada

### Componentes
- [ ] ProtectBalance componente se renderiza
- [ ] DistributionStatus componente se renderiza
- [ ] ClaimDividend componente se renderiza
- [ ] Formularios tienen campos y botones

### Interacciones
- [ ] Puede escribir en inputs
- [ ] Botones responden a clicks
- [ ] Transacciones se crean (aunque fallen sin setup completo)
- [ ] Mensajes de error/éxito aparecen

### Console
- [ ] No hay errores de TypeScript
- [ ] No hay errores de importación
- [ ] Warnings son solo informativos (no críticos)

---

## Troubleshooting Common Issues

### Issue: "Cannot read properties of undefined"
**Cause**: Component trying to access wallet before connection
**Fix**: Always check wallet connection status before rendering

### Issue: "Network mismatch"
**Cause**: Wrong network selected
**Fix**: Switch to Arbitrum Sepolia (421614)

### Issue: "Transaction reverted"
**Cause**: Contract call failed (various reasons)
**Fix**:
1. Check contract addresses in .env.local
2. Verify you're calling the right function
3. Check function parameters

### Issue: Page won't load
**Cause**: Next.js compilation error
**Fix**:
1. Check terminal for errors
2. Look for TypeScript errors
3. Restart dev server: `npm run dev`

### Issue: Styles not loading
**Cause**: Tailwind CSS not configured
**Fix**: Check `tailwind.config.js` exists and is correct

---

## Environment Variables Verification

Your `.env.local` should have:

```env
# Wallet Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Smart Contracts (Arbitrum Sepolia)
NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS=0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
NEXT_PUBLIC_DIVIDEND_POOL_ADDRESS=0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D

# iExec Configuration
NEXT_PUBLIC_IAPP_ADDRESS=0x4dF342F232BD89705090c00081924555E849FDb5

# Network Configuration
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_IEXEC_CHAIN_ID=421614
```

Verify with:
```bash
cat .env.local
```

---

## Next Steps After Testing

Once frontend testing is complete:

1. **Document Issues** - Note any bugs or improvements
2. **Fix Critical Bugs** - Address any blocking issues
3. **Polish UI** - Improve styling if needed
4. **Prepare for Deployment** - Get ready for Vercel

---

## Deployment to Vercel (After Testing)

When ready to deploy:

### Prerequisites
- GitHub account
- Push code to GitHub repository
- Vercel account (free)

### Steps
1. Go to https://vercel.com/
2. Click "Import Project"
3. Connect your GitHub repository
4. Vercel auto-detects Next.js
5. Add environment variables from `.env.local`
6. Click "Deploy"
7. Wait 2-3 minutes for build
8. Get your live URL: `https://arckana.vercel.app`

---

## Testing Summary Template

After testing, fill out this summary:

```markdown
## Frontend Testing Results

**Date**: 2026-02-01
**Tester**: [Your name]
**Environment**: Windows/Mac/Linux + [Browser]

### What Worked ✅
- [ ] Page loads
- [ ] Wallet connects
- [ ] Components render
- [ ] Buttons clickable
- [ ] Transactions created

### Issues Found ❌
1. [Issue description]
2. [Issue description]

### Improvements Needed 💡
1. [Improvement idea]
2. [Improvement idea]

### Overall Assessment
- Ready for deployment: YES / NO
- Blocker issues: [List if any]
- Nice-to-have improvements: [List]
```

---

## Support & Resources

### If You Get Stuck
1. Check browser console (F12) for errors
2. Check terminal where `npm run dev` is running
3. Review component source code in `src/components/`
4. Check Next.js docs: https://nextjs.org/docs

### Useful Commands
```bash
# Restart dev server
npm run dev

# Check for TypeScript errors
npm run build

# View environment variables
cat .env.local

# Check logs
# (in terminal where npm run dev is running)
```

---

## Ready to Test!

**Your frontend server is running at: http://localhost:3000**

Open your browser and start testing! 🚀

**Pro Tip**: Keep browser console open (F12) to see real-time logs and errors.

---

**Last Updated**: 2026-02-01
**Server Status**: ✅ Running
**Ready for**: Testing
