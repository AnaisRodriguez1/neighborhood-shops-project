import axios from "axios"

const API_BASE_URL = import.meta.env.DEV 
  ? "http://localhost:8080/api" 
  : "https://backend-neighborhood-shops-project-production.up.railway.app/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password })
    return data
  },

  register: async (userData: any) => {
    const { data } = await api.post("/auth/register", userData)
    return data
  },

  checkAuthStatus: async (token: string) => {
    const { data } = await api.get("/auth/check-status", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  // Shops
  getShops: async (page?: number, limit?: number) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ""

    const { data } = await api.get(`/shops${query}`)
    return data
  },

  getShop: async (id: string) => {
    const { data } = await api.get(`/shops/id/${id}`)
    return data
  },

  getShopBySlug: async (slug: string) => {
    const { data } = await api.get(`/shops/slug/${slug}`)
    return data
  },

  createShop: async (shopData: any) => {
    const { data } = await api.post("/shops", shopData)
    return data
  },

  updateShop: async (id: string, shopData: any) => {
    const { data } = await api.patch(`/shops/${id}`, shopData)
    return data
  },  deleteShop: async (id: string) => {
    const { data } = await api.delete(`/shops/${id}`)
    return data
  },

  // Admin Methods for deleting
  adminDeleteShop: async (shopId: string) => {
    const { data } = await api.delete(`/shops/admin/${shopId}`)
    return data
  },

  // Admin Metrics
  getAdminMetrics: async () => {
    const { data } = await api.get("/shops/admin/metrics")
    return data
  },

  // Products
  getProducts: async (page?: number, limit?: number) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ""

    const { data } = await api.get(`/products${query}`)
    return data
  },

  getProductsByShop: async (shopId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ""

    const { data } = await api.get(`/products/shop/${shopId}${query}`)
    return data
  },

  getProduct: async (id: string) => {
    const { data } = await api.get(`/products/${id}`)
    return data
  },

  createProduct: async (productData: any) => {
    const { data } = await api.post("/products", productData)
    return data
  },

  updateProduct: async (id: string, productData: any) => {
    const { data } = await api.patch(`/products/${id}`, productData)
    return data
  },
  deleteProduct: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },
  // Admin Methods for deleting products
  adminDeleteProduct: async (productId: string) => {
    const { data } = await api.delete(`/products/admin/${productId}`)
    return data
  },

  // Admin Methods for users
  getAllUsers: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/auth/admin/users?page=${page}&limit=${limit}`)
    return data
  },

  adminDeleteUser: async (userId: string) => {
    const { data } = await api.delete(`/auth/admin/users/${userId}`)
    return data
  },

}
