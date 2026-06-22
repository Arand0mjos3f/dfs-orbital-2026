import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateItemsTotal,
  calculateReceiptDifference,
} from '../src/utils/receiptTotals.js';

test('calculates the total of receipt items', () => {
  const items = [
    { total_price: '4.25' },
    { total_price: '5.75' },
  ];

  assert.equal(calculateItemsTotal(items), 10);
});

test('returns zero for an empty item list', () => {
  assert.equal(calculateItemsTotal([]), 0);
});

test('calculates an absolute receipt difference', () => {
  const difference = calculateReceiptDifference('11.94', 12);

  assert.ok(Math.abs(difference - 0.06) < 0.000001);
});

test('returns zero when receipt and item totals match', () => {
  assert.equal(calculateReceiptDifference('10.00', 10), 0);
});