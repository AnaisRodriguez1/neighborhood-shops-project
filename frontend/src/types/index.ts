export interface User {
  id: string
  email: string
  nombre: string
  role: "presidente" | "locatario" | "comprador"
  token?: string
}

export interface Tienda {
  id: string
  nombre: string
  descripcion: string
  direccion: string
  telefono: string
  email: string
  horario: string
  delivery: boolean
  slug: string
  puntuacion?: number
  locatarioId: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  stock: number
  imagen?: string
  tiendaId: string
}

export interface CartItem {
  producto: Producto
  cantidad: number
  tienda: Tienda
}

export interface ViewMode {
  current: "admin" | "comprador"
  originalRole: "presidente" | "locatario" | "comprador"
}
