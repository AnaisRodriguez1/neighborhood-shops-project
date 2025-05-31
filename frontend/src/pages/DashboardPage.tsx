"use client"

import { useAuth } from "../context/AuthContext"
import { Store, Package, Users, ShoppingCart, Eye, Settings } from "lucide-react"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  const { user, viewMode, switchToComprador, switchToAdmin } = useAuth()

  if (!user) return null

  const isAdmin = viewMode?.current === "admin"
  const canSwitchView = user.rol !== "comprador"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {user.nombre}</h1>
              <p className="text-gray-600 mt-1">
                Rol: {user.rol} | Vista: {viewMode?.current === "admin" ? "Administrador" : "Comprador"}
              </p>
            </div>

            {/* View Mode Switch */}
            {canSwitchView && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Cambiar vista:</span>
                <button
                  onClick={isAdmin ? switchToComprador : switchToAdmin}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isAdmin ? "Vista Comprador" : "Vista Admin"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gestionar Tiendas */}
              <Link to="/admin/tiendas" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tiendas</h3>
                    <p className="text-gray-600 text-sm">Gestionar tiendas</p>
                  </div>
                </div>
              </Link>

              {/* Gestionar Productos */}
              <Link
                to="/admin/productos"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
                    <p className="text-gray-600 text-sm">Gestionar productos</p>
                  </div>
                </div>
              </Link>

              {/* Crear Tienda (solo locatarios) */}
              {user.rol === "locatario" && (
                <Link
                  to="/crear-tienda"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Crear Tienda</h3>
                      <p className="text-gray-600 text-sm">Nueva tienda</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Usuarios (solo presidente) */}
              {user.rol === "presidente" && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
                      <p className="text-gray-600 text-sm">Gestionar usuarios</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/tiendas"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">Ver Todas las Tiendas</h3>
                  <p className="text-gray-600 text-sm mt-1">Explorar el catálogo completo</p>
                </Link>

                {user.rol === "locatario" && (
                  <Link
                    to="/mis-productos"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">Mis Productos</h3>
                    <p className="text-gray-600 text-sm mt-1">Gestionar mi inventario</p>
                  </Link>
                )}

                {user.rol === "presidente" && (
                  <button className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
                    <h3 className="font-medium text-red-900">Eliminar Todo</h3>
                    <p className="text-red-600 text-sm mt-1">Limpiar base de datos</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comprador Dashboard */}
        {!isAdmin && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Explorar Tiendas */}
              <Link to="/tiendas" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Explorar Tiendas</h3>
                    <p className="text-gray-600 text-sm">Descubre productos únicos</p>
                  </div>
                </div>
              </Link>

              {/* Mi Carrito */}
              <Link to="/carrito" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mi Carrito</h3>
                    <p className="text-gray-600 text-sm">Revisar mis compras</p>
                  </div>
                </div>
              </Link>

              {/* Mis Pedidos */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mis Pedidos</h3>
                    <p className="text-gray-600 text-sm">Historial de compras</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Shops */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tiendas Destacadas</h2>
              <p className="text-gray-600">Las tiendas mejor valoradas te están esperando...</p>
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