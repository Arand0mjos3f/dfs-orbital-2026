import api from './axios';

export const getGroupDebts = (groupId) => api.get(`/groups/${groupId}/debts`);
