import api from './axios';

export const createReceipt = (expenseId, payload) =>
  api.post(`/expenses/${expenseId}/receipts`, payload);

export const getReceipts = (expenseId) => api.get(`/expenses/${expenseId}/receipts`);

export const getReceiptDetail = (receiptId) => api.get(`/receipts/${receiptId}`);

export const updateReceipt = (receiptId, payload) => api.patch(`/receipts/${receiptId}`, payload);
