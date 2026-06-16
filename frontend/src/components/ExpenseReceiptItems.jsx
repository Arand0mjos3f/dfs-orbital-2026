import { useCallback, useEffect, useMemo, useState } from 'react';
import { createItem, getItems } from '../api/items';
import { createReceipt, getReceipts } from '../api/receipts';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function ExpenseReceiptItems({ expense, members }) {
  const [receipts, setReceipts] = useState([]);
  const [itemsByReceipt, setItemsByReceipt] = useState({});
  const [payerId, setPayerId] = useState('');
  const [receiptTotal, setReceiptTotal] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [activeReceiptId, setActiveReceiptId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [error, setError] = useState('');

  const activeReceipt = useMemo(
    () => receipts.find((receipt) => receipt.id === activeReceiptId) || receipts[0],
    [activeReceiptId, receipts]
  );

  const activeItems = activeReceipt ? itemsByReceipt[activeReceipt.id] || [] : [];

  const loadReceiptsAndItems = useCallback(async () => {
    const receiptsResponse = await getReceipts(expense.id);
    const loadedReceipts = receiptsResponse.data.data;

    const itemEntries = await Promise.all(
      loadedReceipts.map(async (receipt) => {
        const itemsResponse = await getItems(receipt.id);
        return [receipt.id, itemsResponse.data.data];
      })
    );

    setReceipts(loadedReceipts);
    setItemsByReceipt(Object.fromEntries(itemEntries));

    if (loadedReceipts.length > 0) {
      setActiveReceiptId((currentId) => currentId || loadedReceipts[0].id);
    }

    return loadedReceipts;
  }, [expense.id]);

  useEffect(() => {
    let isActive = true;

    getReceipts(expense.id)
      .then(async (receiptsResponse) => {
        const loadedReceipts = receiptsResponse.data.data;

        const itemEntries = await Promise.all(
          loadedReceipts.map(async (receipt) => {
            const itemsResponse = await getItems(receipt.id);
            return [receipt.id, itemsResponse.data.data];
          })
        );

        if (isActive) {
          setReceipts(loadedReceipts);
          setItemsByReceipt(Object.fromEntries(itemEntries));
          setError('');

          if (loadedReceipts.length > 0) {
            setActiveReceiptId((currentId) => currentId || loadedReceipts[0].id);
          }
        }
      })
      .catch((requestError) => {
        console.error('Error loading receipt items:', requestError);

        if (isActive) {
          setError('Failed to load receipt items');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [expense.id]);

  const handleCreateReceipt = async (event) => {
    event.preventDefault();

    if (!payerId || !receiptTotal) return;

    setIsSavingReceipt(true);
    setError('');

    try {
      const amount = Number(receiptTotal).toFixed(2);

      const response = await createReceipt(expense.id, {
        payer_id: payerId,
        subtotal_amount: amount,
        tax_amount: '0.00',
        service_charge_amount: '0.00',
        total_amount: amount,
      });

      setReceiptTotal('');
      setPayerId('');
      setActiveReceiptId(response.data.data.id);
      await loadReceiptsAndItems();
    } catch (requestError) {
      console.error('Error creating receipt:', requestError);
      setError(requestError.response?.data?.detail?.message || 'Failed to create receipt');
    } finally {
      setIsSavingReceipt(false);
    }
  };

  const handleCreateItem = async (event) => {
    event.preventDefault();

    if (!activeReceipt || !itemName.trim() || !itemPrice) return;

    setIsSavingItem(true);
    setError('');

    try {
      const amount = Number(itemPrice).toFixed(2);

      await createItem(activeReceipt.id, {
        name: itemName.trim(),
        quantity: 1,
        unit_price: amount,
        total_price: amount,
      });

      setItemName('');
      setItemPrice('');
      await loadReceiptsAndItems();
    } catch (requestError) {
      console.error('Error creating item:', requestError);
      setError(requestError.response?.data?.detail?.message || 'Failed to create item');
    } finally {
      setIsSavingItem(false);
    }
  };

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-900">Bill content</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Add a manual receipt and item rows for this expense.
          </p>
        </div>

        {activeReceipt && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-600">
            {formatCurrency(activeReceipt.total_amount)}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm font-semibold text-slate-400">Loading receipt items...</p>
      ) : (
        <>
          {receipts.length === 0 ? (
            <form onSubmit={handleCreateReceipt} className="space-y-3">
              <select
                value={payerId}
                onChange={(event) => setPayerId(event.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                required
              >
                <option value="">Choose payer</option>
                {members.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {String(member.user_id).slice(0, 8)} ({member.role})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                value={receiptTotal}
                onChange={(event) => setReceiptTotal(event.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                placeholder="Receipt total"
                required
              />

              <button
                type="submit"
                disabled={isSavingReceipt}
                className="w-full rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
              >
                {isSavingReceipt ? 'Creating...' : 'Create Receipt'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {receipts.length > 1 && (
                <select
                  value={activeReceipt?.id || ''}
                  onChange={(event) => setActiveReceiptId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                >
                  {receipts.map((receipt, index) => (
                    <option key={receipt.id} value={receipt.id}>
                      Receipt {index + 1} - {formatCurrency(receipt.total_amount)}
                    </option>
                  ))}
                </select>
              )}

              <form onSubmit={handleCreateItem} className="grid grid-cols-[1fr_100px] gap-3">
                <input
                  type="text"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                  placeholder="Item name"
                  required
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemPrice}
                  onChange={(event) => setItemPrice(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                  placeholder="Price"
                  required
                />

                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="col-span-2 rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                >
                  {isSavingItem ? 'Adding...' : 'Add Item'}
                </button>
              </form>

              {activeItems.length === 0 ? (
                <p className="rounded-2xl bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-400">
                  No items added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{item.name}</p>
                        <p className="text-xs font-semibold text-slate-400">
                          Quantity {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error && <p className="mt-3 text-sm font-semibold text-[#EF4444]">{error}</p>}
    </div>
  );
}