import { useState, useCallback } from "react"
import { useWebSocket } from "./useWebSocket"

interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timestamp: Date
}

export const useOrderNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    }
    
    setNotifications(prev => [...prev, notification])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Configure WebSocket with notification handlers
  const { socket, isConnected } = useWebSocket({
    onOrderCreated: (order) => {
      addNotification(
        `¡Pedido ${order.orderNumber || order.id} creado exitosamente!`,
        'success'
      )
    },
    onOrderStatusUpdated: (orderData) => {
      const statusMessages = {
        pendiente: "Tu pedido está pendiente de confirmación",
        confirmado: "¡Tu pedido ha sido confirmado!",
        preparando: "Tu pedido está siendo preparado",
        listo: "¡Tu pedido está listo para entrega!",
        en_entrega: "Tu pedido está en camino",
        entregado: "¡Tu pedido ha sido entregado!",
        cancelado: "Tu pedido ha sido cancelado"
      }
      
      const message = statusMessages[orderData.status as keyof typeof statusMessages] || 
                     `Estado del pedido actualizado: ${orderData.status}`
      
      const type = orderData.status === 'entregado' ? 'success' :
                   orderData.status === 'cancelado' ? 'error' : 'info'
      
      addNotification(
        `${message} - Pedido ${orderData.orderNumber || orderData.orderId}`,
        type
      )
    },
    onOrderAssigned: (orderData) => {
      addNotification(
        `Repartidor asignado a tu pedido ${orderData.orderNumber || orderData.orderId}`,
        'info'
      )
    }
  })

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    socket,
    isConnected
  }
}
