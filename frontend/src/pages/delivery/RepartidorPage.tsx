import { useState, useEffect } from 'react'
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Phone,
  Navigation,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWebSocket } from '../../hooks/useWebSocket'
import { Order } from '../../types'
import { apiService } from '../../services/api'
import OrderDetailModal from '../../components/OrderDetailModal'

const statusColors = {
  en_entrega: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  entregado: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
}

export default function RepartidorPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  // WebSocket for real-time updates
  useWebSocket({
    onOrderAssigned: (orderData) => {
      console.log("Nueva orden asignada:", orderData)
      loadMyDeliveries()
    },
    onOrderStatusUpdated: (updatedOrder: Order) => {
      setOrders(prev => prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ))
    }
  })

  useEffect(() => {
    if (user && user.role === 'repartidor') {
      loadMyDeliveries()
    }
  }, [user])
  const loadMyDeliveries = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🚚 Loading ALL deliveries for repartidor...')
      
      // Use the new endpoint that gets ALL deliveries (all statuses)
      const response = await apiService.getAllMyDeliveries()
      console.log('🚚 ALL deliveries response:', response)
      
      setOrders(response || [])
    } catch (err) {
      console.error('Error loading deliveries:', err)
      setError('Error al cargar las entregas asignadas')
    } finally {
      setLoading(false)
    }
  }

  const handleDeliverOrder = async (orderId: string) => {
    try {
      setUpdatingOrder(orderId)
      await apiService.updateOrderStatus(orderId, 'entregado')
      // Order will be updated via WebSocket
      alert('Pedido marcado como entregado exitosamente')
    } catch (err) {
      console.error('Error delivering order:', err)
      alert('Error al marcar el pedido como entregado')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP' 
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const activeOrders = orders.filter(order => order.status === 'en_entrega')
  const completedOrders = orders.filter(order => order.status === 'entregado')

  if (!user || user.role !== 'repartidor') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Solo los repartidores pueden acceder a esta página.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Package className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
                Mis Entregas
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gestiona tus entregas asignadas - {user.name}
              </p>
            </div>
          </div>
          <button
            onClick={loadMyDeliveries}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Package className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Entregas Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completadas Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Entregas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando entregas...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={loadMyDeliveries}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Active Deliveries */}
        {!loading && !error && activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Entregas Activas
            </h2>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-indigo-500">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Pedido #{order.id?.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(order.orderDate)} • {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors.en_entrega}`}>
                        En Entrega
                      </span>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Dirección de Entrega:</p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                          </p>                          {(order.deliveryAddress as any)?.reference && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Ref: {(order.deliveryAddress as any).reference}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>                    {/* Customer Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Cliente:</p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {order.client ? order.client.name : `ID: ${order.customerId?.slice(-8)}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Productos ({order.items.length}):
                      </p>                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 ring-2 ring-white dark:ring-gray-800 items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.quantity}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setIsModalOpen(true)
                        }}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleDeliverOrder(order.id)}
                        disabled={updatingOrder === order.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {updatingOrder === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Marcando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Marcar Entregado</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Deliveries */}
        {!loading && !error && completedOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Entregas Completadas
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Entregado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {completedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              #{order.id?.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.client?.name || `Cliente ${order.customerId?.slice(-8)}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(order.actualDeliveryTime || order.orderDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsModalOpen(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tienes entregas asignadas
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Las entregas asignadas aparecerán aquí cuando los locatarios te asignen pedidos.
            </p>
          </div>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedOrder(null)
          }}
          canUpdateStatus={false}
          canAssignDelivery={false}
        />
      </div>
    </div>
  )
}
