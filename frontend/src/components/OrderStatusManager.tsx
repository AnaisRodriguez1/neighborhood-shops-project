import { useState } from 'react'
import { CheckCircle, Clock, Package, Truck, X } from 'lucide-react'

type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_entrega' | 'entregado' | 'cancelado'

interface OrderStatusManagerProps {
  currentStatus: OrderStatus
  onStatusUpdate: (newStatus: OrderStatus) => void
  canManage: boolean
  isDelivery?: boolean
  userRole?: string
}

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['en_entrega'],
  en_entrega: ['entregado'],
  entregado: [],
  cancelado: [],
}

const statusConfig = {
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    description: 'El pedido ha sido recibido y está pendiente de confirmación'
  },
  confirmado: {
    label: 'Confirmado', 
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'El pedido ha sido confirmado y se iniciará la preparación'
  },
  preparando: {
    label: 'Preparando',
    icon: Package,
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    description: 'El pedido está siendo preparado'
  },
  listo: {
    label: 'Listo',
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20', 
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'El pedido está listo para ser recogido o entregado'
  },
  en_entrega: {
    label: 'En Entrega',
    icon: Truck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    description: 'El pedido está en camino al cliente'
  },
  entregado: {
    label: 'Entregado',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    description: 'El pedido ha sido entregado exitosamente'
  },
  cancelado: {
    label: 'Cancelado',
    icon: X,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'El pedido ha sido cancelado'
  }
}

export default function OrderStatusManager({
  currentStatus,
  onStatusUpdate,
  canManage,
  isDelivery = false,
  userRole
}: OrderStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!canManage) return
    
    setIsUpdating(true)
    try {
      await onStatusUpdate(newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentConfig = statusConfig[currentStatus]
  const CurrentIcon = currentConfig.icon
  const nextStatuses = statusFlow[currentStatus] || []

  // Si es repartidor, solo puede cambiar de "en_entrega" a "entregado"
  const availableStatuses = isDelivery && userRole === 'repartidor'
    ? nextStatuses.filter(status => status === 'entregado' && currentStatus === 'en_entrega')
    : nextStatuses

  return (
    <div className="space-y-4">
      {/* Estado Actual */}
      <div className={`p-4 border-2 rounded-lg ${currentConfig.bgColor} ${currentConfig.borderColor}`}>
        <div className="flex items-center">
          <CurrentIcon className={`w-5 h-5 ${currentConfig.color} mr-2`} />
          <div>
            <h3 className={`font-semibold ${currentConfig.color}`}>
              {currentConfig.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentConfig.description}
            </p>
          </div>
        </div>
      </div>

      {/* Acciones Disponibles */}
      {canManage && availableStatuses.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Cambiar estado:
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableStatuses.map((status) => {
              const config = statusConfig[status]
              const StatusIcon = config.icon
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating}
                  className={`
                    flex items-center px-3 py-2 rounded-lg border-2 transition-all
                    ${config.bgColor} ${config.borderColor} ${config.color}
                    hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                    ${isUpdating ? 'animate-pulse' : ''}
                  `}
                >
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Mensaje para repartidores */}
      {isDelivery && userRole === 'repartidor' && currentStatus === 'en_entrega' && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✅ Puedes marcar este pedido como entregado una vez que lo hayas entregado al cliente.
          </p>
        </div>
      )}

      {/* Mensaje para repartidores cuando el pedido está listo */}
      {isDelivery && userRole === 'repartidor' && currentStatus === 'listo' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            � Este pedido está listo para ser recogido. El locatario debe cambiar el estado a "En Entrega" para que puedas gestionarlo.
          </p>
        </div>
      )}

      {/* Mensaje para locatarios */}
      {!isDelivery && userRole === 'locatario' && currentStatus === 'listo' && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            🚚 Asigna un repartidor y cambia el estado a "En Entrega" cuando el pedido esté siendo entregado.
          </p>
        </div>
      )}

      {/* Información de estado final */}
      {(currentStatus === 'entregado' || currentStatus === 'cancelado') && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {currentStatus === 'entregado' 
              ? '✅ Este pedido ha sido completado exitosamente.'
              : '❌ Este pedido fue cancelado.'}
          </p>
        </div>
      )}
    </div>
  )
}
