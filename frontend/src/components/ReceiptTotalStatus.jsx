import {
  calculateItemsTotal,
  calculateReceiptDifference,
} from '../utils/receiptTotals';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function ReceiptTotalStatus({ receipt, items }) {
  if (!receipt || items.length === 0) return null;

  const itemTotal = calculateItemsTotal(items);
  const difference = calculateReceiptDifference(
    receipt.total_amount,
    itemTotal
  );
  const totalsMatch = difference < 0.005;

  if (totalsMatch) {
    return (
      <div className="rounded-2xl bg-emerald-50 px-4 py-3">
        <p className="text-sm font-extrabold text-emerald-600">
          Item total matches receipt total
        </p>

        <p className="mt-1 text-xs font-semibold text-emerald-600">
          {formatCurrency(itemTotal)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-amber-50 px-4 py-3">
      <p className="text-sm font-extrabold text-amber-700">
        Item total does not match receipt total
      </p>

      <p className="mt-1 text-xs font-semibold text-amber-700">
        Receipt {formatCurrency(receipt.total_amount)} | Items{' '}
        {formatCurrency(itemTotal)} | Difference{' '}
        {formatCurrency(difference)}
      </p>
    </div>
  );
}