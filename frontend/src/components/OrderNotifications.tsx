import { useEffect, useState } from "react"
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react"

interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timestamp: Date
}

interface OrderNotificationsProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

const iconMap = {
  success: CheckCircle,
  info: Clock,
  warning: Package,
  error: XCircle
}

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800'
}

export default function OrderNotifications({ notifications, onDismiss }: OrderNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications.slice(-3)) // Mostrar solo las últimas 3
  }, [notifications])

  useEffect(() => {
    // Auto-dismiss notifications after 5 seconds
    const timers = visibleNotifications.map(notification => 
      setTimeout(() => {
        onDismiss(notification.id)
      }, 5000)
    )

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [visibleNotifications, onDismiss])

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => {
        const Icon = iconMap[notification.type]
        const colorClass = colorMap[notification.type]
        
        return (
          <div
            key={notification.id}
            className={`max-w-sm p-4 border rounded-lg shadow-lg ${colorClass} transform transition-all duration-500 animate-slide-in-right`}
          >
            <div className="flex items-start">
              <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
