"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useWebSocket } from "../hooks/useWebSocket"
import { apiService } from "../services/api"
import { ShoppingCart, Plus, Minus, Trash2, Store, Package } from "lucide-react"
import { formatCurrency } from "../utils/format"

export default function CarritoPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderForm, setOrderForm] = useState({
    street: "",
    neighborhood: "",
    city: "",
    postalCode: "",
    notes: "",
    paymentMethod: "efectivo"
  })
  // WebSocket para notificaciones de pedidos
  useWebSocket({
    onOrderCreated: (order) => {
      console.log("Pedido creado:", order)
      // Mostrar notificación de éxito
    },
    onOrderStatusUpdated: (order) => {
      console.log("Estado del pedido actualizado:", order)
      // Mostrar notificación de cambio de estado
    }
  })
  // Agrupar items por tienda
  const itemsByStore = items.reduce(
    (acc, item) => {
      const storeId = item.shop.id
      if (!acc[storeId]) {
        acc[storeId] = {
          tienda: item.shop,
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
    if (!user) {
      alert("Debes iniciar sesión para realizar un pedido")
      navigate("/login")
      return
    }

    if (user.role !== "comprador") {
      alert("Solo los compradores pueden realizar pedidos")
      return
    }

    setShowOrderForm(true)
  }
  const handleSubmitOrder = async () => {
    if (!orderForm.street || !orderForm.city) {
      alert("Por favor completa los campos de dirección obligatorios (calle y ciudad)")
      return
    }

    setIsProcessing(true)

    try {      // Crear pedidos separados por tienda
      const orderPromises = Object.values(itemsByStore).map(async ({ tienda, items: storeItems }) => {
        const orderData = {
          shopId: tienda.id,
          items: storeItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          deliveryAddress: {
            street: orderForm.street,
            number: "s/n", // El backend requiere número, ponemos s/n si no se especifica
            district: orderForm.neighborhood || "Centro", // Mapear neighborhood a district
            city: orderForm.city
          },
          paymentMethod: orderForm.paymentMethod,
          notes: orderForm.notes
        }

        return await apiService.createOrder(orderData)
      })

      const orders = await Promise.all(orderPromises)
      
      // Mostrar éxito y limpiar carrito
      alert(`¡Pedidos creados exitosamente! Se han generado ${orders.length} pedido(s).`)
      clearCart()
      setShowOrderForm(false)
      
      // Navegar a la página de pedidos del usuario
      navigate("/mis-pedidos")

    } catch (error: any) {
      console.error("Error al crear pedido:", error)
      alert("Error al procesar la compra: " + (error.message || "Error desconocido"))
    } finally {
      setIsProcessing(false)
    }
  }
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Explora nuestras tiendas y encuentra productos increíbles</p>
            <Link
              to="/tiendas"
              className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              Explorar Tiendas
            </Link>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Carrito</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {getTotalItems()} {getTotalItems() === 1 ? "producto" : "productos"} de {Object.keys(itemsByStore).length}{" "}
              {Object.keys(itemsByStore).length === 1 ? "tienda" : "tiendas"}
            </p>
          </div>

          <button
            onClick={handleClearCart}
            className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Vaciar carrito</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.values(itemsByStore).map(({ tienda, items: storeItems }) => (
              <div key={tienda.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Store Header */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{tienda.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{storeItems.length} productos</p>
                    </div>
                  </div>
                </div>                {/* Store Items */}
                <div className="divide-y divide-gray-200 dark:divide-gray-600">                  {storeItems.map((item) => (
                    <div key={item.product.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.product.image ? (
                            <img
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{item.product.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.product.category}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>

                          <span className="w-8 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>

                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{formatCurrency(item.product.price)} c/u</p>
                        </div>{/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen del Pedido</h3>

              <div className="space-y-3 mb-6">                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({getTotalItems()} productos)</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">                  <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                </div>
              </div>              {/* Delivery Info */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Información de Entrega</h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Los productos de diferentes tiendas pueden tener tiempos de entrega distintos.
                </p>
              </div>

              {/* Order Form */}
              {showOrderForm && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Datos de Entrega</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        value={orderForm.street}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, street: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Ej: Av. Providencia 1234"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Comuna
                        </label>
                        <input
                          type="text"
                          value={orderForm.neighborhood}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Ej: Providencia"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={orderForm.city}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Ej: Santiago"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={orderForm.postalCode}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Ej: 7500000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Método de Pago
                      </label>
                      <select
                        value={orderForm.paymentMethod}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="billetera_digital">Billetera Digital</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notas (opcional)
                      </label>
                      <textarea
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Instrucciones especiales para la entrega..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Buttons */}
              {!showOrderForm ? (
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? "Procesando..." : "Proceder al Pago"}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="w-full bg-green-600 dark:bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? "Creando Pedido..." : "Confirmar Pedido"}
                  </button>
                  
                  <button
                    onClick={() => setShowOrderForm(false)}
                    disabled={isProcessing}
                    className="w-full bg-gray-500 dark:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Al continuar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
