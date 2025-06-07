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
  category: string
  stock: number
  image?: string
  shopId: string
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
