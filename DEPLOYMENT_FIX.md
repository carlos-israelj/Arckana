# iApp Deployment Fix Guide

## Current Status

According to `DEPLOYED_ADDRESSES.md`:
- ✅ Smart contracts deployed on Arbitrum Sepolia
- ✅ Docker image published: `carlosisraelj/arckana-dividend-calculator:2`
- ⏳ **TEE transformation pending** (iExec service experiencing issues)
- ⏳ On-chain deployment pending

## Common iApp Deployment Issues & Solutions

### Issue 1: TEE Transformation Service Timeout

**Symptoms:**
- `iapp deploy` hangs during "Transforming to TEE..."
- Error: "TEE transformation service unavailable"

**Solution:**
```bash
# Try with experimental TDX flag
cd Arcana/iapp
EXPERIMENTAL_TDX_APP=true iapp deploy --chain arbitrum-sepolia-testnet
```

### Issue 2: Wallet Not Configured

**Symptoms:**
- Error: "No wallet found"
- Error: "Private key not found"

**Solution:**
```bash
cd Arcana/iapp

# Check if wallet exists
iapp wallet select

# If not, import from iapp.config.json
iapp wallet import 86025bec599bee8a7302c836abb73aadbedd2df0d7f771b7f850efd65294ea03
```

### Issue 3: Insufficient RLC Balance

**Symptoms:**
- Error: "Insufficient balance"
- Error: "Not enough RLC"

**Solution:**
1. Get RLC from faucet: https://explorer.iex.ec/arbitrum-mainnet/faucet
2. Bridge to Arbitrum Sepolia: https://portal.arbitrum.io/bridge
3. Check balance: https://explorer.iex.ec/arbitrum-sepolia-testnet

### Issue 4: Docker Image Not Found

**Symptoms:**
- Error: "Image not found on DockerHub"
- Error: "Failed to pull image"

**Verification:**
```bash
# Check if image exists on DockerHub
# Visit: https://hub.docker.com/r/carlosisraelj/arckana-dividend-calculator

# Re-build and push if needed
cd Arcana/iapp
docker build -t carlosisraelj/arckana-dividend-calculator:latest .
docker push carlosisraelj/arckana-dividend-calculator:latest
```

### Issue 5: Invalid iexec.json Configuration

**Symptoms:**
- Error: "Invalid app configuration"
- Deployment starts but fails

**Fix:**

The `iexec.json` has placeholder values. Update it properly:

```json
{
  "description": "Arckana - Confidential Dividend Distribution Calculator",
  "license": "MIT",
  "author": "Arckana Team",
  "app": {
    "owner": "0x648a3e5510f55B4995fA5A22cCD62e2586ACb901",
    "name": "arckana-dividend-calculator",
    "type": "DOCKER",
    "multiaddr": "docker.io/carlosisraelj/arckana-dividend-calculator:2",
    "checksum": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "mrenclave": {
      "provider": "SCONE",
      "version": "v5",
      "entrypoint": "python /app/app.py",
      "heapSize": 1073741824,
      "fingerprint": ""
    }
  }
}
```

## Step-by-Step Deployment Process

### Step 1: Verify Prerequisites

```bash
cd Arcana/iapp

# Check iApp CLI
iapp --version  # Should be >= 1.3.0

# Check Docker image exists
docker pull carlosisraelj/arckana-dividend-calculator:2

# Check wallet
iapp wallet select
```

### Step 2: Test Locally First

```bash
# Create test inputs
mkdir -p input
cat > input/protectedData.json << 'EOF'
[
  {
    "holder": "0x1234567890123456789012345678901234567890",
    "balance": 50000000000
  },
  {
    "holder": "0x2345678901234567890123456789012345678901",
    "balance": 30000000000
  },
  {
    "holder": "0x3456789012345678901234567890123456789012",
    "balance": 20000000000
  }
]
EOF

cat > input/args.txt << 'EOF'
1000000000
EOF

# Run local test
iapp test

# Check output
cat output/result.json
```

Expected output should include:
- `"success": true`
- `"merkle_root": "0x..."`
- `"distribution": [...]` with proofs

### Step 3: Deploy with Proper Configuration

**Option A: Standard SGX Deployment (Recommended)**

```bash
cd Arcana/iapp

# Deploy to Arbitrum Sepolia
iapp deploy --chain arbitrum-sepolia-testnet
```

**Option B: Experimental TDX Deployment (If SGX fails)**

```bash
cd Arcana/iapp

# Deploy with TDX flag
EXPERIMENTAL_TDX_APP=true iapp deploy --chain arbitrum-sepolia-testnet
```

### Step 4: Verify Deployment

```bash
# Check cache for deployment info
cat cache/arbitrum-sepolia-testnet/deployments.json

# Check on explorer
# Visit: https://explorer.iex.ec/arbitrum-sepolia-testnet
# Search for your app address
```

### Step 5: Update Frontend Configuration

Once deployed, update `frontend/.env.local`:

```bash
# Get app address from deployment
APP_ADDRESS=$(cat cache/arbitrum-sepolia-testnet/deployments.json | grep -o '"address":"0x[^"]*"' | cut -d'"' -f4)

echo "NEXT_PUBLIC_IAPP_ADDRESS=$APP_ADDRESS"
```

Add to `frontend/.env.local`:
```
NEXT_PUBLIC_IAPP_ADDRESS=<your-deployed-app-address>
```

## Alternative: Manual iExec SDK Deployment

If `iapp deploy` continues to fail, you can deploy manually using the iExec SDK:

```bash
# Install iExec SDK
npm install -g iexec

# Initialize iExec (in iapp directory)
cd Arcana/iapp
iexec init --skip-wallet

# Import wallet
iexec wallet import 86025bec599bee8a7302c836abb73aadbedd2df0d7f771b7f850efd65294ea03

# Create app
iexec app init

# Deploy app
iexec app deploy --chain arbitrum-sepolia-testnet
```

## Debugging Failed Deployments

```bash
# Check wallet balance
iexec account show --chain arbitrum-sepolia-testnet

# Check app status
iexec app show <app-address> --chain arbitrum-sepolia-testnet

# View logs (if available)
ls -la ~/.iexec/
```

## Known Issues & Workarounds

### Issue: "TEE service temporarily unavailable"

This is a known issue with iExec's TEE transformation service. Solutions:

1. **Wait and retry** (15-30 minutes)
2. **Try TDX mode**: `EXPERIMENTAL_TDX_APP=true iapp deploy`
3. **Contact iExec support** on Discord: https://discord.gg/iexec

### Issue: "Network connection timeout"

```bash
# Check network connectivity
ping explorer.iex.ec

# Try with increased timeout
export REQUEST_TIMEOUT=120000
iapp deploy --chain arbitrum-sepolia-testnet
```

### Issue: "Docker login failed"

```bash
# Re-login to DockerHub
docker logout
docker login -u carlosisraelj

# Update token in iapp.config.json
```

## Checklist Before Deployment

- [ ] iApp CLI installed (`iapp --version`)
- [ ] Wallet imported and has RLC balance
- [ ] Docker image built and pushed to DockerHub
- [ ] `iapp.config.json` configured correctly
- [ ] Local test passes (`iapp test`)
- [ ] Connected to Arbitrum Sepolia
- [ ] iexec.json updated with correct values

## Next Steps After Successful Deployment

1. **Save app address** from deployment output
2. **Update frontend** `.env.local` with `NEXT_PUBLIC_IAPP_ADDRESS`
3. **Test run** the iApp: `iapp run <app-address> --chain arbitrum-sepolia-testnet`
4. **Publish app order** (if not using DataProtector auto-orders)
5. **Test full flow** from frontend

## Support Resources

- **iExec Docs**: https://docs.iex.ec/
- **iApp Guide**: https://docs.iex.ec/guides/build-iapp/deploy-&-run
- **Discord**: https://discord.gg/iexec (#hack4privacy channel)
- **Explorer**: https://explorer.iex.ec/arbitrum-sepolia-testnet
- **GitHub Issues**: https://github.com/iExecBlockchainComputing/iexec-apps

---

**Last Updated**: 2026-02-01
**Project**: Arcana (Arckana) - iExec Hack4Privacy 2026
