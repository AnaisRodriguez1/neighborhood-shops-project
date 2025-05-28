import axios from 'axios';

// Development vs Production API URL
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8080/api/products'
  : 'https://backend-neighborhood-shops-project-production.up.railway.app/api/products';

const API = axios.create({
  baseURL: API_BASE_URL,
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

// Get all products
export const getProductsRequest = async (page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  
  const { data } = await API.get(`/${query}`);
  return data;
};

// Get product by ID
export const getProductRequest = async (id: string) => {
  const { data } = await API.get(`/${id}`);
  return data;
};

// Create product
export const createProductRequest = async (productData: any) => {
  const { data } = await API.post('/', productData);
  return data;
};

// Update product
export const updateProductRequest = async (id: string, productData: any) => {
  const { data } = await API.patch(`/${id}`, productData);
  return data;
};

// Delete product
export const deleteProductRequest = async (id: string) => {
  const { data } = await API.delete(`/${id}`);
  return data;
};
