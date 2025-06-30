import { X, Clock, User, MapPin, Package, Mail, CreditCard } from 'lucide-react'
import { Order } from '../types'
import OrderStatusManager from './OrderStatusManager'
import DeliveryAssignment from './DeliveryAssignment'

type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_entrega' | 'entregado' | 'cancelado'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus?: (orderId: string, newStatus: string) => void
  onAssignDelivery?: (orderId: string, deliveryPersonId: string) => void
  canUpdateStatus?: boolean
  canAssignDelivery?: boolean
  userRole?: string
}

export default function OrderDetailModal({ 
  order, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onAssignDelivery,
  canUpdateStatus = false,
  canAssignDelivery = false,
  userRole = 'comprador'
}: OrderDetailModalProps) {

  if (!isOpen || !order) return null

  const handleStatusUpdate = (newStatus: string) => {
    if (onUpdateStatus && order) {
      // Usar _id si está disponible, sino usar id
      const orderId = order._id || order.id
      onUpdateStatus(orderId, newStatus)
    }
  }

  const handleAssignDelivery = async (deliveryPersonId: string) => {
    if (!order || !onAssignDelivery) return
    
    try {
      // Usar _id si está disponible, sino usar id
      const orderId = order._id || order.id
      await onAssignDelivery(orderId, deliveryPersonId)
    } catch (error: any) {
      console.error('Error assigning delivery person:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al asignar el repartidor'
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
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Fecha inválida'
    }
  }

  // Función para obtener el ID del pedido de manera robusta
  const getOrderId = (): string => {
    if (!order) return 'Sin ID'
    
    // Intentar diferentes campos de ID
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

  // Función para obtener el nombre del cliente de manera robusta
  const getCustomerName = (): string => {
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
      const address = order.deliveryAddress as any // Usar any para acceder a propiedades dinámicas
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
    const orderId = getOrderId()
    if (orderId !== 'Sin ID') {
      return `Cliente del Pedido ${orderId}`
    }
    
    return 'Cliente anónimo'
  }

  // Función para obtener información de la tienda de manera robusta
  const getShopInfo = () => {
    if (!order) return null
    
    // Si shopId es un objeto (populated)
    if (typeof order.shopId === 'object' && order.shopId) {
      const shop = order.shopId as any
      return {
        name: shop.name || shop.storeName || 'Tienda sin nombre',
        id: shop._id || shop.id
      }
    }
    
    // Si tenemos shop separado
    if (order.shop) {
      return {
        name: order.shop.name || 'Tienda sin nombre',
        id: order.shop.id
      }
    }
    
    // Si shopId es string, crear info básica
    if (typeof order.shopId === 'string' && order.shopId.length > 0) {
      return {
        name: `Tienda ${order.shopId.length > 8 ? order.shopId.slice(-8) : order.shopId}`,
        id: order.shopId
      }
    }
    
    return null
  }

  // Función para obtener el número correcto de productos
  const getItemsCount = (): number => {
    if (!order || !order.items || !Array.isArray(order.items)) {
      return 0
    }
    return order.items.length
  }

  // Función para obtener el nombre del producto de manera robusta
  const getProductName = (item: any): string => {
    const possibleNames = [
      item.product?.name,
      item.productName,
      item.name,
      item.product?.title,
      item.title
    ]
    
    for (const name of possibleNames) {
      if (name && typeof name === 'string' && name.trim()) {
        return name.trim()
      }
    }
    
    // Fallback con productId
    if (item.productId) {
      const productId = typeof item.productId === 'string' ? item.productId : item.productId._id || item.productId.id
      return productId ? `Producto ${productId.length > 8 ? productId.slice(-8) : productId}` : 'Producto sin nombre'
    }
    
    return 'Producto sin nombre'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Pedido #{getOrderId()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(order.orderDate || order.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Productos ({getItemsCount()})
                </h4>
                {getItemsCount() === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No hay productos en este pedido
                  </p>
                ) : (
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getProductName(item)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cantidad: {item.quantity || 0} × {formatCurrency(item.price || 0)}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency((item.quantity || 0) * (item.price || 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(order.totalAmount || order.total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Dirección de Entrega
                </h4>
                {order.deliveryAddress ? (
                  <div className="text-gray-600 dark:text-gray-300">
                    <p>{order.deliveryAddress.street || 'Dirección no especificada'}</p>
                    <p>{order.deliveryAddress.city || 'Ciudad no especificada'}</p>
                    {order.deliveryAddress.postalCode && (
                      <p>CP: {order.deliveryAddress.postalCode}</p>
                    )}
                    {order.deliveryAddress.additionalInfo && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {order.deliveryAddress.additionalInfo}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay información de dirección disponible
                  </p>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Notas del Pedido
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información del Cliente
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-lg">
                      {getCustomerName()}
                    </p>
                    {order.client?.email && (
                      <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 mr-1" />
                        {order.client.email}
                      </div>
                    )}
                  </div>
                  
                  {/* Customer ID for reference */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {order.customerId || 'No disponible'}
                  </div>
                </div>
              </div>

              {/* Order Status Management */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <OrderStatusManager
                  currentStatus={order.status}
                  onStatusUpdate={handleStatusUpdate}
                  canManage={canUpdateStatus}
                  userRole={userRole}
                />
              </div>

              {/* Delivery Assignment */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <DeliveryAssignment
                  currentDeliveryPerson={typeof order.deliveryPersonId === 'object' && order.deliveryPersonId ? {
                    _id: order.deliveryPersonId._id,
                    name: order.deliveryPersonId.name,
                    email: order.deliveryPersonId.email
                  } : undefined}
                  onAssign={handleAssignDelivery}
                  canAssign={canAssignDelivery}
                  orderStatus={order.status}
                />
              </div>

              {/* Shop Info */}
              {(() => {
                const shopInfo = getShopInfo()
                return shopInfo ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Tienda
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {shopInfo.name}
                    </p>
                  </div>
                ) : null
              })()}

              {/* Order Times */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Tiempos
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Creado:</span>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  {order.estimatedDeliveryTime && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Entrega estimada:</span>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(order.estimatedDeliveryTime)}
                      </p>
                    </div>
                  )}
                  {order.actualDeliveryTime && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Entregado:</span>
                      <p className="text-green-600 dark:text-green-400">
                        {formatDate(order.actualDeliveryTime)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pago
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Método:</span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {(order as any).paymentMethod || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                    <p className={`capitalize ${
                      (order as any).paymentStatus === 'pagado' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {(order as any).paymentStatus || 'Pendiente'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-500 dark:text-gray-400">Total:</span>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(order.totalAmount || order.total || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
