import api from './axios';

export const recalculateExpenseDebts = (expenseId) =>
  api.post(`/expenses/${expenseId}/debts/recalculate`);

export const getGroupDebts = (groupId, userId) =>
  api.get(`/groups/${groupId}/debts`, {
    params: { user_id: userId },
  });

export const getGroupDebtSummary = (groupId, userId) =>
  api.get(`/groups/${groupId}/debts/summary`, {
    params: { user_id: userId },
  });

export const markDebtPaid = (debtId, userId, payload) =>
  api.patch(`/debts/${debtId}/mark-paid`, payload, {
    params: { user_id: userId },
  });

export const confirmDebtReceived = (debtId, userId) =>
  api.patch(`/debts/${debtId}/confirm-received`, null, {
    params: { user_id: userId },
  });