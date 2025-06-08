"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { apiService } from "../services/api"
import { BarChart3, TrendingUp, Store, Users, ShoppingCart, Package } from "lucide-react"

interface AdminMetrics {
  overview: {
    totalShops: number
    totalUsers: number
    totalOrders: number
    averageShopScore: number
    averageProductRating: number
    recentOrders: number
  }
  usersByRole: {
    comprador: number
    locatario: number
    repartidor: number
    presidente: number
  }
  ordersByStatus: {
    pendiente: number
    'en-camino': number
    entregado: number
    cancelado: number
  }
  topShops: Array<{
    id: string
    name: string
    score: number
    categories: string[]
    owner: {
      name: string
      email: string
    } | null
  }>
}

export default function AdminMetricsPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === "presidente") {
      loadMetrics()
    }
  }, [user])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getAdminMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Error loading admin metrics:', error)
      setError('Error al cargar las métricas administrativas')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== "presidente") {
    return (
      <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Acceso Denegado</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Solo los presidentes pueden acceder a esta sección</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Cargando métricas administrativas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
            <button
              onClick={loadMetrics}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }
  if (!metrics) {
    return (
      <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-300">No hay datos disponibles</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Métricas Administrativas</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Analíticas y rendimiento de todas las tiendas</p>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Tiendas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.overview.totalShops}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.overview.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.overview.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Score Promedio Tiendas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.overview.averageShopScore}/5</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Pedidos Recientes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics.overview.recentOrders}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Últimos 30 días</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Rating Promedio Productos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics.overview.averageProductRating}/5</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Calificación promedio</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Role */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usuarios por Rol</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Compradores</span>
                <span className="font-semibold text-gray-900 dark:text-white">{metrics.usersByRole.comprador}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Locatarios</span>
                <span className="font-semibold text-gray-900 dark:text-white">{metrics.usersByRole.locatario}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Repartidores</span>
                <span className="font-semibold text-gray-900 dark:text-white">{metrics.usersByRole.repartidor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Presidentes</span>
                <span className="font-semibold text-gray-900 dark:text-white">{metrics.usersByRole.presidente}</span>
              </div>
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pedidos por Estado</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Pendientes</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{metrics.ordersByStatus.pendiente}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">En camino</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{metrics.ordersByStatus['en-camino']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Entregados</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{metrics.ordersByStatus.entregado}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Cancelados</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{metrics.ordersByStatus.cancelado}</span>
              </div>
            </div>
          </div>
        </div>        {/* Top Performing Shops */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tiendas con Mejor Rendimiento</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">Tienda</th>
                  <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">Categorías</th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topShops.length > 0 ? (
                  metrics.topShops.map((shop, index) => (
                    <tr key={shop.id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{shop.name}</div>
                            {shop.owner && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {shop.owner.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-300">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {shop.categories.slice(0, 2).map((category, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                              {category}
                            </span>
                          ))}
                          {shop.categories.length > 2 && (
                            <span className="text-xs text-gray-500">+{shop.categories.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          {shop.score}/5
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500 dark:text-gray-400">
                      No hay datos de tiendas disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
