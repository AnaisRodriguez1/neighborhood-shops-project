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
    if (!user || socketRef.current?.connected) return

    const token = localStorage.getItem('token')
    if (!token) return

    console.log('Connecting to WebSocket...')
    
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
      console.log('WebSocket connected')
      // Join appropriate room based on user role
      if (user.role === 'comprador') {
        socket.emit('join-room', { role: 'comprador', id: user.id })
      } else if (user.role === 'locatario') {
        socket.emit('join-room', { role: 'locatario', id: user.id })
      } else if (user.role === 'presidente') {
        socket.emit('join-room', { role: 'presidente', id: user.id })
      } else if (user.role === 'repartidor') {
        socket.emit('join-room', { role: 'repartidor', id: user.id })
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })

    // Order event listeners
    socket.on('order-created', (data) => {
      console.log('Order created:', data)
      onOrderCreated?.(data.order)
    })

    socket.on('order-status-updated', (data) => {
      console.log('Order status updated:', data)
      onOrderStatusUpdated?.(data.order)
    })

    socket.on('order-assigned', (data) => {
      console.log('Order assigned:', data)
      onOrderAssigned?.(data.order)
    })

    socketRef.current = socket
  }, [user, onOrderCreated, onOrderStatusUpdated, onOrderAssigned])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket...')
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const joinShopRoom = useCallback((shopId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', { role: 'locatario', id: shopId })
      console.log(`Joined shop room: ${shopId}`)
    }
  }, [])

  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [user, connect, disconnect])

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    joinShopRoom,
    isConnected: socketRef.current?.connected || false,
  }
}
