import api from './axios';

export const getUsers = () => api.get('/users/');

export const registerUser = (userData) => api.post('/users/', userData);

export const loginUser = (credentials) =>
  api.post('/users/login', credentials);
