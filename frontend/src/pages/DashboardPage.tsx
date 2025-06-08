"use client"

import { useAuth } from "../context/AuthContext"
import { Store, Package, Users, ShoppingCart, Settings, BarChart3, Plus, ClipboardList } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { getMyShopsRequest } from "../api/shopsApi"
import { capitalizeWords } from "@/utils/format"

interface DashboardShop {
  id: string
  name: string
  description: string
  address: string
  slug: string
  ownerId: string | { id: string; name: string; email: string }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [userShops, setUserShops] = useState<DashboardShop[]>([])
  const [loadingShops, setLoadingShops] = useState(true)
  
  if (!user) return null
  
  const isPresidente = user.role === "presidente"
  
  // Cargar las tiendas del locatario al montar el componente
  useEffect(() => {
    if (user.role === "locatario") {
      loadUserShops()
    }
  }, [user.role])

  const loadUserShops = async () => {
    try {
      setLoadingShops(true)
      const shops = await getMyShopsRequest()
      console.log('User shops:', shops)
      setUserShops(shops || [])
    } catch (error) {
      console.error('Error loading user shops:', error)
      setUserShops([])
    } finally {
      setLoadingShops(false)
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
              </Link>              {/* Métricas Administrativas */}
              <Link to="/admin/metricas" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Métricas</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Analíticas y reportes</p>
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
              )}</div>
          </div>
        )}        {/* Locatario Dashboard */}
        {user.role === "locatario" && (
          <div className="space-y-8">
            {loadingShops ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Cargando tus tiendas...</p>
              </div>
            ) : (
              <>
                {/* Header with shop count and create button */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Mis Tiendas ({userShops.length})
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {userShops.length === 0 
                        ? "Aún no tienes tiendas. ¡Crea tu primera tienda!"
                        : "Gestiona tus tiendas y pedidos"
                      }
                    </p>
                  </div>
                  <Link
                    to="/crear-tienda"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Tienda</span>
                  </Link>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* All Orders Management */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Todos los Pedidos</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Ver pedidos de todas las tiendas</p>
                      </div>
                    </div>
                  </div>

                  {/* Sales Analytics */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Análisis de Ventas</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Métricas y estadísticas</p>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Ajustes de cuenta</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shops Grid */}
                {userShops.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mis Tiendas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userShops.map((shop) => (
                        <Link
                          key={shop.id}
                          to={`/tiendas/${shop.id}`}
                          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                              <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {capitalizeWords(shop.name)}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                                {shop.description || "Sin descripción"}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 truncate">
                                📍 {shop.address}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                Ver detalles →
                              </span>
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Activa"></div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      ¡Crea tu primera tienda!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Comienza a vender en tu vecindario creando tu primera tienda.
                    </p>
                    <Link
                      to="/crear-tienda"
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Crear Primera Tienda</span>
                    </Link>
                  </div>
                )}
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
              </Link>              {/* Mis Pedidos */}
              <Link to="/mis-pedidos" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mis Pedidos</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Historial de compras</p>
                  </div>
                </div>
              </Link>
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
