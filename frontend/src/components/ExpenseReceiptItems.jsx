import { useCallback, useEffect, useMemo, useState } from 'react';
import { createItem, getItems } from '../api/items';
import { createItemShares, getItemShares } from '../api/itemShares';
import { createReceipt, getReceipts } from '../api/receipts';
import ReceiptTotalStatus from './ReceiptTotalStatus';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatMemberLabel(member) {
  return `${member.username || String(member.user_id).slice(0, 8)} (${member.role})`;
}

function splitAmount(total, count) {
  if (count <= 0) return [];

  const cents = Math.round(Number(total || 0) * 100);
  const base = Math.floor(cents / count);
  const remainder = cents % count;

  return Array.from({ length: count }, (_, index) =>
    ((base + (index < remainder ? 1 : 0)) / 100).toFixed(2)
  );
}

export default function ExpenseReceiptItems({ expense, members }) {
  const [receipts, setReceipts] = useState([]);
  const [itemsByReceipt, setItemsByReceipt] = useState({});
  const [sharesByItem, setSharesByItem] = useState({});
  const [selectedUsersByItem, setSelectedUsersByItem] = useState({});
  const [payerId, setPayerId] = useState('');
  const [receiptTotal, setReceiptTotal] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [activeReceiptId, setActiveReceiptId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingSharesByItem, setIsSavingSharesByItem] = useState({});
  const [error, setError] = useState('');

  const memberMap = useMemo(
    () =>
      Object.fromEntries(
        members.map((member) => [String(member.user_id), member])
      ),
    [members]
  );

  const activeReceipt = useMemo(
    () =>
      receipts.find((receipt) => receipt.id === activeReceiptId) ||
      receipts[0],
    [activeReceiptId, receipts]
  );

  const activeItems = useMemo(
    () => (activeReceipt ? itemsByReceipt[activeReceipt.id] || [] : []),
    [activeReceipt, itemsByReceipt]
  );

  const buildReceiptItemState = useCallback(async (loadedReceipts) => {
    const itemEntries = await Promise.all(
      loadedReceipts.map(async (receipt) => {
        const itemsResponse = await getItems(receipt.id);
        return [receipt.id, itemsResponse.data.data];
      })
    );

    const nextItemsByReceipt = Object.fromEntries(itemEntries);
    const loadedItems = itemEntries.flatMap(([, receiptItems]) => receiptItems);

    const shareEntries = await Promise.all(
      loadedItems.map(async (item) => {
        const sharesResponse = await getItemShares(item.id);
        return [item.id, sharesResponse.data.data];
      })
    );

    return {
      nextItemsByReceipt,
      nextSharesByItem: Object.fromEntries(shareEntries),
    };
  }, []);

  const loadReceiptsAndItems = useCallback(async () => {
    const receiptsResponse = await getReceipts(expense.id);
    const loadedReceipts = receiptsResponse.data.data;
    const { nextItemsByReceipt, nextSharesByItem } =
      await buildReceiptItemState(loadedReceipts);

    setReceipts(loadedReceipts);
    setItemsByReceipt(nextItemsByReceipt);
    setSharesByItem(nextSharesByItem);

    if (loadedReceipts.length > 0) {
      setActiveReceiptId((currentId) => currentId || loadedReceipts[0].id);
    }

    return loadedReceipts;
  }, [buildReceiptItemState, expense.id]);

  useEffect(() => {
    let isActive = true;

    getReceipts(expense.id)
      .then(async (receiptsResponse) => {
        const loadedReceipts = receiptsResponse.data.data;
        const { nextItemsByReceipt, nextSharesByItem } =
          await buildReceiptItemState(loadedReceipts);

        if (isActive) {
          setReceipts(loadedReceipts);
          setItemsByReceipt(nextItemsByReceipt);
          setSharesByItem(nextSharesByItem);
          setError('');

          if (loadedReceipts.length > 0) {
            setActiveReceiptId(
              (currentId) => currentId || loadedReceipts[0].id
            );
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
  }, [buildReceiptItemState, expense.id]);

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
      setError(
        requestError.response?.data?.detail?.message ||
          'Failed to create receipt'
      );
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
      setError(
        requestError.response?.data?.detail?.message || 'Failed to create item'
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleToggleUser = (itemId, userId) => {
    setSelectedUsersByItem((currentSelections) => {
      const currentItemSelections = currentSelections[itemId] || [];
      const isSelected = currentItemSelections.includes(userId);

      return {
        ...currentSelections,
        [itemId]: isSelected
          ? currentItemSelections.filter(
              (selectedUserId) => selectedUserId !== userId
            )
          : [...currentItemSelections, userId],
      };
    });
  };

  const handleAssignItem = async (item) => {
    const selectedUserIds = selectedUsersByItem[item.id] || [];

    if (selectedUserIds.length === 0) return;

    setIsSavingSharesByItem((currentState) => ({
      ...currentState,
      [item.id]: true,
    }));
    setError('');

    try {
      const shareAmounts = splitAmount(
        item.total_price,
        selectedUserIds.length
      );

      await createItemShares(item.id, {
        shares: selectedUserIds.map((userId, index) => ({
          user_id: userId,
          item_share_amount: shareAmounts[index],
          tax_share_amount: '0.00',
          service_charge_share_amount: '0.00',
          total_share_amount: shareAmounts[index],
        })),
      });

      const sharesResponse = await getItemShares(item.id);

      setSharesByItem((currentShares) => ({
        ...currentShares,
        [item.id]: sharesResponse.data.data,
      }));

      setSelectedUsersByItem((currentSelections) => ({
        ...currentSelections,
        [item.id]: [],
      }));
    } catch (requestError) {
      console.error('Error assigning item:', requestError);
      setError(
        requestError.response?.data?.detail?.message || 'Failed to assign item'
      );
    } finally {
      setIsSavingSharesByItem((currentState) => ({
        ...currentState,
        [item.id]: false,
      }));
    }
  };

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-900">
            Bill content
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Add receipt items, assign them to members, and preview the split.
          </p>
        </div>

        {activeReceipt && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-600">
            {formatCurrency(activeReceipt.total_amount)}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm font-semibold text-slate-400">
          Loading receipt items...
        </p>
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
                    {formatMemberLabel(member)}
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
                      Receipt {index + 1} -{' '}
                      {formatCurrency(receipt.total_amount)}
                    </option>
                  ))}
                </select>
              )}

              <ReceiptTotalStatus
                receipt={activeReceipt}
                items={activeItems}
              />

              <form
                onSubmit={handleCreateItem}
                className="grid grid-cols-[1fr_100px] gap-3"
              >
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
                <div className="space-y-3">
                  {activeItems.map((item) => {
                    const itemShares = sharesByItem[item.id] || [];
                    const selectedUserIds =
                      selectedUsersByItem[item.id] || [];
                    const isAssigned = itemShares.length > 0;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-[#F8FAFC] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-extrabold text-slate-900">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              Quantity {item.quantity}
                            </p>
                          </div>

                          <p className="text-sm font-extrabold text-slate-900">
                            {formatCurrency(item.total_price)}
                          </p>
                        </div>

                        {isAssigned ? (
                          <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-extrabold uppercase text-slate-400">
                                Split preview
                              </p>

                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-600">
                                {itemShares.length} people
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              {itemShares.map((share) => {
                                const member =
                                  memberMap[String(share.user_id)];

                                return (
                                  <div
                                    key={share.id}
                                    className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2"
                                  >
                                    <span className="text-xs font-bold text-slate-500">
                                      {member
                                        ? formatMemberLabel(member)
                                        : String(share.user_id).slice(0, 8)}
                                    </span>

                                    <span className="text-xs font-extrabold text-slate-900">
                                      {formatCurrency(
                                        share.total_share_amount
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-extrabold uppercase text-slate-400">
                              Assign to members
                            </p>

                            {members.length === 0 ? (
                              <p className="rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-slate-400">
                                Add members before assigning items.
                              </p>
                            ) : (
                              <div className="grid gap-2 sm:grid-cols-2">
                                {members.map((member) => {
                                  const userId = String(member.user_id);
                                  const isSelected =
                                    selectedUserIds.includes(userId);

                                  return (
                                    <label
                                      key={`${item.id}-${member.user_id}`}
                                      className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold ${
                                        isSelected
                                          ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                                          : 'border-white bg-white text-slate-500'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          handleToggleUser(item.id, userId)
                                        }
                                        className="h-4 w-4 accent-[#4F46E5]"
                                      />

                                      <span>
                                        {formatMemberLabel(member)}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAssignItem(item)}
                              disabled={
                                selectedUserIds.length === 0 ||
                                isSavingSharesByItem[item.id]
                              }
                              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-400"
                            >
                              {isSavingSharesByItem[item.id]
                                ? 'Assigning...'
                                : selectedUserIds.length === 0
                                  ? 'Choose members first'
                                  : 'Assign item'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-[#EF4444]">
          {error}
        </p>
      )}
    </div>
  );
}