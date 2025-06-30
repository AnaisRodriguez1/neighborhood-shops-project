import { useState, useEffect } from 'react'
import { User, Truck, MapPin, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { apiService } from '../services/api'

interface DeliveryPerson {
  _id: string
  name: string
  email: string
  deliveryInfo?: {
    vehicle: string
    isAvailable: boolean
    currentLocation?: {
      lat: number
      lng: number
    }
  }
}

interface DeliveryAssignmentProps {
  currentDeliveryPerson?: { _id: string; name: string; email: string }
  onAssign: (deliveryPersonId: string) => Promise<void>
  canAssign: boolean
  orderStatus: string
}

export default function DeliveryAssignment({
  currentDeliveryPerson,
  onAssign,
  canAssign,
  orderStatus
}: DeliveryAssignmentProps) {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (canAssign && (orderStatus === 'listo' || orderStatus === 'en_entrega')) {
      loadDeliveryPersons()
    }
  }, [canAssign, orderStatus])

  const loadDeliveryPersons = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getAvailableDeliveryPersons()
      setDeliveryPersons(response || [])
    } catch (err) {
      console.error('Error loading delivery persons:', err)
      setError('Error al cargar repartidores disponibles')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedDeliveryPerson) return

    try {
      setAssigning(true)
      await onAssign(selectedDeliveryPerson)
      setSelectedDeliveryPerson('')
    } catch (err) {
      console.error('Error assigning delivery person:', err)
    } finally {
      setAssigning(false)
    }
  }

  // Si ya tiene repartidor asignado
  if (currentDeliveryPerson) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-400">
              Repartidor Asignado
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-green-700 dark:text-green-300">
                <User className="w-4 h-4 mr-2" />
                {currentDeliveryPerson.name}
              </div>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <MapPin className="w-4 h-4 mr-2" />
                {currentDeliveryPerson.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si el pedido no está listo para asignar repartidor
  if (orderStatus !== 'listo' && orderStatus !== 'en_entrega') {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-gray-500 mr-3" />
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300">
              Asignación de Repartidor
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              El pedido debe estar "Listo" para asignar un repartidor
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si no puede asignar repartidores
  if (!canAssign) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-400">
              Sin permisos
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              No tienes permisos para asignar repartidores
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Asignar Repartidor
        </h3>
        <button
          onClick={loadDeliveryPersons}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Cargando repartidores...</span>
        </div>
      ) : deliveryPersons.length === 0 ? (
        <div className="text-center py-6">
          <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No hay repartidores disponibles en este momento
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona un repartidor disponible:
          </p>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {deliveryPersons.map((person) => (
              <label
                key={person._id}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedDeliveryPerson === person._id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <input
                  type="radio"
                  name="deliveryPerson"
                  value={person._id}
                  checked={selectedDeliveryPerson === person._id}
                  onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {person.name}
                    </span>
                    {person.deliveryInfo?.isAvailable && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Disponible
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3 h-3 mr-1" />
                    {person.email}
                    {person.deliveryInfo?.vehicle && (
                      <>
                        <Truck className="w-3 h-3 ml-3 mr-1" />
                        {person.deliveryInfo.vehicle}
                      </>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedDeliveryPerson && (
            <button
              onClick={handleAssign}
              disabled={assigning}
              className={`
                w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors
                ${assigning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {assigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Asignando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Asignar Repartidor
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
