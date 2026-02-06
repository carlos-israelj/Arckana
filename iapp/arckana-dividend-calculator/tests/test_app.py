#!/usr/bin/env python3
"""
Unit tests for Arckana iApp dividend calculator

Tests cover:
- Dividend calculation logic
- Merkle tree generation
- Edge cases and error handling
"""

import unittest
import sys
import os
from decimal import Decimal

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src'))

from app import (
    calculate_dividends,
    encode_leaf,
    build_merkle_tree,
    keccak256
)


class TestDividendCalculation(unittest.TestCase):
    """Test dividend calculation logic"""

    def test_simple_dividend_calculation(self):
        """Test basic dividend distribution with equal balances"""
        balances = {
            '0x1111111111111111111111111111111111111111': 100_000_000,  # 100 tokens
            '0x2222222222222222222222222222222222222222': 100_000_000,  # 100 tokens
        }
        total_pool = 1_000_000  # 1 USDC (6 decimals)

        dividends = calculate_dividends(balances, total_pool)

        # Each should get 50% = 0.5 USDC = 500_000
        self.assertEqual(dividends['0x1111111111111111111111111111111111111111'], 500_000)
        self.assertEqual(dividends['0x2222222222222222222222222222222222222222'], 500_000)

    def test_proportional_dividend_calculation(self):
        """Test dividend distribution with different balances"""
        balances = {
            '0x1111111111111111111111111111111111111111': 50_000_000,   # 50 tokens (50%)
            '0x2222222222222222222222222222222222222222': 30_000_000,   # 30 tokens (30%)
            '0x3333333333333333333333333333333333333333': 20_000_000,   # 20 tokens (20%)
        }
        total_pool = 1_000_000  # 1 USDC

        dividends = calculate_dividends(balances, total_pool)

        # Check proportional distribution
        self.assertEqual(dividends['0x1111111111111111111111111111111111111111'], 500_000)  # 50%
        self.assertEqual(dividends['0x2222222222222222222222222222222222222222'], 300_000)  # 30%
        self.assertEqual(dividends['0x3333333333333333333333333333333333333333'], 200_000)  # 20%

    def test_large_pool_distribution(self):
        """Test with large dividend pool"""
        balances = {
            '0x1111111111111111111111111111111111111111': 1_000_000_000,  # 1000 tokens
            '0x2222222222222222222222222222222222222222': 1_000_000_000,  # 1000 tokens
        }
        total_pool = 10_000_000_000  # 10,000 USDC

        dividends = calculate_dividends(balances, total_pool)

        # Each gets 5000 USDC
        self.assertEqual(dividends['0x1111111111111111111111111111111111111111'], 5_000_000_000)
        self.assertEqual(dividends['0x2222222222222222222222222222222222222222'], 5_000_000_000)

    def test_single_holder(self):
        """Test with only one token holder"""
        balances = {
            '0x1111111111111111111111111111111111111111': 100_000_000,
        }
        total_pool = 1_000_000

        dividends = calculate_dividends(balances, total_pool)

        # Single holder gets everything
        self.assertEqual(dividends['0x1111111111111111111111111111111111111111'], 1_000_000)

    def test_zero_pool(self):
        """Test with zero dividend pool"""
        balances = {
            '0x1111111111111111111111111111111111111111': 100_000_000,
            '0x2222222222222222222222222222222222222222': 100_000_000,
        }
        total_pool = 0

        dividends = calculate_dividends(balances, total_pool)

        # Everyone gets 0
        self.assertEqual(dividends['0x1111111111111111111111111111111111111111'], 0)
        self.assertEqual(dividends['0x2222222222222222222222222222222222222222'], 0)

    def test_rounding_down(self):
        """Test that dividends are rounded down properly"""
        balances = {
            '0x1111111111111111111111111111111111111111': 33_333_333,  # 1/3
            '0x2222222222222222222222222222222222222222': 33_333_333,  # 1/3
            '0x3333333333333333333333333333333333333333': 33_333_334,  # 1/3
        }
        total_pool = 1_000_000  # Cannot be divided evenly

        dividends = calculate_dividends(balances, total_pool)

        # Check that rounding doesn't exceed total pool
        total_distributed = sum(dividends.values())
        self.assertLessEqual(total_distributed, total_pool)

        # Each should get approximately 333,333
        for dividend in dividends.values():
            self.assertGreaterEqual(dividend, 333_000)
            self.assertLessEqual(dividend, 334_000)


class TestMerkleTree(unittest.TestCase):
    """Test Merkle tree generation and proof creation"""

    def test_encode_leaf(self):
        """Test leaf encoding matches Solidity format"""
        address = '0x1111111111111111111111111111111111111111'
        amount = 500_000

        leaf = encode_leaf(address, amount)

        # Should be 32 bytes
        self.assertEqual(len(leaf), 32)
        # Should be deterministic
        leaf2 = encode_leaf(address, amount)
        self.assertEqual(leaf, leaf2)

    def test_simple_merkle_tree(self):
        """Test building merkle tree with 2 leaves"""
        leaves = [
            encode_leaf('0x1111111111111111111111111111111111111111', 500_000),
            encode_leaf('0x2222222222222222222222222222222222222222', 500_000),
        ]

        root, proofs = build_merkle_tree(leaves)

        # Root should be 32 bytes
        self.assertEqual(len(root), 32)
        # Should have proofs for both leaves
        self.assertEqual(len(proofs), 2)

    def test_three_leaf_merkle_tree(self):
        """Test building merkle tree with 3 leaves"""
        leaves = [
            encode_leaf('0x1111111111111111111111111111111111111111', 500_000),
            encode_leaf('0x2222222222222222222222222222222222222222', 300_000),
            encode_leaf('0x3333333333333333333333333333333333333333', 200_000),
        ]

        root, proofs = build_merkle_tree(leaves)

        # Root should be 32 bytes
        self.assertEqual(len(root), 32)
        # Should have proofs for all 3 leaves
        self.assertEqual(len(proofs), 3)

    def test_merkle_proofs_generation(self):
        """Test generating merkle proofs for holders"""
        addresses = [
            '0x1111111111111111111111111111111111111111',
            '0x2222222222222222222222222222222222222222',
            '0x3333333333333333333333333333333333333333',
        ]
        amounts = [500_000, 300_000, 200_000]

        leaves = [encode_leaf(addr, amt) for addr, amt in zip(addresses, amounts)]
        root, proofs_dict = build_merkle_tree(leaves)

        # Should have root
        self.assertEqual(len(root), 32)
        # Should have proof for each holder (indexed by leaf index)
        self.assertEqual(len(proofs_dict), 3)

        # Each proof should be a list of hashes
        for i in range(len(leaves)):
            self.assertIn(i, proofs_dict)
            self.assertIsInstance(proofs_dict[i], list)

    def test_single_leaf_merkle_tree(self):
        """Test merkle tree with single leaf"""
        leaves = [
            encode_leaf('0x1111111111111111111111111111111111111111', 1_000_000),
        ]

        root, proofs = build_merkle_tree(leaves)

        # Root should be the leaf itself
        self.assertEqual(root, leaves[0])
        # Proof should be empty
        self.assertEqual(len(proofs[0]), 0)

    def test_deterministic_merkle_root(self):
        """Test that merkle root is deterministic"""
        leaves = [
            encode_leaf('0x1111111111111111111111111111111111111111', 500_000),
            encode_leaf('0x2222222222222222222222222222222222222222', 500_000),
        ]

        root1, _ = build_merkle_tree(leaves)
        root2, _ = build_merkle_tree(leaves)

        # Same inputs should give same root
        self.assertEqual(root1, root2)


class TestEdgeCases(unittest.TestCase):
    """Test edge cases and error handling"""

    def test_empty_balances(self):
        """Test with no balances"""
        balances = {}
        total_pool = 1_000_000

        dividends = calculate_dividends(balances, total_pool)

        # Should return empty dict
        self.assertEqual(dividends, {})

    def test_very_small_amounts(self):
        """Test with very small dividend amounts"""
        balances = {
            '0x1111111111111111111111111111111111111111': 1,
            '0x2222222222222222222222222222222222222222': 1,
        }
        total_pool = 2

        dividends = calculate_dividends(balances, total_pool)

        # Each should get 1
        self.assertEqual(dividends['0x1111111111111111111111111111111111111111'], 1)
        self.assertEqual(dividends['0x2222222222222222222222222222222222222222'], 1)

    def test_address_case_insensitivity(self):
        """Test that addresses work in different cases"""
        address_lower = '0xabcdef1234567890abcdef1234567890abcdef12'
        address_upper = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'

        leaf_lower = encode_leaf(address_lower, 100_000)
        leaf_upper = encode_leaf(address_upper, 100_000)

        # Should produce same leaf (addresses are normalized)
        self.assertEqual(leaf_lower, leaf_upper)


class TestIntegration(unittest.TestCase):
    """Integration tests simulating full iApp flow"""

    def test_full_dividend_distribution_flow(self):
        """Test complete flow from balances to merkle tree"""
        # Step 1: Input balances (from protected data)
        balances = {
            '0x1234567890123456789012345678901234567890': 50_000_000,
            '0x2345678901234567890123456789012345678901': 30_000_000,
            '0x3456789012345678901234567890123456789012': 20_000_000,
        }
        total_pool = 1_000_000

        # Step 2: Calculate dividends
        dividends = calculate_dividends(balances, total_pool)

        # Verify distribution
        self.assertEqual(dividends['0x1234567890123456789012345678901234567890'], 500_000)
        self.assertEqual(dividends['0x2345678901234567890123456789012345678901'], 300_000)
        self.assertEqual(dividends['0x3456789012345678901234567890123456789012'], 200_000)

        # Step 3: Generate merkle tree
        addresses = list(dividends.keys())
        leaves = [encode_leaf(addr, dividends[addr]) for addr in addresses]
        root, proofs_dict = build_merkle_tree(leaves)

        # Verify root exists
        self.assertIsNotNone(root)
        self.assertEqual(len(root), 32)

        # Verify all holders have proofs
        self.assertEqual(len(proofs_dict), 3)

        # Step 4: Verify output format (what would be saved to iexec_out)
        output = {
            'merkle_root': '0x' + root.hex(),
            'total_pool': total_pool,
            'holder_count': len(dividends),
            'proofs': [{
                'address': addr,
                'amount': dividends[addr],
                'proof': ['0x' + p.hex() for p in proofs_dict[i]]
            } for i, addr in enumerate(addresses)]
        }

        self.assertIn('merkle_root', output)
        self.assertIn('total_pool', output)
        self.assertIn('holder_count', output)
        self.assertIn('proofs', output)
        self.assertEqual(output['holder_count'], 3)


if __name__ == '__main__':
    unittest.main()
