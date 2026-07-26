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
  const receiptTotal = Number(receipt.total_amount || 0);
  const receiptSubtotal = Number(receipt.subtotal_amount || receiptTotal || 0);
  const taxAmount = Number(receipt.tax_amount || 0);
  const serviceChargeAmount = Number(receipt.service_charge_amount || 0);
  const totalDifference = calculateReceiptDifference(receiptTotal, itemTotal);
  const subtotalDifference = Math.abs(receiptSubtotal - itemTotal);
  const totalsMatch = totalDifference < 0.005;
  const subtotalMatches = subtotalDifference < 0.005;
  const hasCharges = taxAmount > 0 || serviceChargeAmount > 0;

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

  if (subtotalMatches && hasCharges) {
    return (
      <div className="rounded-2xl bg-indigo-50 px-4 py-3">
        <p className="text-sm font-extrabold text-[#6D4AEF]">
          Item total matches receipt subtotal
        </p>

        <p className="mt-1 text-xs font-semibold text-indigo-500">
          Items {formatCurrency(itemTotal)} + Tax {formatCurrency(taxAmount)} +
          Service {formatCurrency(serviceChargeAmount)} = Receipt{' '}
          {formatCurrency(receiptTotal)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-amber-50 px-4 py-3">
      <p className="text-sm font-extrabold text-amber-700">
        Item total does not match receipt subtotal
      </p>

      <p className="mt-1 text-xs font-semibold text-amber-700">
        Subtotal {formatCurrency(receiptSubtotal)} | Items{' '}
        {formatCurrency(itemTotal)} | Difference{' '}
        {formatCurrency(subtotalDifference)}
      </p>
    </div>
  );
}