"use client"

import { useAuth } from "../context/AuthContext"
import { Store, Package, Users, ShoppingCart, Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { capitalizeWords } from "@/utils/format"

interface DashboardShop {
  id: string
  name: string
  description: string
  address: string
  slug: string
  ownerId: string | { id: string; name: string; email: string }
}

export default function DashboardPage() {  const { user } = useAuth()
  const [userShop, setUserShop] = useState<DashboardShop | null>(null)
  const [loadingShop, setLoadingShop] = useState(true)
  
  if (!user) return null
  
  const isPresidente = user.role === "presidente"
  // Cargar la tienda del locatario al montar el componente
  useEffect(() => {
    if (user.role === "locatario") {
      loadUserShop()
    }
  }, [user.role])

  const loadUserShop = async () => {
    try {
      setLoadingShop(true)
      const response = await apiService.getShops(1, 50) // Obtenemos todas las tiendas
      const shops = response.data || response // Manejar diferentes estructuras de respuesta
      
      console.log('User ID:', user.id)
      console.log('All shops:', shops)
        const userOwnedShop = shops.find((shop: DashboardShop) => {
        // El ownerId puede ser un string o un objeto poblado
        let ownerIdString = ''
        if (typeof shop.ownerId === 'string') {
          ownerIdString = shop.ownerId
        } else if (shop.ownerId && typeof shop.ownerId === 'object' && shop.ownerId.id) {
          ownerIdString = shop.ownerId.id
        }
        
        console.log('Shop:', shop.name, 'OwnerID:', ownerIdString, 'Match:', ownerIdString === user.id)
        return ownerIdString === user.id
      })
      
      console.log('Found user shop:', userOwnedShop)
      setUserShop(userOwnedShop || null)
      
    } catch (error) {
      console.error('Error loading user shop:', error)
      setUserShop(null)
    } finally {
      setLoadingShop(false)
    }
  }


  return (
    <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hola, {user.name}</h1>
              <p className="text-gray-50 dark:text-gray-300 mt-1">
                Rol: {user.role === "presidente" ? "Presidente" : user.role === "locatario" ? "Locatario" : "Comprador"}
              </p>
            </div>
          </div>
        </div>
        {/* Admin Dashboard */}
        {isPresidente && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gestionar Tiendas */}
              <Link to="/admin/tiendas" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tiendas</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Gestionar tiendas</p>
                  </div>
                </div>
              </Link>
              {/* Gestionar Productos */}
              <Link
                to="/admin/productos"
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Productos</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Gestionar productos</p>
                  </div>
                </div>
              </Link>

              {/* Usuarios (solo presidente) */}
              {user.role === "presidente" && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usuarios</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Gestionar usuarios</p>
                    </div>
                  </div>
                </div>
              )}            </div>
          </div>
        )}
          {/* Locatario Dashboard */}
        {user.role === "locatario" && (
          <div className="space-y-8">
            {loadingShop ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Cargando información de tu tienda...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Crear o Gestionar Mi Tienda */}
                  {userShop ? (
                    <Link
                      to={`/tiendas/${userShop.id}`}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mi Tienda</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{capitalizeWords(userShop.name)}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      to="/crear-tienda"
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crear Tienda</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Crea tu primera tienda</p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Mis Ventas */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mis Ventas</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Historial de ventas</p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas (solo si tiene tienda) */}
                  {userShop && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Rendimiento de tienda</p>
                        </div>
                      </div>
                    </div>
                  )}                </div>
              </>
            )}
          </div>
        )}

        {/* Comprador Dashboard */}
        {!isPresidente && user.role !== "locatario" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Explorar Tiendas */}
              <Link to="/tiendas" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Explorar Tiendas</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Descubre productos únicos</p>
                  </div>
                </div>
              </Link>

              {/* Mi Carrito */}
              <Link to="/carrito" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mi Carrito</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Revisar mis compras</p>
                  </div>
                </div>
              </Link>

              {/* Mis Pedidos */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mis Pedidos</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Historial de compras</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Shops */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tiendas Destacadas</h2>
              <p className="text-gray-600 dark:text-gray-300">Las tiendas mejor valoradas te están esperando...</p>
              <Link
                to="/tiendas"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Todas las Tiendas
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
