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
        isSameOrder(order, updatedOrder) ? updatedOrder : order
      ))
    },
    onOrderAssigned: (assignedOrder: Order) => {
      setOrders(prev => prev.map(order => 
        isSameOrder(order, assignedOrder) ? assignedOrder : order
      ))
    }
  })

  useEffect(() => {
    loadOrders()
    joinShopRoom(shop.id)
  }, [shop.id, joinShopRoom])

  // Función para comparar órdenes de manera robusta
  const isSameOrder = (order1: Order, order2: Order): boolean => {
    if (!order1 || !order2) return false
    
    const id1 = order1._id || order1.id || order1.orderNumber
    const id2 = order2._id || order2.id || order2.orderNumber
    
    return id1 === id2
  }

  // Funciones helper robustas para manejar IDs y nombres
  const getOrderId = (order: Order): string => {
    if (!order) return 'Sin ID'
    
    const possibleIds = [
      order.orderNumber,
      order._id,
      order.id,
      (order as any).number,
      (order as any).orderCode
    ]
    
    for (const id of possibleIds) {
      if (id && typeof id === 'string' && id.length > 0) {
        return id.length > 8 ? id.slice(-8) : id
      }
    }
    
    return 'Sin ID'
  }

  const getCustomerName = (order: Order): string => {
    if (!order) return 'Cliente desconocido'
    
    // 1. Prioridad: client.name (datos poblados del backend)
    if (order.client?.name && order.client.name.trim()) {
      return order.client.name.trim()
    }
    
    // 2. Buscar en campos alternativos de customer
    const orderAsAny = order as any
    const possibleNames = [
      orderAsAny.customer?.name,
      orderAsAny.customerName,
      orderAsAny.buyerName,
      orderAsAny.userName,
      orderAsAny.user?.name,
      orderAsAny.customerInfo?.name,
      orderAsAny.buyer?.name
    ]
    
    for (const name of possibleNames) {
      if (name && typeof name === 'string' && name.trim()) {
        return name.trim()
      }
    }
    
    // 3. Si customerId es un objeto poblado, extraer nombre
    if (order.customerId && typeof order.customerId === 'object') {
      const customer = order.customerId as any
      if (customer.name && customer.name.trim()) {
        return customer.name.trim()
      }
      // Intentar otros campos en el objeto customer
      if (customer.fullName) return customer.fullName.trim()
      if (customer.firstName && customer.lastName) {
        return `${customer.firstName} ${customer.lastName}`.trim()
      }
      if (customer.firstName) return customer.firstName.trim()
    }
    
    // 4. Usar email como nombre si está disponible
    if (order.client?.email) {
      const emailName = order.client.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    
    // 5. Buscar en otros campos posibles del order
    const possibleEmails = [
      orderAsAny.customerEmail,
      orderAsAny.email,
      orderAsAny.buyer?.email,
      orderAsAny.user?.email
    ]
    
    for (const email of possibleEmails) {
      if (email && typeof email === 'string' && email.includes('@')) {
        const emailName = email.split('@')[0]
        return emailName.charAt(0).toUpperCase() + emailName.slice(1)
      }
    }
    
    // 6. Como último recurso, usar ID del cliente (nunca del pedido)
    if (order.customerId && typeof order.customerId === 'string' && order.customerId.length > 0) {
      return `Cliente ${order.customerId.length > 8 ? order.customerId.slice(-8) : order.customerId}`
    }
    
    // 7. Usar dirección de entrega como identificación
    if (order.deliveryAddress) {
      const address = order.deliveryAddress as any
      if (address.street && (address.district || address.city)) {
        return `${address.street}, ${address.district || address.city}`
      }
      if (address.district) {
        return `Entrega en ${address.district}`
      }
      if (address.city) {
        return `Entrega en ${address.city}`
      }
      if (address.street) {
        return `Entrega en ${address.street}`
      }
    }
    
    // 8. Si customerId es objeto, intentar extraer su ID
    if (order.customerId && typeof order.customerId === 'object') {
      const customer = order.customerId as any
      const customerId = customer._id || customer.id
      if (customerId) {
        return `Cliente ${customerId.length > 8 ? customerId.slice(-8) : customerId}`
      }
    }
    
    return 'Cliente anónimo'
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getOrdersByShop(shop.id)
      console.log('📦 Órdenes cargadas para tienda:', shop.name, '- Total:', response?.length || 0)
      
      // Log información detallada del customer para debugging
      if (response?.[0]) {
        const order = response[0]
        console.log('📦 Estructura de primera orden:', {
          id: order.id,
          _id: order._id,
          orderNumber: order.orderNumber,
          client: order.client,
          customerId: order.customerId,
          status: order.status,
          items: order.items?.length,
          totalAmount: order.totalAmount
        })
        
        // Log específico para customer debugging
        console.log('👤 Customer info debugging:', {
          'client.name': order.client?.name,
          'client.email': order.client?.email,
          'customerId type': typeof order.customerId,
          'customerId value': order.customerId,
          'customer': (order as any).customer,
          'customerName': (order as any).customerName,
          'buyer': (order as any).buyer,
          'user': (order as any).user
        })
      }
      
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

  const handleAssignDelivery = async (orderId: string, deliveryPersonId: string) => {
    try {
      await apiService.assignDeliveryPerson(orderId, deliveryPersonId)
      // Order will be updated via WebSocket
      setIsModalOpen(false)
      alert('Repartidor asignado exitosamente')
    } catch (err: any) {
      console.error('Error assigning delivery person:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al asignar el repartidor'
      alert(`Error: ${errorMessage}`)
    }
  }

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0'
    }
    try {
      return new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP' 
      }).format(amount)
    } catch (error) {
      console.error('Error formatting currency:', amount, error)
      return `$${amount}`
    }
  }

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Fecha no disponible'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Fecha inválida'
      }
      
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Fecha inválida'
    }
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
                  <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{getOrderId(order)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getCustomerName(order)}
                      </div>
                      {order.client?.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.client.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.totalAmount || order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(order.orderDate || order.createdAt)}
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
        onAssignDelivery={handleAssignDelivery}
        canUpdateStatus={true}
        canAssignDelivery={true}
      />
    </div>
  )
}
