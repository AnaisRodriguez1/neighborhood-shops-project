import axios from 'axios';

// Development vs Production API URL
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8080/api/suppliers'
  : 'https://backend-neighborhood-shops-project-production.up.railway.app/api/suppliers';

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

// Get all suppliers
export const getSuppliersRequest = async () => {
  const { data } = await API.get('/');
  return data;
};

// Get supplier by ID
export const getSupplierByIdRequest = async (id: string) => {
  const { data } = await API.get(`/${id}`);
  return data;
};

// Get suppliers by category
export const getSuppliersByCategoryRequest = async (category: string) => {
  const { data } = await API.get(`/category/${category}`);
  return data;
};

// Create supplier
export const createSupplierRequest = async (supplierData: {
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  categories?: string[];
}) => {
  const { data } = await API.post('/', supplierData);
  return data;
};

// Update supplier
export const updateSupplierRequest = async (id: string, supplierData: {
  name?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  categories?: string[];
  isActive?: boolean;
}) => {
  const { data } = await API.patch(`/${id}`, supplierData);
  return data;
};

// Delete supplier (soft delete)
export const deleteSupplierRequest = async (id: string) => {
  const { data } = await API.delete(`/${id}`);
  return data;
};
