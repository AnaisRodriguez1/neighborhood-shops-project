// src/api/authApi.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  withCredentials: true,
});

export const loginRequest = async (email: string, password: string) => {
  const { data } = await API.post('/login', { email, password });
  return data; // { id, token }
};

export const checkAuthStatusRequest = async (token: string) => {
  const { data } = await API.get('/check-status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data; // { id, name, role, email, token }
};
