export interface User {
  id: string
  email: string
  name: string
  role: "presidente" | "locatario" | "comprador"
  token?: string
}

export interface Tienda {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  schedule: string
  delivery: boolean
  slug: string
  rating?: number
  score?: number
  ownerId: string
}

export interface Producto {
  id: string
  name: string
  description: string
  price: number
  category?: string
  stock: number
  image?: string
  images?: Array<{ publicId: string; url: string }>
  shopId: string
  tags?: string[]
  calories?: number
  rating?: number
  slug?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  rating?: number
  images?: Array<{ publicId: string; url: string }>
  shopId: string | { name: string; _id: string }
  tags?: string[]
  calories?: number
  slug?: string
  // Computed properties for admin functionality
  title?: string
  isActive?: boolean
  score?: number
}

export interface CartItem {
  product: Producto
  quantity: number
  shop: Tienda
}

export interface ViewMode {
  current: "presidente" | "locatario" | "comprador"
  originalRole: "presidente" | "locatario" | "comprador"
}
