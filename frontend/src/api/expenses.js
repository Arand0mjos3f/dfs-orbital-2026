import api from './axios';

export const getExpenses = () => api.get('/expenses');

export const createExpense = (payload) => api.post('/expenses', payload);
