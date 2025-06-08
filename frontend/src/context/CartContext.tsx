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
    console.log("🛒 CartContext: Agregando producto al carrito")
    console.log("📦 Producto:", producto.name)
    console.log("🏪 Tienda:", tienda.name)
    console.log("🔢 Cantidad:", cantidad)
    
    setItems((prev) => {
      console.log("📋 Items actuales en carrito:", prev)
      const existingItem = prev.find((item) => item.product.id === producto.id)

      if (existingItem) {
        console.log("♻️ Producto ya existe, actualizando cantidad")
        const newItems = prev.map((item) =>
          item.product.id === producto.id ? { ...item, quantity: item.quantity + cantidad } : item,
        )
        console.log("📋 Nuevos items:", newItems)
        return newItems
      }

      console.log("✨ Producto nuevo, agregando al carrito")
      const newItems = [...prev, { product: producto, shop: tienda, quantity: cantidad }]
      console.log("📋 Nuevos items:", newItems)
      return newItems
    })
  }

  const removeFromCart = (productoId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productoId))
  }

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }

    setItems((prev) => prev.map((item) => (item.product.id === productoId ? { ...item, quantity: cantidad } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
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
