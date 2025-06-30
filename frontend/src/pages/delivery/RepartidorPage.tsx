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
  listo: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
}

export default function RepartidorPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'my-orders' | 'available'>('my-orders')
  const [loading, setLoading] = useState(true)
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [takingOrder, setTakingOrder] = useState<string | null>(null)

  // Función para comparar órdenes de manera robusta
  const isSameOrder = (order1: Order, order2: Order): boolean => {
    if (!order1 || !order2) return false
    
    const id1 = order1._id || order1.id || order1.orderNumber
    const id2 = order2._id || order2.id || order2.orderNumber
    
    return id1 === id2
  }

  // WebSocket for real-time updates
  useWebSocket({
    onOrderAssigned: (orderData) => {
      console.log("Nueva orden asignada:", orderData)
      // Refresh both lists to ensure consistency
      loadMyDeliveries()
      loadAvailableOrders()
    },
    onOrderStatusUpdated: (updatedOrder: Order) => {
      console.log("Estado de orden actualizado:", updatedOrder)
      
      // Update the orders state immediately for responsive UI
      setOrders(prev => prev.map(order => 
        isSameOrder(order, updatedOrder) ? updatedOrder : order
      ))
      
      // Also refresh available orders as one might have been taken or delivered
      loadAvailableOrders()
      
      // If it's a status change that affects our lists, do a full refresh
      if (updatedOrder.status === 'entregado' || updatedOrder.status === 'en_entrega') {
        setTimeout(() => {
          loadMyDeliveries()
        }, 500) // Small delay to allow backend to sync
      }
    }
  })

  useEffect(() => {
    if (user && user.role === 'repartidor') {
      loadMyDeliveries()
      loadAvailableOrders()
    }
  }, [user])
  const loadMyDeliveries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the new endpoint that gets ALL deliveries (all statuses)
      const response = await apiService.getAllMyDeliveries()
      
      setOrders(response || [])
    } catch (err) {
      console.error('Error loading deliveries:', err)
      setError('Error al cargar las entregas asignadas')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableOrders = async () => {
    try {
      setLoadingAvailable(true)
      setError(null)
      
      const response = await apiService.getAvailableOrdersForDelivery()
      
      setAvailableOrders(response || [])
    } catch (err) {
      console.error('Error loading available orders:', err)
      setError('Error al cargar los pedidos disponibles')
    } finally {
      setLoadingAvailable(false)
    }
  }

  const handleTakeOrder = async (order: Order) => {
    try {
      const orderId = order._id || order.id || order.orderNumber
      if (!orderId) {
        alert('No se pudo identificar el pedido')
        return
      }
      
      setTakingOrder(orderId)
      await apiService.takeOrder(orderId)
      
      // Force refresh of both lists
      await Promise.all([
        loadMyDeliveries(),
        loadAvailableOrders()
      ])
      
      alert('Pedido tomado exitosamente')
      setActiveTab('my-orders') // Switch to my orders tab
    } catch (err) {
      console.error('Error taking order:', err)
      alert('Error al tomar el pedido')
    } finally {
      setTakingOrder(null)
    }
  }

  const handleDeliverOrder = async (order: Order) => {
    try {
      const orderId = order._id || order.id || order.orderNumber
      if (!orderId) {
        alert('No se pudo identificar el pedido')
        return
      }
      
      setUpdatingOrder(orderId)
      await apiService.markAsDelivered(orderId)
      
      // Force refresh to ensure the order moves to the delivered section
      await loadMyDeliveries()
      
      alert('Pedido marcado como entregado exitosamente')
    } catch (err) {
      console.error('Error delivering order:', err)
      alert('Error al marcar el pedido como entregado')
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Funciones helper para manejar IDs y nombres de manera robusta
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
    
    // 5. Usar dirección de entrega como identificación
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
    
    // 6. Solo como último recurso, usar ID
    if (order.customerId && typeof order.customerId === 'string' && order.customerId.length > 0) {
      return `Cliente ${order.customerId.length > 8 ? order.customerId.slice(-8) : order.customerId}`
    }
    
    // 7. Fallback final usando orderNumber o _id del pedido
    const orderId = getOrderId(order)
    if (orderId !== 'Sin ID') {
      return `Cliente del Pedido ${orderId}`
    }
    
    return 'Cliente anónimo'
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
                Panel del Repartidor
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gestiona tus entregas y toma pedidos disponibles - {user.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              loadMyDeliveries()
              loadAvailableOrders()
            }}
            disabled={loading || loadingAvailable}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Package className={`w-4 h-4 mr-2 ${(loading || loadingAvailable) ? 'animate-spin' : ''}`} />
            Actualizar Todo
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('my-orders')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2
              ${activeTab === 'my-orders' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <Package className="w-5 h-5" />
              <span>Mis Pedidos</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('available')
                loadAvailableOrders()
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2
              ${activeTab === 'available' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <MapPin className="w-5 h-5" />
              <span>Pedidos Disponibles</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableOrders.length}</p>
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
        {activeTab === 'my-orders' && !loading && !error && activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Entregas Activas
            </h2>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order._id || order.id || order.orderNumber || `active-${order.orderNumber}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-indigo-500">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Pedido #{getOrderId(order)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(order.orderDate || order.createdAt)} • {formatCurrency(order.totalAmount || order.total)}
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
                            {order.deliveryAddress?.street || 'Dirección no especificada'}, {order.deliveryAddress?.city || 'Ciudad no especificada'}
                          </p>
                          {order.deliveryAddress?.additionalInfo && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Ref: {order.deliveryAddress.additionalInfo}
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
                            {getCustomerName(order)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Productos ({order.items?.length || 0}):
                      </p>
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items?.length > 0 ? order.items.slice(0, 3).map((item, index) => (
                          <div key={`active-${order._id || order.id}-item-${index}-${item.productId || index}`} className="flex h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 ring-2 ring-white dark:ring-gray-800 items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.quantity || 0}
                          </div>
                        )) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No hay productos</div>
                        )}
                        {order.items?.length > 3 && (
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
                        onClick={() => handleDeliverOrder(order)}
                        disabled={updatingOrder === getOrderId(order)}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {updatingOrder === getOrderId(order) ? (
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
        {activeTab === 'my-orders' && !loading && !error && completedOrders.length > 0 && (
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
                      <tr key={order._id || order.id || order.orderNumber || `completed-${order.orderNumber}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                          <div className="text-sm text-gray-900 dark:text-white">
                            {getCustomerName(order)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.totalAmount || order.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(order.actualDeliveryTime || order.orderDate || order.createdAt)}
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

        {/* Available Orders */}
        {activeTab === 'available' && !loadingAvailable && !error && availableOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Pedidos Disponibles
            </h2>
            <div className="space-y-4">
              {availableOrders.map((order) => (
                <div key={order._id || order.id || order.orderNumber || `available-${order.orderNumber}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-indigo-500">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Pedido #{getOrderId(order)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(order.orderDate || order.createdAt)} • {formatCurrency(order.totalAmount || order.total)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors.listo}`}>
                        Listo para entrega
                      </span>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Dirección de Entrega:</p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {order.deliveryAddress?.street || 'Dirección no especificada'}, {order.deliveryAddress?.city || 'Ciudad no especificada'}
                          </p>
                          {order.deliveryAddress?.additionalInfo && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Ref: {order.deliveryAddress.additionalInfo}
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
                            {getCustomerName(order)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Productos ({order.items?.length || 0}):
                      </p>
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items?.length > 0 ? order.items.slice(0, 3).map((item, index) => (
                          <div key={`available-${order._id || order.id}-item-${index}-${item.productId || index}`} className="flex h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 ring-2 ring-white dark:ring-gray-800 items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.quantity || 0}
                          </div>
                        )) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No hay productos</div>
                        )}
                        {order.items?.length > 3 && (
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
                        onClick={() => handleTakeOrder(order)}
                        disabled={takingOrder === getOrderId(order)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {takingOrder === getOrderId(order) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Tomando...</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            <span>Aceptar Pedido</span>
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

        {/* Loading State for Available Orders */}
        {activeTab === 'available' && loadingAvailable && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando pedidos disponibles...</span>
          </div>
        )}

        {/* Empty State for Available Orders */}
        {activeTab === 'available' && !loadingAvailable && !error && availableOrders.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay pedidos disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Actualmente no hay pedidos listos para entrega. Los pedidos aparecerán aquí cuando los locatarios los marquen como "listos".
            </p>
            <button
              onClick={loadAvailableOrders}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Actualizar
            </button>
          </div>
        )}

        {/* Empty State for My Orders */}
        {activeTab === 'my-orders' && !loading && !error && orders.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tienes entregas asignadas
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Cuando tomes pedidos de la sección "Pedidos Disponibles", aparecerán aquí para su gestión.
            </p>
            <button
              onClick={() => setActiveTab('available')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Ver Pedidos Disponibles
            </button>
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
