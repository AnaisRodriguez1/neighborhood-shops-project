"use client"

import { useAuth } from "../../context/AuthContext"
import { useEffect, useState } from "react"
import { apiService } from "../../services/api"
import { useWebSocket } from "../../hooks/useWebSocket"
import { Order } from "../../types"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye,
  ArrowLeft,
  Filter
} from "lucide-react"
import { Link } from "react-router-dom"
import OrderDetailModal from "../../components/OrderDetailModal"

const statusConfig = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle },
  preparando: { label: "Preparando", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Package },
  listo: { label: "Listo", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  en_entrega: { label: "En Entrega", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
  entregado: { label: "Entregado", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle }
}

export default function MisPedidosPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'total'>('date')

  useWebSocket({
    onOrderCreated: (order) => {
      console.log("Nuevo pedido creado:", order)
      // Recargar pedidos para mostrar el nuevo
      loadOrders()
    },
    onOrderStatusUpdated: (orderData) => {
      console.log("Estado del pedido actualizado:", orderData)
      // Actualizar el pedido específico en la lista
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderData.orderId ? 
            { ...order, status: orderData.status, estimatedDeliveryTime: orderData.estimatedDeliveryTime } : 
            order
        )
      )
      // Mostrar notificación
      if (orderData.orderNumber) {
        const statusLabel = statusConfig[orderData.status as keyof typeof statusConfig]?.label || orderData.status
        alert(`Tu pedido ${orderData.orderNumber} cambió de estado a: ${statusLabel}`)
      }
    },
    onOrderAssigned: (orderData) => {
      console.log("Repartidor asignado:", orderData)
      // Recargar pedidos para mostrar información actualizada
      loadOrders()
    }
  })

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMyOrders()
      setOrders(response || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders
    .filter(order => filterStatus === 'all' || order.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        case 'total':
          return (b.totalAmount || b.total || 0) - (a.totalAmount || a.total || 0)
        default:
          return 0
      }
    })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/dashboard" 
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Pedidos</h1>
              <p className="text-gray-600 dark:text-gray-300">Historial completo de tus compras</p>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="preparando">Preparando</option>
                    <option value="listo">Listo</option>
                    <option value="en_entrega">En Entrega</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'total')}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="date">Fecha</option>
                    <option value="status">Estado</option>
                    <option value="total">Total</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {filteredOrders.length} de {orders.length} pedidos
              </div>
            </div>
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Cargando tus pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filterStatus === 'all' ? 'No tienes pedidos aún' : `No hay pedidos ${statusConfig[filterStatus as keyof typeof statusConfig]?.label.toLowerCase()}`}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {filterStatus === 'all' 
                ? 'Explora las tiendas y realiza tu primera compra'
                : 'Intenta cambiar el filtro para ver otros pedidos'
              }
            </p>
            <Link
              to="/tiendas"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>Explorar Tiendas</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.status]
              const StatusIcon = statusInfo.icon

              return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Pedido #{order.id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(order.createdAt)} • {typeof order.shopId === 'object' ? order.shopId.name : 'Tienda'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusInfo.label}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalAmount || order.total || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Artículos</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de entrega</p>                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {order.deliveryType === 'delivery' ? 'Domicilio' : order.deliveryType === 'pickup' ? 'Recoger en tienda' : 'Por definir'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="inline-block h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {item.quantity}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="inline-block h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            isOpen={true}
            onClose={() => setSelectedOrder(null)}
            canUpdateStatus={false}
          />
        )}
      </div>
    </div>
  )
}
