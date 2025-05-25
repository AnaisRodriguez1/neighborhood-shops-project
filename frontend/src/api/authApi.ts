import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend-neighborhood-shops-project-production.up.railway.app/api/auth', // Cambia esto por la URL de tu backend
  withCredentials: true, // 👈 esto es correcto si manejas cookies (aunque usando Bearer Token no es estrictamente necesario)
});

// Register
export const registerRequest = async (newUser: { email: string; password: string; name: string }) => {
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
