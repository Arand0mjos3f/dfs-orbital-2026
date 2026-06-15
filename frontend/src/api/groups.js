import api from './axios';

export const getGroups = (userId) =>
  api.get('/groups', {
    params: { user_id: userId },
  });

export const getGroupDetail = (groupId, userId) =>
  api.get(`/groups/${groupId}`, {
    params: { user_id: userId },
  });

export const getGroupMembers = (groupId, userId) =>
  api.get(`/groups/${groupId}/members`, {
    params: { user_id: userId },
  });

export const createGroup = (payload) => api.post('/groups', payload);

export const updateGroup = (groupId, payload, userId) =>
  api.patch(`/groups/${groupId}`, payload, {
    params: { user_id: userId },
  });

export const deleteGroup = (groupId, userId) =>
  api.delete(`/groups/${groupId}`, {
    params: { user_id: userId },
  });

export const addGroupMember = (groupId, payload, userId) =>
  api.post(`/groups/${groupId}/members`, payload, {
    params: { user_id: userId },
  });