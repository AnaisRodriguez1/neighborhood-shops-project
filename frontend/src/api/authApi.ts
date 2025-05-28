import axios from 'axios';

// Development vs Production API URL
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8080/api/auth'
  : 'https://backend-neighborhood-shops-project-production.up.railway.app/api/auth';

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Register
export const registerRequest = async (newUser: { email: string; password: string; name: string; rol?: string }) => {
  const { data } = await API.post('/register', newUser);
  return data;
};

// Login
export const loginRequest = async (email: string, password: string) => {
  const { data } = await API.post('/login', { email, password });
  return data; // { id, token }
};

// Check status
export const checkAuthStatusRequest = async (token: string) => {
  const { data } = await API.get('/check-status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data; // { id, name, role, email, token }
};
