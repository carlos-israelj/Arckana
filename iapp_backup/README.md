# Arckana iApp - Confidential Dividend Calculator

This is the confidential computing component of Arckana that runs inside an iExec Trusted Execution Environment (TEE).

## Overview

The iApp:
1. Receives encrypted holder balances via bulk processing
2. Calculates dividend distribution based on token holdings
3. Generates a Merkle tree for on-chain verification
4. Returns the Merkle root and individual proofs for each holder

## Local Testing

### Prerequisites
- Python 3.11+
- pip

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Create Test Data

Create a `test_input` directory with sample protected data:

```bash
mkdir -p test_input
```

Create `test_input/holder1.json`:
```json
{
  "holder": "0x1234567890123456789012345678901234567890",
  "balance": 1000000000
}
```

Create `test_input/holder2.json`:
```json
{
  "holder": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  "balance": 500000000
}
```

### Run Locally

```bash
mkdir -p test_output
IEXEC_IN=./test_input IEXEC_OUT=./test_output IEXEC_ARGS="1000000000" python src/app.py
```

### Check Output

```bash
cat test_output/result.json
```

You should see:
- `success`: true
- `merkle_root`: 0x...
- `holder_count`: Number of holders processed
- `distribution`: Array of {holder, amount, proof}

## Algorithm

### Dividend Calculation

For each holder:
```
share = holder_balance / total_supply
dividend = share * total_pool
```

Precision:
- Uses Python's `Decimal` for high precision
- Rounds down to prevent over-distribution
- Dust (remaining amount) goes to largest holder

### Merkle Tree

1. Generate leaves: `keccak256(keccak256(abi.encode(holder, amount)))`
2. Sort leaves for deterministic tree
3. Build tree level by level
4. Store proofs for each holder

Merkle tree follows OpenZeppelin's implementation for compatibility with Solidity contracts.

## Deployment to iExec

### 1. Build Docker Image

```bash
docker build -t arcana-iapp .
```

### 2. Test Docker Image Locally

```bash
docker run -v $(pwd)/test_input:/iexec_in -v $(pwd)/test_output:/iexec_out -e IEXEC_ARGS="1000000000" arcana-iapp
```

### 3. Push to Registry

```bash
docker tag arcana-iapp:latest <your-registry>/arcana-iapp:latest
docker push <your-registry>/arcana-iapp:latest
```

### 4. Deploy to iExec

Follow the [iExec documentation](https://docs.iex.ec/) to:
1. Initialize iExec app
2. Configure `iexec.json` with your image URL
3. Deploy the app
4. Request TEE attestation

### 5. Update iexec.json

Replace placeholders:
- `YOUR_ADDRESS_HERE`: Your Ethereum address
- `YOUR_DOCKER_IMAGE_URL`: Your Docker registry URL
- `YOUR_IMAGE_CHECKSUM`: Docker image checksum

## Security Considerations

### What's Protected
- Individual holder balances (never exposed)
- Individual dividend amounts (only holder sees their own)
- Number of holders (not revealed on-chain)

### What's Public
- Merkle root (required for on-chain verification)
- Total dividend pool
- When claims are made (on-chain events)

### TEE Guarantees
- Code runs in isolated environment (Intel SGX/TDX)
- Memory is encrypted
- Node operators cannot access data
- Attestation proves correct execution

## Troubleshooting

### Issue: "No valid balances found"
**Cause:** Protected data format is incorrect

**Solution:** Ensure each JSON file has `holder` and `balance` fields

### Issue: Merkle tree generation fails
**Cause:** Invalid holder addresses

**Solution:** Verify all addresses are valid hex strings (0x...)

### Issue: Docker build fails
**Cause:** Missing dependencies

**Solution:** Ensure pycryptodome is in requirements.txt

## Performance

Tested performance on typical hardware:

| Holders | Processing Time |
|---------|----------------|
| 10      | < 1 second     |
| 100     | ~2 seconds     |
| 1,000   | ~5 seconds     |
| 10,000  | ~30 seconds    |

Bottleneck: Merkle tree construction (O(n log n))

## Future Improvements

- [ ] Optimize Merkle tree construction
- [ ] Add support for multiple token types
- [ ] Implement progressive distribution (vesting)
- [ ] Add data validation and error recovery
- [ ] Support for partial claims

## Resources

- [iExec Docs](https://docs.iex.ec/)
- [Python Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree)
- [OpenZeppelin Merkle Proof](https://docs.openzeppelin.com/contracts/4.x/api/utils#MerkleProof)
