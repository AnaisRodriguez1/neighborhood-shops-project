import { X, Clock, User, MapPin, Package, Truck, UserCheck } from 'lucide-react'
import { Order } from '../types'
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_entrega' | 'entregado' | 'cancelado'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus?: (orderId: string, newStatus: string) => void
  onAssignDelivery?: (orderId: string, deliveryPersonId: string) => void
  canUpdateStatus?: boolean
  canAssignDelivery?: boolean
}

interface DeliveryPerson {
  _id: string
  name: string
  email: string
  deliveryInfo: {
    vehicle: string
    isAvailable: boolean
    currentLocation?: {
      lat: number
      lng: number
    }
  }
}

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

const nextStatusOptions: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['en_entrega'],
  en_entrega: ['entregado'],
  entregado: [],
  cancelado: [],
}

export default function OrderDetailModal({ 
  order, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onAssignDelivery,
  canUpdateStatus = false,
  canAssignDelivery = false
}: OrderDetailModalProps) {
  const [availableDeliveryPersons, setAvailableDeliveryPersons] = useState<DeliveryPerson[]>([])
  const [loadingDeliveryPersons, setLoadingDeliveryPersons] = useState(false)
  const [assigningDelivery, setAssigningDelivery] = useState(false)

  useEffect(() => {
    if (isOpen && canAssignDelivery && order?.status === 'listo') {
      loadAvailableDeliveryPersons()
    }
  }, [isOpen, canAssignDelivery, order?.status])
  const loadAvailableDeliveryPersons = async () => {
    try {
      setLoadingDeliveryPersons(true)
      const response = await apiService.getAvailableDeliveryPersons()
      console.log('🚚 Available delivery persons response:', response)
      console.log('🚚 First delivery person:', response?.[0])
      setAvailableDeliveryPersons(response || [])
    } catch (error) {
      console.error('Error loading delivery persons:', error)
      setAvailableDeliveryPersons([])
    } finally {    setLoadingDeliveryPersons(false)
    }
  }

  const handleAssignDelivery = async (deliveryPersonId: string) => {
    if (!order || !onAssignDelivery) return
    
    console.log('🚚 Attempting to assign delivery person:', deliveryPersonId)
    console.log('🚚 DeliveryPersonId type:', typeof deliveryPersonId)
    console.log('🚚 DeliveryPersonId value:', deliveryPersonId)
    
    try {
      setAssigningDelivery(true)
      // Usar _id si está disponible, sino usar id
      const orderId = order._id || order.id
      await onAssignDelivery(orderId, deliveryPersonId)
    } catch (error: any) {
      console.error('Error assigning delivery person:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al asignar el repartidor'
      alert(`Error: ${errorMessage}`)
    } finally {
      setAssigningDelivery(false)
    }
  }
  if (!isOpen || !order) return null

  const handleStatusUpdate = (newStatus: string) => {
    if (onUpdateStatus) {
      // Usar _id si está disponible, sino usar id
      const orderId = order._id || order.id
      onUpdateStatus(orderId, newStatus)
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
    
    // 5. Solo como último recurso, usar ID
    if (order.customerId && typeof order.customerId === 'string' && order.customerId.length > 0) {
      return `Cliente ${order.customerId.length > 8 ? order.customerId.slice(-8) : order.customerId}`
    }
    
    // 6. Fallback final usando orderNumber o _id del pedido
    const orderId = getOrderId()
    if (orderId !== 'Sin ID') {
      return `Cliente del Pedido ${orderId}`
    }
    
    return 'Cliente sin identificar'
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
              {/* Status */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Estado del Pedido
                  </h4>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                  {canUpdateStatus && nextStatusOptions[order.status].length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cambiar a:</span>
                    {nextStatusOptions[order.status].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign Delivery Person */}
              {canAssignDelivery && order.status === 'listo' && !order.deliveryPersonId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center mb-4">
                    <UserCheck className="w-5 h-5 mr-2" />
                    Asignar Repartidor
                  </h4>
                  
                  {loadingDeliveryPersons ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando repartidores...</span>
                    </div>
                  ) : availableDeliveryPersons.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      No hay repartidores disponibles en este momento.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Selecciona un repartidor disponible:
                      </p>
                      <div className="grid gap-2">                        {availableDeliveryPersons.map((deliveryPerson) => {
                          console.log('🚚 Delivery person in map:', deliveryPerson)
                          console.log('🚚 Delivery person _id:', deliveryPerson._id)
                          return (
                            <button
                              key={deliveryPerson._id}
                              onClick={() => {
                                console.log('🚚 Button clicked for delivery person:', deliveryPerson._id)
                                handleAssignDelivery(deliveryPerson._id)
                              }}
                              disabled={assigningDelivery}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">{deliveryPerson.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {deliveryPerson.deliveryInfo.vehicle} • Disponible
                                </p>
                              </div>
                            </div>
                            <div className="text-blue-600 dark:text-blue-400">
                              {assigningDelivery ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <span className="text-sm font-medium">Asignar</span>                              )}
                            </div>
                          </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
            <div className="space-y-6">              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Cliente
                </h4>
                <div className="text-gray-600 dark:text-gray-300">
                  <p className="font-medium">{getCustomerName()}</p>
                  {order.client?.email && (
                    <p className="text-sm">{order.client.email}</p>
                  )}
                </div>
              </div>

              {/* Shop Info */}
              {(() => {
                const shopInfo = getShopInfo()
                return shopInfo ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Tienda
                    </h4>
                    <div className="text-gray-600 dark:text-gray-300">
                      <p className="font-medium">{shopInfo.name}</p>
                      {shopInfo.id && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {shopInfo.id.length > 8 ? shopInfo.id.slice(-8) : shopInfo.id}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null
              })()}

              {/* Delivery Person */}
              {order.deliveryPersonId && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Repartidor
                  </h4>
                  <div className="text-gray-600 dark:text-gray-300">
                    {typeof order.deliveryPersonId === 'object' && order.deliveryPersonId ? (
                      <>
                        <p className="font-medium">{order.deliveryPersonId.name || 'Nombre no disponible'}</p>
                        {order.deliveryPersonId.email && (
                          <p className="text-sm">{order.deliveryPersonId.email}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {order.deliveryPersonId._id ? order.deliveryPersonId._id.slice(-8) : 'N/A'}
                        </p>
                      </>
                    ) : (
                      <p>ID: {typeof order.deliveryPersonId === 'string' ? order.deliveryPersonId.slice(-8) : 'N/A'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Tiempos
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Creado:</span>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                  {order.estimatedDeliveryTime && (
                    <div>
                      <span className="font-medium">Entrega estimada:</span>
                      <p>{formatDate(order.estimatedDeliveryTime)}</p>
                    </div>
                  )}
                  {order.actualDeliveryTime && (
                    <div>
                      <span className="font-medium">Entregado:</span>
                      <p>{formatDate(order.actualDeliveryTime)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
