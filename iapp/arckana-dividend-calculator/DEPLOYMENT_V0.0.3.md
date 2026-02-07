# iApp v0.0.3 Deployment Guide

**Date:** February 7, 2026
**Status:** ✅ Successfully Deployed
**Chain:** Arbitrum Sepolia Testnet

---

## Overview

This document details the deployment of Arckana Dividend Calculator iApp version 0.0.3, which fixed a critical data type mismatch bug in the TEE computation.

---

## Problem Identified

### Issue Description

In iApp v0.0.2, the application was failing during TEE execution with the following error:

```
Error loading DataProtector protected data: invalid literal for int() with base 10: ''
```

### Root Cause

**Data Type Mismatch:**
- **Frontend:** Protected balance data as `number`
  ```typescript
  balance: parseInt(balance) * 1000000  // Stored as JavaScript number
  ```

- **iApp:** Attempted to read balance as `string`
  ```python
  # ❌ BROKEN CODE (v0.0.2)
  balance_str = getValue('balance', 'string')  # Returns empty string ''
  balance = int(balance_str)  # ValueError!
  ```

### Impact

- All iApp executions failed at the protected data deserialization stage
- No dividend calculations could be performed
- Task would start but fail with TIMEOUT after attempting to read data

---

## Solution Implemented

### Code Fix

**File:** `src/app.py` (Line 162)

```python
# ✅ FIXED CODE (v0.0.3)
holder = getValue('holder', 'string')
balance = getValue('balance', 'number')  # Read as number directly
```

**Key Change:** Changed `getValue('balance', 'string')` to `getValue('balance', 'number')`

### Why This Works

The DataProtector SDK serializes JavaScript numbers as numeric types, not strings. The iApp deserializer must match the data type used during protection:

| Frontend Protection | iApp Deserialization | Result |
|---------------------|----------------------|--------|
| `balance: 1000000` (number) | `getValue('balance', 'string')` | ❌ Returns `''` |
| `balance: 1000000` (number) | `getValue('balance', 'number')` | ✅ Returns `1000000` |

---

## Deployment Process

### Step 1: Fix the Code

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana/iapp/arckana-dividend-calculator
```

Edit `src/app.py` line 162:
```python
balance = getValue('balance', 'number')
```

### Step 2: Build and Push Docker Image

```bash
docker build -t carlosisraelj/arckana-dividend-calculator:0.0.3 .
docker push carlosisraelj/arckana-dividend-calculator:0.0.3
```

**Result:**
```
✅ Pushed image carlosisraelj/arckana-dividend-calculator:0.0.3
Digest: sha256:ee5d6a66bc4c3671ff269f39046afe87269255635cb86030a560fdb50df567b9
```

### Step 3: Deploy with iApp Generator

The iApp Generator CLI handles:
- Sconification (TEE transformation)
- Fingerprint calculation
- On-chain deployment

```bash
iapp deploy
```

**Prompts:**
1. "Would you like to continue?" → `Y`
2. "What is the version of your iApp?" → `0.0.3`

**Output:**
```
✔ Docker image built (sha256:7f34bd582ea340ece5f29332272d9bf4317ba138a58a5234c54801e3fa665e99)
✔ Pushed image carlosisraelj/arckana-dividend-calculator:0.0.3 on dockerhub
✔ Pushed TEE image carlosisraelj/arckana-dividend-calculator:0.0.3-tee-scone-5.9.1-v16-prod-cecc9a96c6be
✔ TEE app deployed
✔ Deployment completed successfully
```

### Step 4: Publish App Order on Marketplace

Update `sign-and-publish-order.js` with new iApp address:

```javascript
const appOrder = await iexec.order.createApporder({
  app: '0xB5CED46207D14A976971C21F241F2c39a921755D',  // v0.0.3 address
  appprice: 0,
  volume: 1000000,
  tag: '0x0000000000000000000000000000000000000000000000000000000000000003',
  datasetrestrict: '0x0000000000000000000000000000000000000000',
  workerpoolrestrict: '0x0000000000000000000000000000000000000000',
  requesterrestrict: '0x0000000000000000000000000000000000000000',
});
```

Run the script:
```bash
node sign-and-publish-order.js
```

**Output:**
```
✅ Success!
Order hash: 0x512cbbe7fbb134463a00d92a3451eec89b0b779ccff417fa33bf9d46d032b1e7
Saved to orders.json
```

### Step 5: Verify Order on Marketplace

```bash
iexec orderbook app 0xB5CED46207D14A976971C21F241F2c39a921755D --chain arbitrum-sepolia-testnet
```

**Result:**
```
ℹ Apporders details (1 to 1 of 1):
- orderHash: 0x512cbbe7fbb134463a00d92a3451eec89b0b779ccff417fa33bf9d46d032b1e7
  price:     0
  remaining: 1000000
  tag:       0x0000000000000000000000000000000000000000000000000000000000000003
```

### Step 6: Update Frontend Configuration

**File:** `frontend/.env.local`

```env
# ---- iExec Configuration ----
# iApp v0.0.3 deployed on 2026-02-07 (with balance data type fix)
NEXT_PUBLIC_IAPP_ADDRESS=0xB5CED46207D14A976971C21F241F2c39a921755D
```

---

## Deployment Summary

### iApp v0.0.3 Details

| Property | Value |
|----------|-------|
| **iApp Address** | `0xB5CED46207D14A976971C21F241F2c39a921755D` |
| **Docker Image** | `carlosisraelj/arckana-dividend-calculator:0.0.3` |
| **TEE Image** | `carlosisraelj/arckana-dividend-calculator:0.0.3-tee-scone-5.9.1-v16-prod-cecc9a96c6be` |
| **Framework** | SCONE v5.9.1 |
| **Chain** | Arbitrum Sepolia (421614) |
| **Deployment Date** | 2026-02-07 |

### App Order Details

| Property | Value |
|----------|-------|
| **Order Hash** | `0x512cbbe7fbb134463a00d92a3451eec89b0b779ccff417fa33bf9d46d032b1e7` |
| **Price** | 0 nRLC (free) |
| **Volume** | 1,000,000 executions |
| **TEE Tag** | `0x03` (SCONE required) |
| **Access** | Public (no restrictions) |

### Previous Versions

| Version | Address | Status | Issue |
|---------|---------|--------|-------|
| v0.0.1 | N/A | Deprecated | Initial version |
| v0.0.2 | `0x02Bf69af102322c8c27E8D350a1541E61B6959d8` | ❌ Broken | Data type mismatch bug |
| v0.0.3 | `0xB5CED46207D14A976971C21F241F2c39a921755D` | ✅ Active | Fixed data type reading |

---

## Technical Details

### Docker Build Process

**Dockerfile Configuration:**
```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
CMD ["python", "/app/src/app.py"]
```

**Dependencies (`requirements.txt`):**
```
pycryptodome>=3.21.0
```

### Sconification Process

The `iapp deploy` command automatically:

1. **Builds Docker Image:** Creates standard Docker image with Python app
2. **Sconifies Image:** Transforms it into TEE-compatible image using SCONE framework
3. **Calculates Fingerprint:** Computes SGX/TDX attestation fingerprint
4. **Deploys On-Chain:** Registers app on iExec smart contracts

**TEE Image Naming:**
```
<dockerhub-username>/<image-name>:<version>-tee-scone-<scone-version>-<hash>
```

Example:
```
carlosisraelj/arckana-dividend-calculator:0.0.3-tee-scone-5.9.1-v16-prod-cecc9a96c6be
```

### iExec SDK Configuration

**Hub Address (Arbitrum Sepolia):** `0xB2157BF2fAb286b2A4170E3491Ac39770111Da3E`
**Chain ID:** `421614`
**RPC URL:** `https://sepolia-rollup.arbitrum.io/rpc`

---

## Verification Steps

### 1. Verify iApp Deployment

```bash
iexec app show 0xB5CED46207D14A976971C21F241F2c39a921755D --chain arbitrum-sepolia-testnet
```

### 2. Verify App Order Published

```bash
iexec orderbook app 0xB5CED46207D14A976971C21F241F2c39a921755D --chain arbitrum-sepolia-testnet
```

### 3. Test iApp Execution

From the Admin Panel (https://arckana.lat/admin):
1. Navigate to "Run Dividend Distribution"
2. Enter total pool amount (e.g., `1000000000`)
3. Click "Execute iApp"
4. Monitor task execution on [iExec Explorer](https://explorer.iex.ec/arbitrum-sepolia-testnet)

Expected result:
- Task status: `COMPLETED`
- Logs show successful balance reading and dividend calculation
- Merkle root generated and returned

---

## Troubleshooting

### Issue: "No App order found for the desired price"

**Cause:** App order not published or price mismatch

**Solution:**
1. Verify order exists: `iexec orderbook app <address>`
2. Re-publish order: `node sign-and-publish-order.js`
3. Ensure frontend includes `appMaxPrice` parameter

### Issue: Task fails with "Error loading DataProtector protected data"

**Cause:** Data type mismatch between protection and deserialization

**Solution:**
- Ensure frontend protects data with correct type
- Ensure iApp reads data with matching type
- See `src/app.py:162` for correct implementation

### Issue: Docker image not found by workers

**Cause:** Image not pushed to Docker Hub or incorrect multiaddr

**Solution:**
1. Verify push: `docker pull carlosisraelj/arckana-dividend-calculator:0.0.3`
2. Check iExec config: TEE image should be auto-generated during deployment

---

## Lessons Learned

### 1. Data Type Consistency

**Always match data types between frontend and TEE:**
- If frontend protects as `number`, iApp must read as `'number'`
- If frontend protects as `string`, iApp must read as `'string'`

### 2. Testing Protected Data Locally

Before deployment, test protected data deserialization:
```python
# Test script to verify getValue() works correctly
from protected_data import getValue

holder = getValue('holder', 'string')
balance = getValue('balance', 'number')  # Match frontend type!
print(f"Holder: {holder}, Balance: {balance}")
```

### 3. Docker vs. iApp Deploy

**Docker Deployment:**
- Manual control over build process
- Requires manual sconification
- Complex fingerprint calculation

**iApp Deploy (Recommended):**
- Automated sconification
- Automatic fingerprint calculation
- One-command deployment
- Handles TEE configuration

---

## File Changes

### Modified Files

```
iapp/arckana-dividend-calculator/
├── src/app.py                    # Line 162: Fixed data type reading
├── sign-and-publish-order.js     # Line 32: Updated iApp address
├── iexec.json                    # Updated multiaddr and checksum
└── orders.json                   # New app order for v0.0.3

frontend/
└── .env.local                    # Line 17: Updated NEXT_PUBLIC_IAPP_ADDRESS
```

### Git Commits

**iApp Repository:**
```
c3bf6ba - Fix: Read balance as number instead of string in iApp
```

**Frontend Repository:**
```
73d0fc0 - Update iApp address to v0.0.3
```

---

## Related Documentation

- [Publishing App Orders Guide](./PUBLISH_APP_ORDER.md)
- [iApp Generator Documentation](https://docs.iapp.dev)
- [iExec SDK Documentation](https://github.com/iExecBlockchainComputing/iexec-sdk)
- [DataProtector SDK v2 Beta](https://github.com/iExecBlockchainComputing/dataprotector-sdk)

---

## Support

For issues related to:
- **iApp deployment:** [iApp Generator Discord](https://discord.gg/iexec)
- **DataProtector:** [iExec Documentation](https://docs.iex.ec)
- **Arckana project:** Open an issue on GitHub

---

**Deployment completed successfully by Carlos Israel Jiménez**
**Project:** Arckana - Confidential Dividend Distribution
**Hackathon:** iExec Hack4Privacy 2026
