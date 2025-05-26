"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { CartItem, Producto, Tienda } from "../types"

interface CartContextType {
  items: CartItem[]
  addToCart: (producto: Producto, tienda: Tienda, cantidad?: number) => void
  removeFromCart: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (producto: Producto, tienda: Tienda, cantidad = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.producto.id === producto.id)

      if (existingItem) {
        return prev.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item,
        )
      }

      return [...prev, { producto, tienda, cantidad }]
    })
  }

  const removeFromCart = (productoId: string) => {
    setItems((prev) => prev.filter((item) => item.producto.id !== productoId))
  }

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }

    setItems((prev) => prev.map((item) => (item.producto.id === productoId ? { ...item, cantidad } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.cantidad, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.producto.precio * item.cantidad, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
