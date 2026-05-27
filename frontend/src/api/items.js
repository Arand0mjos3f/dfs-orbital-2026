import api from './axios';

export const createItem = (receiptId, payload) => api.post(`/receipts/${receiptId}/items`, payload);

export const getItems = (receiptId) => api.get(`/receipts/${receiptId}/items`);

export const updateItem = (itemId, payload) => api.patch(`/items/${itemId}`, payload);

export const deleteItem = (itemId) => api.delete(`/items/${itemId}`);
