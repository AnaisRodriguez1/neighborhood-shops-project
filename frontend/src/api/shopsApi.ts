import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend-neighborhood-shops-project-production.up.railway.app/api/shops',
  withCredentials: true,
});

// Interceptor para agregar token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all shops
export const getShopsRequest = async (page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  
  const { data } = await API.get(`/${query}`);
  return data;
};

// Get shop by ID
export const getShopRequest = async (id: string) => {
  const { data } = await API.get(`/id/${id}`);
  return data;
};

// Get shop by slug
export const getShopBySlugRequest = async (slug: string) => {
  const { data } = await API.get(`/slug/${slug}`);
  return data;
};

// Create shop
export const createShopRequest = async (shopData: any) => {
  const { data } = await API.post('/', shopData);
  return data;
};

// Update shop
export const updateShopRequest = async (id: string, shopData: any) => {
  const { data } = await API.patch(`/${id}`, shopData);
  return data;
};

// Delete shop
export const deleteShopRequest = async (id: string) => {
  const { data } = await API.delete(`/${id}`);
  return data;
};

// Delete all shops (presidente only)
export const deleteAllShopsRequest = async () => {
  const { data } = await API.delete('/delete-all');
  return data;
};
