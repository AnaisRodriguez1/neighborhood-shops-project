"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Star, Clock, MapPin, Truck, Phone, Mail, Store } from "lucide-react"

interface Shop {
  id: string
  nombre: string
  descripcion: string
  direccion: string
  telefono: string
  email: string
  horario: string
  delivery: boolean
  slug: string
  puntuacion?: number
  locatarioId: string
}

export default function TiendasPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { viewMode } = useAuth()
  const isCompradorView = viewMode?.current === "comprador"

  useEffect(() => {
    loadShops()
  }, [page])

  const loadShops = async () => {
    try {
      setLoading(true)
      const response = await apiService.getShops(page, 10)

      if (page === 1) {
        setShops(response.data || response)
      } else {
        setShops((prev) => [...prev, ...(response.data || response)])
      }

      setHasMore((response.data || response).length === 10)
    } catch (err) {
      setError("Error al cargar las tiendas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    setPage((prev) => prev + 1)
  }

  // Ordenar tiendas por puntuación (menor a mayor) solo en vista comprador
  const sortedShops = isCompradorView ? [...shops].sort((a, b) => (a.puntuacion || 0) - (b.puntuacion || 0)) : shops

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tiendas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isCompradorView ? "Explorar Tiendas" : "Gestionar Tiendas"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isCompradorView
              ? "Descubre productos únicos en tiendas locales (ordenadas por puntuación)"
              : "Administra las tiendas de la plataforma"}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {/* Tiendas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Shop Image Placeholder */}
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold">{shop.nombre.charAt(0)}</span>
                  </div>
                  <p className="text-sm opacity-90">Imagen de tienda</p>
                </div>
              </div>

              <div className="p-6">
                {/* Shop Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{shop.nombre}</h3>
                  {shop.puntuacion !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{shop.puntuacion.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shop.descripcion}</p>

                {/* Shop Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{shop.direccion}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{shop.horario}</span>
                  </div>

                  {shop.delivery && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Truck className="w-4 h-4" />
                      <span>Delivery disponible</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{shop.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{shop.email}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`/tiendas/${shop.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {isCompradorView ? "Ver Productos" : "Gestionar"}
                  </Link>

                  {!isCompradorView && (
                    <Link
                      to={`/tiendas/${shop.id}/editar`}
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Editar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Cargar Más Tiendas
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div className="text-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && shops.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay tiendas disponibles</h3>
            <p className="text-gray-600">
              {isCompradorView
                ? "Aún no hay tiendas registradas en la plataforma."
                : "Comienza creando la primera tienda."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
