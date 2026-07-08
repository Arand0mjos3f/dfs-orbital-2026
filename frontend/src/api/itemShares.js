import api from './axios';

export const createItemShares = (itemId, payload) =>
  api.post(`/items/${itemId}/shares`, payload);

export const getItemShares = (itemId) => api.get(`/items/${itemId}/shares`);

export const updateItemShare = (itemShareId, payload) =>
  api.patch(`/item-shares/${itemShareId}`, payload);

export const deleteItemShare = (itemShareId) =>
  api.delete(`/item-shares/${itemShareId}`);

export const allocateReceiptCharges = (receiptId) =>
  api.post(`/receipts/${receiptId}/shares/allocate-charges`);