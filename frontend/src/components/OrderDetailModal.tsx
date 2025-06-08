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
      await onAssignDelivery(order.id, deliveryPersonId)
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
      onUpdateStatus(order.id, newStatus)
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
                Pedido #{order.id?.slice(-8)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(order.orderDate)}
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
                  Productos ({order.items.length})
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.productName || `Producto ${item.productId}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cantidad: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(order.totalAmount)}
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
                <div className="text-gray-600 dark:text-gray-300">
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}</p>
                  {order.deliveryAddress.postalCode && (
                    <p>CP: {order.deliveryAddress.postalCode}</p>
                  )}
                  {order.deliveryAddress.additionalInfo && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {order.deliveryAddress.additionalInfo}
                    </p>
                  )}
                </div>
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
                  Cliente
                </h4>
                <div className="text-gray-600 dark:text-gray-300">
                  <p>ID: {order.customerId}</p>
                </div>
              </div>

              {/* Shop Info */}
              {typeof order.shopId === 'object' && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Tienda
                  </h4>
                  <div className="text-gray-600 dark:text-gray-300">
                    <p className="font-medium">{order.shopId.name}</p>
                  </div>
                </div>
              )}

              {/* Delivery Person */}
              {order.deliveryPersonId && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Repartidor
                  </h4>
                  <div className="text-gray-600 dark:text-gray-300">
                    <p>ID: {order.deliveryPersonId}</p>
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
