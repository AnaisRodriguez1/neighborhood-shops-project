import { useState, useEffect } from 'react'
import { Package, RefreshCw, Search, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { Order, Tienda } from '../../types'
import { apiService } from '../../services/api'
import { useWebSocket } from '../../hooks/useWebSocket'
import OrderDetailModal from '../../components/OrderDetailModal'
import { useAuth } from '../../context/AuthContext'

interface ShopOrdersPageProps {
  shop?: Tienda
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

export default function ShopOrdersPage({ shop: propShop }: ShopOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  
  const { user } = useAuth()
  const userRole = user?.role || 'comprador'
  
  // State for user's shop if not provided as prop
  const [userShop, setUserShop] = useState<Tienda | null>(null)
  const [loadingShop, setLoadingShop] = useState(!propShop)
  
  // Use provided shop or load user's shop
  const shop = propShop || userShop

  // WebSocket for real-time updates
  const { joinShopRoom } = useWebSocket({
    onOrderCreated: (order: Order) => {
      console.log('📦 New order received via WebSocket:', order)
      if (order.shopId === shop?.id || order.shop?.id === shop?.id) {
        setOrders(prev => [order, ...prev])
      }
    },
    onOrderStatusUpdated: (updatedOrder: Order) => {
      console.log('🔄 Order status updated via WebSocket:', updatedOrder)
      if (updatedOrder) {
        setOrders(prev => prev.map(order => 
          isSameOrder(order, updatedOrder) ? updatedOrder : order
        ))
        
        // Update selected order if it's the same one
        if (selectedOrder && isSameOrder(selectedOrder, updatedOrder)) {
          setSelectedOrder(updatedOrder)
        }
      }
    },
    onOrderAssigned: (assignedOrder: Order) => {
      console.log('🚚 Order assigned via WebSocket:', assignedOrder)
      if (assignedOrder) {
        setOrders(prev => prev.map(order => 
          isSameOrder(order, assignedOrder) ? assignedOrder : order
        ))
        
        // Update selected order if it's the same one
        if (selectedOrder && isSameOrder(selectedOrder, assignedOrder)) {
          setSelectedOrder(assignedOrder)
        }
      }
    }
  })

  useEffect(() => {
    if (!propShop && user?.role === 'locatario') {
      loadUserShop()
    }
  }, [user, propShop])

  useEffect(() => {
    if (shop?.id) {
      loadOrders()
      joinShopRoom(shop.id)
    }
  }, [shop?.id, joinShopRoom])

  const loadUserShop = async () => {
    try {
      setLoadingShop(true)
      // Get user's shops using getShops and filter by user
      const shops = await apiService.getShops()
      const userShops = shops.filter((shop: Tienda) => shop.ownerId === user?.id)
      if (userShops.length > 0) {
        setUserShop(userShops[0]) // Use the first shop
      } else {
        setError('No tienes ninguna tienda registrada')
      }
    } catch (error) {
      console.error('Error loading user shop:', error)
      setError('Error al cargar la tienda')
    } finally {
      setLoadingShop(false)
    }
  }

  const isSameOrder = (order1: Order, order2: Order): boolean => {
    if (!order1 || !order2) return false
    const id1 = order1._id || order1.id || order1.orderNumber
    const id2 = order2._id || order2.id || order2.orderNumber
    return id1 === id2
  }

  const getOrderId = (order: Order): string => {
    if (!order) return 'Sin ID'
    const possibleIds = [order.orderNumber, order._id, order.id]
    for (const id of possibleIds) {
      if (id && typeof id === 'string' && id.length > 0) {
        return id
      }
    }
    return 'Sin ID'
  }

  const getClientName = (order: Order): string => {
    if (!order) return 'Cliente no disponible'
    
    // Priority 1: Direct client name
    if (order.client && typeof order.client === 'object' && order.client.name) {
      return order.client.name
    }
    
    // Priority 2: Client email
    if (order.client && typeof order.client === 'object' && order.client.email) {
      const emailName = order.client.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    
    // Priority 3: Customer ID from order
    if (order.customerId) {
      return `Cliente #${order.customerId.slice(-6)}`
    }
    
    return 'Cliente anónimo'
  }

  const loadOrders = async () => {
    if (!shop?.id) return
    
    try {
      setLoading(true)
      const ordersData = await apiService.getOrdersByShop(shop.id)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
      setError('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setSelectedOrder(null)
    setIsModalOpen(false)
  }

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      isSameOrder(order, updatedOrder) ? updatedOrder : order
    ))
    if (selectedOrder && isSameOrder(selectedOrder, updatedOrder)) {
      setSelectedOrder(updatedOrder)
    }
  }

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }
      
      // Search filter
      if (searchTerm) {
        const clientName = getClientName(order).toLowerCase()
        const orderId = getOrderId(order).toLowerCase()
        const searchLower = searchTerm.toLowerCase()
        
        if (!clientName.includes(searchLower) && !orderId.includes(searchLower)) {
          return false
        }
      }
      
      // Date filter
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateFilter) {
          case 'today':
            if (daysDiff > 0) return false
            break
          case 'week':
            if (daysDiff > 7) return false
            break
          case 'month':
            if (daysDiff > 30) return false
            break
        }
      }
      
      return true
    })
  }

  const getOrderMetrics = () => {
    const filteredOrders = getFilteredOrders()
    const total = filteredOrders.length
    const pending = filteredOrders.filter(o => o.status === 'pendiente').length
    const delivered = filteredOrders.filter(o => o.status === 'entregado').length
    const revenue = filteredOrders
      .filter(o => o.status === 'entregado')
      .reduce((sum, order) => sum + (order.total || 0), 0)
    
    return { total, pending, delivered, revenue }
  }

  if (loadingShop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Cargando tienda...</p>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No se encontró la tienda
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error || 'No tienes una tienda registrada para gestionar pedidos.'}
          </p>
        </div>
      </div>
    )
  }

  const filteredOrders = getFilteredOrders()
  const metrics = getOrderMetrics()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Pedidos
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {shop.name} - Administra todos los pedidos de tu tienda
              </p>
            </div>
            <button
              onClick={loadOrders}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Pedidos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {metrics.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {metrics.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Entregados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {metrics.delivered}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Ingresos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ${metrics.revenue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </select>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'today' | 'week' | 'month' | 'all')}
                  className="pl-10 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </div>

              {/* Results count */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                {filteredOrders.length} de {orders.length} pedidos
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando pedidos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300">{error}</p>
              <button
                onClick={loadOrders}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                {orders.length === 0 ? 'No hay pedidos en esta tienda.' : 'No se encontraron pedidos con los filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
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
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Repartidor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr
                      key={getOrderId(order)}
                      onClick={() => handleOrderClick(order)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{getOrderId(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {getClientName(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as OrderStatus]}`}>
                          {statusLabels[order.status as OrderStatus]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${order.total?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {typeof order.deliveryPersonId === 'object' && order.deliveryPersonId?.name || 'Sin asignar'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdateStatus={async (orderId: string, newStatus: string) => {
            console.log(`🔄 Updating order ${orderId} status to ${newStatus}`)
            
            // Optimistic update - update UI immediately
            const optimisticOrder = orders.find(order => isSameOrder(order, { _id: orderId } as Order))
            if (optimisticOrder) {
              const updatedOptimistic = { ...optimisticOrder, status: newStatus as OrderStatus }
              handleOrderUpdate(updatedOptimistic)
              if (selectedOrder && isSameOrder(selectedOrder, { _id: orderId } as Order)) {
                setSelectedOrder(updatedOptimistic)
              }
            }
            
            try {
              const updatedOrder = await apiService.updateOrderStatus(orderId, newStatus)
              console.log('✅ Order status updated successfully:', updatedOrder)
              handleOrderUpdate(updatedOrder)
              if (selectedOrder && isSameOrder(selectedOrder, updatedOrder)) {
                setSelectedOrder(updatedOrder)
              }
            } catch (error) {
              console.error('❌ Error updating order status:', error)
              // Revert optimistic update on error
              if (optimisticOrder) {
                handleOrderUpdate(optimisticOrder)
                if (selectedOrder && isSameOrder(selectedOrder, optimisticOrder)) {
                  setSelectedOrder(optimisticOrder)
                }
              }
              alert('Error al actualizar el estado del pedido')
            }
          }}
          onAssignDelivery={async (orderId: string, deliveryPersonId: string) => {
            try {
              const updatedOrder = await apiService.assignDeliveryPerson(orderId, deliveryPersonId)
              handleOrderUpdate(updatedOrder)
            } catch (error) {
              console.error('Error assigning delivery person:', error)
            }
          }}
          canUpdateStatus={userRole === 'locatario' || userRole === 'presidente'}
          canAssignDelivery={userRole === 'locatario' || userRole === 'presidente'}
          userRole={userRole}
        />
      )}
    </div>
  )
}
