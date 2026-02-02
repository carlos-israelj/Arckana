#!/usr/bin/env python3
"""
Arckana iApp - Confidential Dividend Calculator

This application runs inside an iExec TEE (Intel SGX/TDX) and:
1. Receives encrypted holder balances via bulk processing
2. Calculates dividend distribution
3. Generates Merkle tree for on-chain verification
4. Returns Merkle root and encrypted proofs

Author: Arckana Team
Hackathon: iExec Hack4Privacy 2026
"""

import os
import sys
import json
import hashlib
from typing import Dict, List, Tuple, Any
from decimal import Decimal, ROUND_DOWN

# Merkle tree implementation
def keccak256(data: bytes) -> bytes:
    """Compute keccak256 hash (Ethereum compatible)"""
    from Crypto.Hash import keccak
    k = keccak.new(digest_bits=256)
    k.update(data)
    return k.digest()

def encode_leaf(address: str, amount: int) -> bytes:
    """
    Encode leaf data the same way Solidity does:
    keccak256(bytes.concat(keccak256(abi.encode(address, amount))))
    """
    # Pad address to 32 bytes
    address_bytes = bytes.fromhex(address[2:] if address.startswith('0x') else address)
    address_padded = address_bytes.rjust(32, b'\x00')

    # Encode amount as uint256 (32 bytes)
    amount_bytes = amount.to_bytes(32, byteorder='big')

    # abi.encode(address, amount)
    encoded = address_padded + amount_bytes

    # Double hash as per OpenZeppelin MerkleProof standard
    inner_hash = keccak256(encoded)
    return keccak256(inner_hash)

def build_merkle_tree(leaves: List[bytes]) -> Tuple[bytes, Dict[int, List[bytes]]]:
    """
    Build Merkle tree and return root + proofs for each leaf

    Args:
        leaves: List of leaf hashes

    Returns:
        (root, proofs) where proofs[i] is the proof for leaves[i]
    """
    if len(leaves) == 0:
        return b'\x00' * 32, {}

    # Sort leaves for deterministic tree (OpenZeppelin style)
    indexed_leaves = [(leaf, i) for i, leaf in enumerate(leaves)]
    indexed_leaves.sort(key=lambda x: x[0])
    sorted_leaves = [leaf for leaf, _ in indexed_leaves]
    original_indices = [i for _, i in indexed_leaves]

    # Build tree level by level
    tree = [sorted_leaves]
    proofs = {i: [] for i in range(len(leaves))}

    current_level = sorted_leaves
    while len(current_level) > 1:
        next_level = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i + 1] if i + 1 < len(current_level) else current_level[i]

            # Sort pair before hashing (OpenZeppelin style)
            if left > right:
                left, right = right, left

            parent = keccak256(left + right)
            next_level.append(parent)

        tree.append(next_level)
        current_level = next_level

    root = tree[-1][0] if tree[-1] else b'\x00' * 32

    # Generate proofs
    for sorted_idx, original_idx in enumerate(original_indices):
        proof = []
        idx = sorted_idx
        for level in tree[:-1]:
            if len(level) == 1:
                break
            sibling_idx = idx ^ 1  # XOR to get sibling
            if sibling_idx < len(level):
                proof.append(level[sibling_idx])
            idx //= 2
        proofs[original_idx] = proof

    return root, proofs

def calculate_dividends(
    balances: Dict[str, int],
    total_pool: int
) -> Dict[str, int]:
    """
    Calculate dividend for each holder based on their share

    Args:
        balances: Dict of {address: balance}
        total_pool: Total dividend pool to distribute

    Returns:
        Dict of {address: dividend_amount}
    """
    total_supply = sum(balances.values())

    if total_supply == 0:
        return {addr: 0 for addr in balances}

    dividends = {}
    distributed = 0

    # Calculate each holder's share
    for address, balance in balances.items():
        # Use Decimal for precision, then convert to int
        share = Decimal(balance) / Decimal(total_supply)
        dividend = int((share * Decimal(total_pool)).quantize(Decimal('1'), rounding=ROUND_DOWN))
        dividends[address] = dividend
        distributed += dividend

    # Handle dust (remaining wei) - give to largest holder
    dust = total_pool - distributed
    if dust > 0 and balances:
        largest_holder = max(balances.keys(), key=lambda x: balances[x])
        dividends[largest_holder] += dust

    return dividends

def load_protected_data(input_dir: str) -> List[Dict[str, Any]]:
    """
    Load and decrypt protected data from iExec input directory

    In bulk processing mode, multiple protected data items are provided
    iExec provides protected data in protectedData.json file
    """
    protected_data = []

    # Check for protectedData.json (iExec standard format)
    protected_data_file = os.path.join(input_dir, 'protectedData.json')
    if os.path.exists(protected_data_file):
        try:
            with open(protected_data_file, 'r') as f:
                data = json.load(f)
                # If data is a list, use it directly
                if isinstance(data, list):
                    protected_data = data
                # If data is a single object, wrap it in a list
                else:
                    protected_data.append(data)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load protectedData.json: {e}", file=sys.stderr)
    else:
        # Fallback: Load all JSON files in input directory
        for filename in os.listdir(input_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(input_dir, filename)
                if os.path.isfile(filepath):
                    try:
                        with open(filepath, 'r') as f:
                            data = json.load(f)
                            protected_data.append(data)
                    except (json.JSONDecodeError, IOError) as e:
                        print(f"Warning: Could not load {filename}: {e}", file=sys.stderr)

    return protected_data

def main():
    """Main entry point for iApp"""

    # iExec environment variables
    iexec_in = os.environ.get('IEXEC_IN', '/iexec_in')
    iexec_out = os.environ.get('IEXEC_OUT', '/iexec_out')

    # Get arguments (total dividend pool amount)
    # iExec provides args in args.txt file
    args_file = os.path.join(iexec_in, 'args.txt')
    args = ''
    if os.path.exists(args_file):
        try:
            with open(args_file, 'r') as f:
                args = f.read().strip()
        except IOError as e:
            print(f"Warning: Could not read args.txt: {e}", file=sys.stderr)

    try:
        # Parse dividend pool from args (in smallest unit, e.g., wei or USDC base units)
        total_pool = int(args) if args else 1000000000  # Default 1000 USDC (6 decimals)
    except ValueError:
        total_pool = 1000000000

    print(f"Arckana iApp starting...")
    print(f"Input directory: {iexec_in}")
    print(f"Output directory: {iexec_out}")
    print(f"Total dividend pool: {total_pool}")

    # Load protected balances (bulk processing)
    protected_data = load_protected_data(iexec_in)
    print(f"Loaded {len(protected_data)} protected data items")

    # Extract balances from protected data
    # Expected format: {"holder": "0x...", "balance": 1000000}
    balances = {}
    for data in protected_data:
        if 'holder' in data and 'balance' in data:
            holder = data['holder'].lower()
            balance = int(data['balance'])
            balances[holder] = balance

    print(f"Processing {len(balances)} holder balances")

    if len(balances) == 0:
        print("Error: No valid balances found", file=sys.stderr)
        # Write empty result
        result = {
            "success": False,
            "error": "No valid balances found",
            "merkle_root": "0x" + "00" * 32,
            "holder_count": 0,
            "total_distributed": 0
        }
        with open(os.path.join(iexec_out, 'result.json'), 'w') as f:
            json.dump(result, f, indent=2)
        return

    # Calculate dividends
    dividends = calculate_dividends(balances, total_pool)
    print(f"Calculated dividends for {len(dividends)} holders")

    # Build Merkle tree
    leaves = []
    leaf_data = []
    for address, amount in dividends.items():
        leaf = encode_leaf(address, amount)
        leaves.append(leaf)
        leaf_data.append({"address": address, "amount": amount})

    merkle_root, proofs = build_merkle_tree(leaves)
    merkle_root_hex = "0x" + merkle_root.hex()
    print(f"Merkle root: {merkle_root_hex}")

    # Prepare output
    holder_proofs = []
    for i, data in enumerate(leaf_data):
        proof_hex = ["0x" + p.hex() for p in proofs.get(i, [])]
        holder_proofs.append({
            "holder": data["address"],
            "amount": data["amount"],
            "proof": proof_hex
        })

    # Write result
    result = {
        "success": True,
        "merkle_root": merkle_root_hex,
        "holder_count": len(balances),
        "total_supply": sum(balances.values()),
        "total_distributed": total_pool,
        "distribution": holder_proofs
    }

    # Main result file
    with open(os.path.join(iexec_out, 'result.json'), 'w') as f:
        json.dump(result, f, indent=2)

    # Computed file (required by iExec)
    with open(os.path.join(iexec_out, 'computed.json'), 'w') as f:
        json.dump({"deterministic-output-path": os.path.join(iexec_out, 'result.json')}, f)

    print(f"Arckana iApp completed successfully")
    print(f"Merkle root: {merkle_root_hex}")
    print(f"Holders: {len(balances)}")
    print(f"Total distributed: {total_pool}")

if __name__ == "__main__":
    main()
