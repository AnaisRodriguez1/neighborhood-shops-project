import { useState, useEffect } from 'react'
import { Package, Eye, RefreshCw, AlertCircle } from 'lucide-react'
import { Order, Tienda } from '../types'
import { apiService } from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'
import OrderDetailModal from '../components/OrderDetailModal'

interface ShopOrdersManagementProps {
  shop: Tienda
}

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

export default function ShopOrdersManagement({ shop }: ShopOrdersManagementProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // WebSocket for real-time updates
  const { joinShopRoom } = useWebSocket({
    onOrderCreated: (order: Order) => {
      if (order.shopId === shop.id) {
        setOrders(prev => [order, ...prev])
      }
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
    loadOrders()
    joinShopRoom(shop.id)
  }, [shop.id, joinShopRoom])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getOrdersByShop(shop.id)
      setOrders(response || [])
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando pedidos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
          <button
            onClick={loadOrders}
            className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="w-6 h-6 mr-2" />
            Gestión de Pedidos - {shop.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Total de pedidos: {orders.length}
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Status Filters */}
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
        </button>        {Object.entries(orderCounts).map(([status, count]) => (
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

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {statusFilter === 'all' ? 'No hay pedidos' : `No hay pedidos ${statusLabels[statusFilter as OrderStatus].toLowerCase()}`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {statusFilter === 'all' 
              ? 'Los pedidos aparecerán aquí cuando los clientes hagan compras.'
              : 'Cambia el filtro para ver otros pedidos.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pedido
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
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.id?.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.client?.name || `Cliente ${order.customerId.slice(-8)}`}
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
  )
}
