import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Package, Eye, RefreshCw, AlertCircle, Store } from 'lucide-react'
import { Order } from '../types'
import { apiService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../hooks/useWebSocket'
import OrderDetailModal from '../components/OrderDetailModal'

type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_entrega' | 'entregado' | 'cancelado'

const statusColors: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  confirmado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  preparando: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  listo: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  en_entrega: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  entregado: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

const statusLabels: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  listo: 'Listo',
  en_entrega: 'En Entrega',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export default function TodosLosPedidosPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  // WebSocket for real-time updates
  useWebSocket({
    onOrderCreated: () => {
      // Check if this order belongs to any of user's shops
      loadOrders()
    },
    onOrderStatusUpdated: (updatedOrder: Order) => {
      setOrders(prev => prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ))
    },
    onOrderAssigned: (assignedOrder: Order) => {
      setOrders(prev => prev.map(order => 
        order.id === assignedOrder.id ? assignedOrder : order
      ))
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
      setError(null)
      console.log('🏪 Loading all pending orders for shop owner...')
      
      // Use the backend endpoint that gets all pending orders for the shop owner
      const response = await apiService.getMyShopPendingOrders()
      console.log('📦 All shop orders response:', response)
      
      setOrders(response.data || response || [])
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus)
      // Order will be updated via WebSocket
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Error al actualizar el estado del pedido')
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

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  const orderCounts = {
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    confirmado: orders.filter(o => o.status === 'confirmado').length,
    preparando: orders.filter(o => o.status === 'preparando').length,
    listo: orders.filter(o => o.status === 'listo').length,
    en_entrega: orders.filter(o => o.status === 'en_entrega').length,
    entregado: orders.filter(o => o.status === 'entregado').length,
    cancelado: orders.filter(o => o.status === 'cancelado').length,
  }

  if (!user || user.role !== 'locatario') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Solo los propietarios de tiendas pueden acceder a esta página.
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
                <Package className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400" />
                Todos los Pedidos
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gestión centralizada de pedidos de todas tus tiendas
              </p>
            </div>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Status Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtrar por Estado</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-sm rounded-full border ${
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              Todos ({orders.length})
            </button>
            {Object.entries(orderCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  statusFilter === status
                    ? statusColors[status as OrderStatus] + ' border-current'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                }`}
              >
                {statusLabels[status as OrderStatus]} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando pedidos...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={loadOrders}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {statusFilter === 'all' ? 'No hay pedidos' : `No hay pedidos ${statusLabels[statusFilter as OrderStatus].toLowerCase()}`}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {statusFilter === 'all' 
                    ? 'Los pedidos de todas tus tiendas aparecerán aquí cuando los clientes hagan compras.'
                    : 'Cambia el filtro para ver otros pedidos.'
                  }
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Pedido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Tienda
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                #{order.id ? order.id.slice(-8) : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Store className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900 dark:text-white">
                                {typeof order.shopId === 'object' ? order.shopId.name : 'Tienda'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                              {statusLabels[order.status]}
                            </span>
                          </td>                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.customerId ? order.customerId.slice(-8) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(order.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatDate(order.orderDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsModalOpen(true)
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedOrder(null)
          }}
          onUpdateStatus={handleStatusUpdate}
          canUpdateStatus={true}
        />
      </div>
    </div>
  )
}
