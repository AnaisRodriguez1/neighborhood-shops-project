import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

interface UseWebSocketProps {
  onOrderCreated?: (order: any) => void
  onOrderStatusUpdated?: (order: any) => void
  onOrderAssigned?: (order: any) => void
}

export const useWebSocket = ({ onOrderCreated, onOrderStatusUpdated, onOrderAssigned }: UseWebSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null)
  const { user } = useAuth()

  const connect = useCallback(() => {
    if (!user) {
      console.log('🚫 WebSocket connect skipped: No user')
      return
    }

    if (socketRef.current?.connected) {
      console.log('🚫 WebSocket connect skipped: Already connected')
      return
    }

    if (socketRef.current && !socketRef.current.connected) {
      console.log('🔄 Attempting to reconnect existing socket...')
      socketRef.current.connect()
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      console.log('🚫 No token found for WebSocket connection')
      return
    }

    console.log('🔌 Creating new WebSocket connection...', { userId: user.id, role: user.role })
    
    const socket = io(import.meta.env.DEV 
      ? 'http://localhost:8080/orders' 
      : 'https://backend-neighborhood-shops-project-production.up.railway.app/orders', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    })

    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully')
      // Join appropriate room based on user role
      if (user.role === 'comprador') {
        socket.emit('join-room', { role: 'comprador', id: user.id })
        console.log(`👤 Joined client room: client-${user.id}`)
      } else if (user.role === 'repartidor') {
        socket.emit('join-room', { role: 'repartidor', id: user.id })
        console.log(`🚚 Joined delivery room: delivery-${user.id}`)
      }
      // Note: locatarios y presidentes se unirán a rooms específicos de tiendas según sea necesario
      // No se unen automáticamente a un room basado en su user ID
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('💥 WebSocket connection error:', error)
    })

    // Order event listeners
    socket.on('order-created', (data) => {
      console.log('📦 Order created:', data)
      onOrderCreated?.(data.order)
    })

    socket.on('order-status-updated', (data) => {
      console.log('🔄 Order status updated:', data)
      onOrderStatusUpdated?.(data.order || data) // Support both formats
    })

    socket.on('order-assigned', (data) => {
      console.log('🚚 Order assigned:', data)
      onOrderAssigned?.(data.order)
    })

    socketRef.current = socket
  }, [user, onOrderCreated, onOrderStatusUpdated, onOrderAssigned])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting WebSocket...')
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const joinShopRoom = useCallback((shopId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', { role: 'locatario', id: shopId })
      console.log(`🏪 Joining shop room: shop-${shopId}`)
    } else {
      console.warn(`❌ Cannot join shop room shop-${shopId} - WebSocket not connected. Will retry...`)
      // Retry after a short delay
      setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('join-room', { role: 'locatario', id: shopId })
          console.log(`🏪 Retried joining shop room: shop-${shopId}`)
        } else {
          console.error(`❌ Failed to join shop room shop-${shopId} after retry`)
        }
      }, 1000)
    }
  }, [])

  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      // Solo desconectar al desmontar completamente, no en cada re-render
      if (!user) {
        disconnect()
      }
    }
  }, [user?.id, user?.role]) // Solo re-conectar si cambia el usuario o su rol

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    joinShopRoom,
    isConnected: socketRef.current?.connected || false,
  }
}
