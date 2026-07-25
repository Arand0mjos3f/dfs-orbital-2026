import api from './axios';

export const getGroupExpenses = (groupId, userId) =>
  api.get(`/groups/${groupId}/expenses`, {
    params: { user_id: userId },
  });

export const createGroupExpense = (groupId, payload) =>
  api.post(`/groups/${groupId}/expenses`, payload);

export const updateExpense = (expenseId, payload) =>
  api.patch(`/expenses/${expenseId}`, payload);
