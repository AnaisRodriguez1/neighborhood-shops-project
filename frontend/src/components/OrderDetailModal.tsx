import { X, Clock, User, MapPin, Package, Truck } from 'lucide-react'
import { Order } from '../types'

type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_entrega' | 'entregado' | 'cancelado'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus?: (orderId: string, newStatus: string) => void
  canUpdateStatus?: boolean
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
  canUpdateStatus = false 
}: OrderDetailModalProps) {
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
