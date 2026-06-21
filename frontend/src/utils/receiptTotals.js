export function calculateItemsTotal(items) {
  return items.reduce(
    (total, item) => total + Number(item.total_price || 0),
    0
  );
}

export function calculateReceiptDifference(receiptTotal, itemsTotal) {
  return Math.abs(Number(receiptTotal || 0) - Number(itemsTotal || 0));
}