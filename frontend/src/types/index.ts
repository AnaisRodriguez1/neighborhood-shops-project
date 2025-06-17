export interface User {
  id: string
  email: string
  name: string
  role: "presidente" | "locatario" | "comprador" | "repartidor"
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
  deliveryAvailable: boolean
  slug: string
  rating?: number
  score?: number
  ownerId: string
  isActive?: boolean
  images?: string[] // [icono, dashboard]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category?: string
  stock: number
  image?: string
  images?: string[]
  shopId: string
  tags?: string[]
  calories?: number
  rating?: number
  slug?: string
}

export interface CartItem {
  product: Product
  quantity: number
  shop: Tienda
}

export interface ViewMode {
  current: "presidente" | "locatario" | "comprador"
  originalRole: "presidente" | "locatario" | "comprador"
}

export interface DeliveryAddress {
  street: string
  city: string
  postalCode: string
  country: string
  additionalInfo?: string
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  productName?: string
}

export interface Order {
  id: string
  _id?: string
  customerId: string
  client?: { _id: string; name: string; email: string } // Populated client data from backend
  shopId: string | Tienda
  shop?: Tienda
  items: OrderItem[]
  totalAmount: number
  total?: number // Computed property for UI convenience
  orderNumber?: string // Auto-generated order number
  status: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_entrega' | 'entregado' | 'cancelado'
  deliveryAddress: DeliveryAddress
  deliveryType?: 'delivery' | 'pickup'
  deliveryPersonId?: string | { _id: string; name: string; email: string }
  notes?: string
  orderDate: string
  estimatedDeliveryTime?: string
  actualDeliveryTime?: string
  createdAt: string
  updatedAt: string
}

export interface OrderSummary {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
}
