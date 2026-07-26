import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from '../api/items';
import {
  allocateReceiptCharges,
  createEqualItemShares,
  getItemShares,
} from '../api/itemShares';
import { createReceipt, getReceipts, uploadReceiptImage } from '../api/receipts';
import ReceiptTotalStatus from './ReceiptTotalStatus';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatMemberLabel(member) {
  return `${member.username || String(member.user_id).slice(0, 8)} (${member.role})`;
}

function normalizeOcrItem(item, index) {
  return {
    id: `${item.name || item.original_name || 'item'}-${index}`,
    name: item.name || item.original_name || `Item ${index + 1}`,
    total_price: Number(item.total_price || item.unit_price || 0).toFixed(2),
  };
}

function receiptHasCharges(receipt) {
  if (!receipt) return false;

  return (
    Number(receipt.tax_amount || 0) > 0 ||
    Number(receipt.service_charge_amount || 0) > 0
  );
}

function getReceiptChargeTotal(receipt) {
  if (!receipt) return 0;

  return (
    Number(receipt.tax_amount || 0) +
    Number(receipt.service_charge_amount || 0)
  );
}

function groupSharesByItem(shares) {
  return shares.reduce((groupedShares, share) => {
    const itemId = share.item_id;

    return {
      ...groupedShares,
      [itemId]: [...(groupedShares[itemId] || []), share],
    };
  }, {});
}

function shareHasCharges(share) {
  return (
    Number(share.tax_share_amount || 0) > 0 ||
    Number(share.service_charge_share_amount || 0) > 0
  );
}

function receiptChargesAreApplied(receipt, receiptItems, sharesByItem) {
  if (!receiptHasCharges(receipt)) return true;
  if (receiptItems.length === 0) return false;

  const shares = receiptItems.flatMap((item) => sharesByItem[item.id] || []);
  const allocatedTax = shares.reduce(
    (total, share) => total + Number(share.tax_share_amount || 0),
    0
  );
  const allocatedService = shares.reduce(
    (total, share) => total + Number(share.service_charge_share_amount || 0),
    0
  );

  return (
    Math.abs(allocatedTax - Number(receipt.tax_amount || 0)) < 0.005 &&
    Math.abs(
      allocatedService - Number(receipt.service_charge_amount || 0)
    ) < 0.005
  );
}

function receiptItemTotalMatches(receipt, receiptItems) {
  if (receiptItems.length === 0) return false;

  const itemTotal = receiptItems.reduce(
    (total, item) => total + Number(item.total_price || 0),
    0
  );
  const expectedItemTotal = receiptHasCharges(receipt)
    ? Number(receipt.subtotal_amount || 0)
    : Number(receipt.total_amount || 0);

  return Math.abs(itemTotal - expectedItemTotal) < 0.005;
}

export default function ExpenseReceiptItems({
  expense,
  members,
  onSettlementInvalidated,
  onSettlementReadinessChange,
}) {
  const [receipts, setReceipts] = useState([]);
  const [itemsByReceipt, setItemsByReceipt] = useState({});
  const [sharesByItem, setSharesByItem] = useState({});
  const [selectedUsersByItem, setSelectedUsersByItem] = useState({});
  const [payerId, setPayerId] = useState('');
  const [receiptTotal, setReceiptTotal] = useState('');
  const [receiptImageFile, setReceiptImageFile] = useState(null);
  const [ocrReview, setOcrReview] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [activeReceiptId, setActiveReceiptId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [isSavingOcrItems, setIsSavingOcrItems] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [itemActionId, setItemActionId] = useState('');
  const [isSavingSharesByItem, setIsSavingSharesByItem] = useState({});
  const [isAllocatingCharges, setIsAllocatingCharges] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

  const activeOcrReview = useMemo(() => {
    if (!activeReceipt || !ocrReview) return null;
    if (ocrReview.receiptId !== activeReceipt.id) return null;
    return ocrReview;
  }, [activeReceipt, ocrReview]);

  const activeReceiptHasCharges = useMemo(
    () => receiptHasCharges(activeReceipt),
    [activeReceipt]
  );

  const allActiveItemsAssigned = useMemo(
    () =>
      activeItems.length > 0 &&
      activeItems.every((item) => (sharesByItem[item.id] || []).length > 0),
    [activeItems, sharesByItem]
  );

  const allExpenseItems = useMemo(
    () => Object.values(itemsByReceipt).flat(),
    [itemsByReceipt]
  );

  const allExpenseItemsAssigned = useMemo(
    () =>
      allExpenseItems.length > 0 &&
      allExpenseItems.every(
        (item) => (sharesByItem[item.id] || []).length > 0
      ),
    [allExpenseItems, sharesByItem]
  );

  const allReceiptChargesApplied = useMemo(
    () =>
      receipts.every((receipt) =>
        receiptChargesAreApplied(
          receipt,
          itemsByReceipt[receipt.id] || [],
          sharesByItem
        )
      ),
    [itemsByReceipt, receipts, sharesByItem]
  );

  const allReceiptItemTotalsMatch = useMemo(
    () =>
      receipts.length > 0 &&
      receipts.every((receipt) =>
        receiptItemTotalMatches(
          receipt,
          itemsByReceipt[receipt.id] || []
        )
      ),
    [itemsByReceipt, receipts]
  );

  const activeReceiptChargesApplied = useMemo(
    () =>
      activeReceipt
        ? receiptChargesAreApplied(activeReceipt, activeItems, sharesByItem)
        : false,
    [activeItems, activeReceipt, sharesByItem]
  );

  const activeReceiptItemTotalMatches = useMemo(
    () =>
      activeReceipt
        ? receiptItemTotalMatches(activeReceipt, activeItems)
        : false,
    [activeItems, activeReceipt]
  );

  const settlementReadinessMessage =
    allExpenseItems.length === 0
      ? 'Add receipt items first'
      : !allReceiptItemTotalsMatch
        ? 'Match item totals to receipt first'
        : !allExpenseItemsAssigned
          ? 'Assign all items first'
          : !allReceiptChargesApplied
            ? 'Apply tax and service first'
            : '';
  const settlementIsReady = settlementReadinessMessage === '';

  useEffect(() => {
    onSettlementReadinessChange?.(
      expense.id,
      settlementIsReady,
      settlementReadinessMessage
    );
  }, [
    expense.id,
    onSettlementReadinessChange,
    settlementIsReady,
    settlementReadinessMessage,
  ]);

  useEffect(() => {
    if (!isLoading && !settlementIsReady) {
      onSettlementInvalidated?.(expense.id);
    }
  }, [
    expense.id,
    isLoading,
    onSettlementInvalidated,
    settlementIsReady,
  ]);

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
      await onSettlementInvalidated?.(expense.id);
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

  const handleUploadReceiptImage = async (event) => {
    event.preventDefault();

    if (!payerId || !receiptImageFile) return;

    const uploadForm = event.currentTarget;

    setIsUploadingReceipt(true);
    setError('');

    try {
      const response = await uploadReceiptImage(
        expense.id,
        payerId,
        receiptImageFile
      );
      const uploadedReceipt = response.data.data.receipt;
      const parsedItems = response.data.data.items || [];

      setOcrReview({
        receiptId: uploadedReceipt.id,
        rawText: response.data.data.raw_ocr_text || '',
        items: parsedItems.map(normalizeOcrItem),
      });

      setReceiptImageFile(null);
      setReceiptTotal('');
      setPayerId('');
      uploadForm.reset();

      await onSettlementInvalidated?.(expense.id);
      await loadReceiptsAndItems();
      setActiveReceiptId(uploadedReceipt.id);
    } catch (requestError) {
      console.error('Error uploading receipt image:', requestError);
      setError(
        requestError.response?.data?.detail?.message ||
          'Failed to upload receipt image'
      );
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleUpdateOcrItem = (index, field, value) => {
    setOcrReview((currentReview) => {
      if (!currentReview) return currentReview;

      return {
        ...currentReview,
        items: currentReview.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
      };
    });
  };

  const handleAddOcrItem = () => {
    setOcrReview((currentReview) => {
      if (!currentReview) return currentReview;

      return {
        ...currentReview,
        items: [
          ...currentReview.items,
          {
            id: `manual-${Date.now()}`,
            name: '',
            total_price: '0.00',
          },
        ],
      };
    });
  };

  const handleRemoveOcrItem = (index) => {
    setOcrReview((currentReview) => {
      if (!currentReview) return currentReview;

      return {
        ...currentReview,
        items: currentReview.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleSaveOcrItems = async () => {
    if (!activeReceipt || !activeOcrReview) return;

    const reviewItems = activeOcrReview.items.filter(
      (item) => item.name.trim() && Number(item.total_price) >= 0
    );

    if (reviewItems.length === 0) {
      setError('Add at least one parsed item before saving');
      return;
    }

    setIsSavingOcrItems(true);
    setError('');

    try {
      await Promise.all(
        reviewItems.map((item) => {
          const amount = Number(item.total_price).toFixed(2);

          return createItem(activeReceipt.id, {
            name: item.name.trim(),
            quantity: 1,
            unit_price: amount,
            total_price: amount,
          });
        })
      );

      setOcrReview(null);
      await onSettlementInvalidated?.(expense.id);
      await loadReceiptsAndItems();
    } catch (requestError) {
      console.error('Error saving OCR items:', requestError);
      setError(
        requestError.response?.data?.detail?.message ||
          'Failed to save OCR items'
      );
    } finally {
      setIsSavingOcrItems(false);
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
      await onSettlementInvalidated?.(expense.id);
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

  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemPrice(Number(item.total_price || 0).toFixed(2));
    setSelectedUsersByItem((currentSelections) => ({
      ...currentSelections,
      [item.id]: (sharesByItem[item.id] || []).map((share) =>
        String(share.user_id)
      ),
    }));
    setError('');
    setNotice('');
  };

  const cancelEditingItem = () => {
    const cancelledItemId = editingItemId;
    setEditingItemId('');
    setEditItemName('');
    setEditItemPrice('');
    setSelectedUsersByItem((currentSelections) => ({
      ...currentSelections,
      [cancelledItemId]: [],
    }));
  };

  const handleUpdateItem = async (item) => {
    if (!editItemName.trim() || editItemPrice === '') return;

    const selectedUserIds = selectedUsersByItem[item.id] || [];
    const existingShares = sharesByItem[item.id] || [];
    if (selectedUserIds.length === 0 && existingShares.length > 0) {
      setError('Choose at least one member for this item');
      return;
    }

    const amount = Number(editItemPrice);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter a valid item price');
      return;
    }

    setItemActionId(item.id);
    setError('');
    setNotice('');

    try {
      const formattedAmount = amount.toFixed(2);
      const financialChanged =
        Math.abs(amount - Number(item.total_price || 0)) >= 0.005;
      const currentUserIds = existingShares
        .map((share) => String(share.user_id))
        .sort();
      const nextUserIds = [...selectedUserIds].sort();
      const assignmentsChanged =
        currentUserIds.length !== nextUserIds.length ||
        currentUserIds.some((userId, index) => userId !== nextUserIds[index]);
      const updatePayload = {
        name: editItemName.trim(),
      };

      if (financialChanged) {
        Object.assign(updatePayload, {
          quantity: 1,
          unit_price: formattedAmount,
          total_price: formattedAmount,
        });
      }

      await updateItem(item.id, updatePayload);

      if (
        (financialChanged || assignmentsChanged) &&
        selectedUserIds.length > 0
      ) {
        await createEqualItemShares(item.id, selectedUserIds);
      }

      if (financialChanged || assignmentsChanged) {
        await onSettlementInvalidated?.(expense.id);
      }

      cancelEditingItem();
      await loadReceiptsAndItems();

      if (financialChanged || assignmentsChanged) {
        setNotice(
          'Item and assignments updated. Apply receipt charges again, then recalculate the settlement.'
        );
      } else {
        setNotice('Item name updated.');
      }
    } catch (requestError) {
      console.error('Error updating item:', requestError);
      setError(
        requestError.response?.data?.detail?.message || 'Failed to update item'
      );
    } finally {
      setItemActionId('');
    }
  };

  const handleDeleteItem = async (item) => {
    const hasAssignments = (sharesByItem[item.id] || []).length > 0;
    const warning = hasAssignments
      ? `Remove "${item.name}"? Its member assignments will also be removed, and settlement totals must be recalculated.`
      : `Remove "${item.name}"?`;

    if (!window.confirm(warning)) return;

    setItemActionId(item.id);
    setError('');
    setNotice('');

    try {
      await deleteItem(item.id);
      if (editingItemId === item.id) cancelEditingItem();
      await onSettlementInvalidated?.(expense.id);
      await loadReceiptsAndItems();
      setNotice(
        hasAssignments
          ? 'Item and assignments removed. Recalculate the settlement totals.'
          : 'Item removed.'
      );
    } catch (requestError) {
      console.error('Error deleting item:', requestError);
      setError(
        requestError.response?.data?.detail?.message || 'Failed to remove item'
      );
    } finally {
      setItemActionId('');
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
      const response = await createEqualItemShares(item.id, selectedUserIds);

      setSharesByItem((currentShares) => ({
        ...currentShares,
        [item.id]: response.data.data,
      }));

      setSelectedUsersByItem((currentSelections) => ({
        ...currentSelections,
        [item.id]: [],
      }));
      await onSettlementInvalidated?.(expense.id);
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

  const handleAllocateReceiptCharges = async () => {
    if (!activeReceipt || !allActiveItemsAssigned) return;

    setIsAllocatingCharges(true);
    setError('');

    try {
      const response = await allocateReceiptCharges(activeReceipt.id);
      const updatedShares = response.data.data.shares || [];
      const updatedSharesByItem = groupSharesByItem(updatedShares);

      setSharesByItem((currentShares) => ({
        ...currentShares,
        ...updatedSharesByItem,
      }));
      await onSettlementInvalidated?.(expense.id);
      setNotice('Tax and service applied to shares.');
    } catch (requestError) {
      console.error('Error allocating receipt charges:', requestError);
      setError(
        requestError.response?.data?.detail?.message ||
          'Failed to allocate tax and service charge'
      );
    } finally {
      setIsAllocatingCharges(false);
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
            <div className="space-y-4">
              <select
                value={payerId}
                onChange={(event) => setPayerId(event.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
                required
              >
                <option value="">Choose payer</option>

                {members.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {formatMemberLabel(member)}
                  </option>
                ))}
              </select>

              <form onSubmit={handleUploadReceiptImage} className="space-y-3">
                <label className="block rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 px-4 py-4">
                  <span className="block text-sm font-extrabold text-[#6D4AEF]">
                    Upload receipt image
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-indigo-400">
                    OCR will create a reviewable receipt draft.
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setReceiptImageFile(event.target.files?.[0] || null)
                    }
                    className="mt-3 block w-full text-xs font-semibold text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-extrabold file:text-[#6D4AEF]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!payerId || !receiptImageFile || isUploadingReceipt}
                  className="w-full rounded-2xl bg-[#6D4AEF] hover:bg-[#5938D6] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                >
                  {isUploadingReceipt ? 'Uploading...' : 'Upload and Parse Receipt'}
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs font-extrabold uppercase text-slate-300">
                  or
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <form onSubmit={handleCreateReceipt} className="space-y-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={receiptTotal}
                  onChange={(event) => setReceiptTotal(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
                  placeholder="Receipt total"
                  required
                />

                <button
                  type="submit"
                  disabled={!payerId || isSavingReceipt}
                  className="w-full rounded-2xl bg-[#6D4AEF] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#5938D6] disabled:bg-slate-300"
                >
                  {isSavingReceipt ? 'Creating...' : 'Create Manual Receipt'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.length > 1 && (
                <select
                  value={activeReceipt?.id || ''}
                  onChange={(event) => setActiveReceiptId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
                >
                  {receipts.map((receipt, index) => (
                    <option key={receipt.id} value={receipt.id}>
                      Receipt {index + 1} -{' '}
                      {formatCurrency(receipt.total_amount)}
                    </option>
                  ))}
                </select>
              )}

              {activeOcrReview && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        OCR review
                      </p>
                      <p className="mt-1 text-xs font-semibold text-indigo-400">
                        Check the parsed items before saving them.
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#6D4AEF]">
                      {activeOcrReview.items.length} items
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {activeOcrReview.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_96px_68px] gap-2"
                      >
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) =>
                            handleUpdateOcrItem(index, 'name', event.target.value)
                          }
                          className="min-w-0 rounded-2xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#6D4AEF]"
                          placeholder="Item name"
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.total_price}
                          onChange={(event) =>
                            handleUpdateOcrItem(
                              index,
                              'total_price',
                              event.target.value
                            )
                          }
                          className="min-w-0 rounded-2xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#6D4AEF]"
                          placeholder="Price"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveOcrItem(index)}
                          className="rounded-2xl bg-[#FFE6E3] px-2 text-xs font-extrabold text-[#B96870]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleAddOcrItem}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#6D4AEF]"
                    >
                      Add Row
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveOcrItems}
                      disabled={isSavingOcrItems}
                      className="rounded-2xl bg-[#6D4AEF] hover:bg-[#5938D6] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                    >
                      {isSavingOcrItems ? 'Saving...' : 'Save OCR Items'}
                    </button>
                  </div>
                </div>
              )}

              <ReceiptTotalStatus receipt={activeReceipt} items={activeItems} />

              {activeReceiptHasCharges && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        Tax and service allocation
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Add {formatCurrency(getReceiptChargeTotal(activeReceipt))}{' '}
                        from the receipt into member final shares.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E4F3FF] px-3 py-1 text-xs font-extrabold text-[#27658B]">
                      Tax {formatCurrency(activeReceipt.tax_amount)} · Service{' '}
                      {formatCurrency(activeReceipt.service_charge_amount)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAllocateReceiptCharges}
                    disabled={
                      activeReceiptChargesApplied ||
                      !activeReceiptItemTotalMatches ||
                      !allActiveItemsAssigned ||
                      isAllocatingCharges
                    }
                    className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-extrabold ${
                      activeReceiptChargesApplied
                        ? 'bg-[#DDF8EF] text-[#3F8F79]'
                        : 'bg-[#6D4AEF] text-white hover:bg-[#5938D6] disabled:bg-[#F7F3FA] disabled:text-slate-400'
                    }`}
                  >
                    {activeReceiptChargesApplied
                      ? '✓ Tax and service applied'
                      : isAllocatingCharges
                        ? 'Applying...'
                        : !activeReceiptItemTotalMatches
                          ? 'Match item totals first'
                          : allActiveItemsAssigned
                            ? 'Apply Tax and Service to Shares'
                            : 'Assign All Items First'}
                  </button>
                </div>
              )}

              <form
                onSubmit={handleCreateItem}
                className="grid grid-cols-[1fr_100px] gap-3"
              >
                <input
                  type="text"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
                  placeholder="Item name"
                  required
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemPrice}
                  onChange={(event) => setItemPrice(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
                  placeholder="Price"
                  required
                />

                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="col-span-2 rounded-2xl bg-[#F1EBFF] px-4 py-3 text-sm font-extrabold text-[#5938D6] hover:bg-[#E8DEFF] disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {isSavingItem ? 'Adding...' : 'Add Item'}
                </button>
              </form>

              {activeItems.length === 0 ? (
                <p className="rounded-2xl bg-[#FFF9F4] px-4 py-3 text-sm font-semibold text-slate-400">
                  No items added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeItems.map((item) => {
                    const itemShares = sharesByItem[item.id] || [];
                    const selectedUserIds = selectedUsersByItem[item.id] || [];
                    const isAssigned = itemShares.length > 0;
                    const itemShareHasCharges = itemShares.some(shareHasCharges);
                    const isEditing = editingItemId === item.id;
                    const isActing = itemActionId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-[#FFF9F4] p-4"
                      >
                        {isEditing ? (
                          <div className="grid grid-cols-[1fr_96px] gap-2">
                            <input
                              type="text"
                              value={editItemName}
                              onChange={(event) =>
                                setEditItemName(event.target.value)
                              }
                              className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#6D4AEF]"
                              aria-label="Item name"
                            />

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editItemPrice}
                              onChange={(event) =>
                                setEditItemPrice(event.target.value)
                              }
                              className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#6D4AEF]"
                              aria-label="Item price"
                            />

                            <div className="col-span-2">
                              <p className="mb-2 text-xs font-extrabold uppercase text-slate-400">
                                Assigned members
                              </p>

                              <div className="grid gap-2 sm:grid-cols-2">
                                {members.map((member) => {
                                  const userId = String(member.user_id);
                                  const isSelected = (
                                    selectedUsersByItem[item.id] || []
                                  ).includes(userId);

                                  return (
                                    <label
                                      key={`edit-${item.id}-${member.user_id}`}
                                      className={`flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold ${
                                        isSelected
                                          ? 'bg-indigo-50 text-[#5938D6]'
                                          : 'bg-white text-slate-500'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          handleToggleUser(item.id, userId)
                                        }
                                        className="h-4 w-4 accent-[#6D4AEF]"
                                      />
                                      <span>{formatMemberLabel(member)}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="col-span-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(item)}
                                disabled={isActing}
                                className="rounded-xl bg-[#F1EBFF] px-3 py-2 text-xs font-extrabold text-[#5938D6] disabled:text-slate-400"
                              >
                                {isActing ? 'Saving...' : 'Save'}
                              </button>

                              <button
                                type="button"
                                onClick={cancelEditingItem}
                                disabled={isActing}
                                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-extrabold text-slate-900">
                                {item.name}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-400">
                                Quantity {item.quantity}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-extrabold text-slate-900">
                                {formatCurrency(item.total_price)}
                              </p>

                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingItem(item)}
                                  disabled={isActing}
                                  className="rounded-xl bg-[#F1EBFF] px-3 py-1.5 text-xs font-extrabold text-[#5938D6]"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item)}
                                  disabled={isActing}
                                  className="rounded-xl bg-[#FFE6E3] px-3 py-1.5 text-xs font-extrabold text-[#B96870]"
                                >
                                  {isActing ? 'Removing...' : 'Remove'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {isAssigned ? (
                          <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-extrabold uppercase text-slate-400">
                                Split preview
                              </p>

                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-600">
                                {itemShareHasCharges
                                  ? 'Final totals'
                                  : `${itemShares.length} people`}
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              {itemShares.map((share) => {
                                const member = memberMap[String(share.user_id)];

                                return (
                                  <div
                                    key={share.id}
                                    className="rounded-xl bg-[#FFF9F4] px-3 py-2"
                                  >
                                    <div className="flex items-center justify-between gap-3">
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

                                    {shareHasCharges(share) && (
                                      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-400">
                                        <span>
                                          Item{' '}
                                          {formatCurrency(
                                            share.item_share_amount
                                          )}
                                        </span>
                                        <span>
                                          Tax{' '}
                                          {formatCurrency(
                                            share.tax_share_amount
                                          )}
                                        </span>
                                        <span>
                                          Service{' '}
                                          {formatCurrency(
                                            share.service_charge_share_amount
                                          )}
                                        </span>
                                      </div>
                                    )}
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
                                          ? 'border-[#6D4AEF] bg-indigo-50 text-[#6D4AEF]'
                                          : 'border-white bg-white text-slate-500'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          handleToggleUser(item.id, userId)
                                        }
                                        className="h-4 w-4 accent-[#6D4AEF]"
                                      />

                                      <span>{formatMemberLabel(member)}</span>
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
                              className="w-full rounded-2xl bg-[#6D4AEF] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#5938D6] disabled:bg-slate-400"
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

      {notice && (
        <p className="mt-3 rounded-2xl bg-[#E4F3FF] px-4 py-3 text-sm font-semibold text-[#27658B]">
          {notice}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-[#B4233C]">{error}</p>
      )}
    </div>
  );
}
