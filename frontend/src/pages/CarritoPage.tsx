"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { ShoppingCart, Plus, Minus, Trash2, Store, Package } from "lucide-react"

export default function CarritoPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useCart()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  // Agrupar items por tienda
  const itemsByStore = items.reduce(
    (acc, item) => {
      const storeId = item.tienda.id
      if (!acc[storeId]) {
        acc[storeId] = {
          tienda: item.tienda,
          items: [],
        }
      }
      acc[storeId].items.push(item)
      return acc
    },
    {} as Record<string, { tienda: any; items: any[] }>,
  )

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
  }

  const handleClearCart = () => {
    if (window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      clearCart()
    }
  }

  const handleCheckout = async () => {
    setIsProcessing(true)

    // Simular proceso de compra
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Aquí iría la lógica real de checkout cuando tengas los endpoints
      alert("¡Compra realizada con éxito! (Simulado)")
      clearCart()
    } catch (error) {
      alert("Error al procesar la compra")
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-8">Explora nuestras tiendas y encuentra productos increíbles</p>
            <Link
              to="/tiendas"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explorar Tiendas
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
            <p className="text-gray-600 mt-1">
              {getTotalItems()} {getTotalItems() === 1 ? "producto" : "productos"} de {Object.keys(itemsByStore).length}{" "}
              {Object.keys(itemsByStore).length === 1 ? "tienda" : "tiendas"}
            </p>
          </div>

          <button
            onClick={handleClearCart}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Vaciar carrito</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.values(itemsByStore).map(({ tienda, items: storeItems }) => (
              <div key={tienda.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Store Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tienda.nombre}</h3>
                      <p className="text-sm text-gray-600">{storeItems.length} productos</p>
                    </div>
                  </div>
                </div>

                {/* Store Items */}
                <div className="divide-y divide-gray-200">
                  {storeItems.map((item) => (
                    <div key={item.producto.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.producto.imagen ? (
                            <img
                              src={item.producto.imagen || "/placeholder.svg"}
                              alt={item.producto.nombre}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-900 truncate">{item.producto.nombre}</h4>
                          <p className="text-sm text-gray-600 truncate">{item.producto.descripcion}</p>
                          <p className="text-sm text-gray-500">{item.producto.categoria}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.producto.id, item.cantidad - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="w-8 text-center font-medium">{item.cantidad}</span>

                          <button
                            onClick={() => handleQuantityChange(item.producto.id, item.cantidad + 1)}
                            disabled={item.cantidad >= item.producto.stock}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${(item.producto.precio * item.cantidad).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">${item.producto.precio} c/u</p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.producto.id)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getTotalItems()} productos)</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Información de Entrega</h4>
                <p className="text-sm text-blue-700">
                  Los productos de diferentes tiendas pueden tener tiempos de entrega distintos.
                </p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Procesando..." : "Proceder al Pago"}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Al continuar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
