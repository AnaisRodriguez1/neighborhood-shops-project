import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Clock, Package, CheckCircle, User, MapPin, Phone, AlertCircle } from 'lucide-react'

interface OrderItem {
  product: {
    _id: string
    name: string
    price: number
    images: string[]
  }
  quantity: number
  price: number
  _id: string
}

interface PendingOrder {
  _id: string
  client: {
    _id: string
    name: string
    email: string
  }
  shop: {
    _id: string
    name: string
    address: string
  }
  items: OrderItem[]
  deliveryAddress: {
    fullAddress: string
    district: string
    reference?: string
    lat?: number
    lng?: number
  }
  totalAmount: number
  status: string
  notes?: string
  paymentMethod: string
  createdAt: string
  estimatedDeliveryTime?: string
}

const statusConfig = {
  pendiente: { 
    label: 'Pendiente', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock
  },
  confirmado: { 
    label: 'Confirmado', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CheckCircle
  },
  preparando: { 
    label: 'Preparando', 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    icon: Package
  },
  listo: { 
    label: 'Listo', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle
  }
}

const nextStatus = {
  pendiente: 'confirmado',
  confirmado: 'preparando',
  preparando: 'listo',
  listo: 'entregado'
}

export default function PedidosPendientesPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  useEffect(() => {
    loadPendingOrders()
  }, [])

  const loadPendingOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await api.getMyShopPendingOrders()
      console.log('Pedidos pendientes:', ordersData)
      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error loading pending orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId)
      await api.updateOrderStatus(orderId, newStatus)
      
      // Si el estado es "entregado", remover de la lista
      if (newStatus === 'entregado') {
        setOrders(prev => prev.filter(order => order._id !== orderId))
      } else {
        // Actualizar el estado en la lista
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado del pedido')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || user.role !== 'locatario') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Solo los locatarios pueden acceder a esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pedidos Pendientes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gestiona los pedidos de tus tiendas que están pendientes de procesamiento.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando pedidos...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay pedidos pendientes
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Todos los pedidos de tus tiendas están al día.
            </p>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
              const StatusIcon = statusInfo?.icon || Clock
              const next = nextStatus[order.status as keyof typeof nextStatus]

              return (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Pedido #{order._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusInfo?.label}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.client.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {order.client.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.deliveryAddress.district}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {order.deliveryAddress.fullAddress}
                          </p>
                          {order.deliveryAddress.reference && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Ref: {order.deliveryAddress.reference}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shop Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.shop.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.shop.address}
                        </p>
                      </div>
                    </div>

                    {/* Payment Method & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Método de pago:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                          {order.paymentMethod}
                        </p>
                      </div>
                      {order.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Notas:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {order.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Productos ({order.items.length})
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          {item.product.images?.[0] && (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Cantidad: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {next && (
                        <button
                          onClick={() => updateOrderStatus(order._id, next)}
                          disabled={updatingOrder === order._id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          {updatingOrder === order._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Actualizando...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                {next === 'confirmado' && 'Confirmar Pedido'}
                                {next === 'preparando' && 'Marcar Preparando'}
                                {next === 'listo' && 'Marcar Listo'}
                                {next === 'entregado' && 'Marcar Entregado'}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                      
                      {order.status !== 'pendiente' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'entregado')}
                          disabled={updatingOrder === order._id}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          {updatingOrder === order._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Actualizando...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Marcar Entregado</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
