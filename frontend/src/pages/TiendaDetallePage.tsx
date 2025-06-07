"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { Star, MapPin, Phone, Mail, Clock, Truck, Package, Plus, Edit, Trash2, ShoppingCart } from "lucide-react"

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

interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  stock: number
  imagen?: string
  tiendaId: string
}

export default function TiendaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const { user, viewMode } = useAuth()
  const { addToCart } = useCart()
  const isCompradorView = viewMode?.current === "comprador"
  const isOwner = user && shop && user.id === shop.locatarioId

  useEffect(() => {
    if (id) {
      loadShopAndProducts()
    }
  }, [id])

  const loadShopAndProducts = async () => {
    try {
      setLoading(true)
      const [shopResponse, productsResponse] = await Promise.all([apiService.getShop(id!), apiService.getProducts()])

      setShop(shopResponse)
      // Filtrar productos de esta tienda
      const shopProducts = productsResponse.data?.filter((p: Product) => p.tiendaId === id) || []
      setProducts(shopProducts)
    } catch (err: any) {
      setError(err.message || "Error al cargar la tienda")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    if (shop) {
      addToCart(product, shop)
      // Aquí podrías mostrar una notificación de éxito
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await apiService.deleteProduct(productId)
        setProducts((prev) => prev.filter((p) => p.id !== productId))
      } catch (err: any) {
        alert("Error al eliminar el producto: " + err.message)
      }
    }
  }

  // Obtener categorías únicas
  const categories = ["all", ...new Set(products.map((p) => p.categoria))]
  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((p) => p.categoria === selectedCategory)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando tienda...</p>
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300">{error || "Tienda no encontrada"}</p>
          <Link to="/tiendas" className="mt-4 inline-block bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
            Volver a Tiendas
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Shop Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shop Image */}
            <div className="lg:col-span-1">
              <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">{shop.nombre.charAt(0)}</span>
                  </div>
                  <p className="text-sm opacity-90">Imagen de tienda</p>
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{shop.nombre}</h1>
                  {shop.puntuacion !== undefined && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900 dark:text-white">{shop.puntuacion.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-gray-600 dark:text-gray-300">{products.length} productos</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isCompradorView && (isOwner || user?.role === "presidente") && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/tiendas/${shop.id}/editar`}
                      className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </Link>
                    <Link
                      to={`/tiendas/${shop.id}/productos/nuevo`}
                      className="flex items-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Producto</span>
                    </Link>
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">{shop.descripcion}</p>

              {/* Shop Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5" />
                    <span>{shop.direccion}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5" />
                    <span>{shop.telefono}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5" />
                    <span>{shop.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5" />
                    <span>{shop.horario}</span>
                  </div>
                </div>
              </div>

              {shop.delivery && (
                <div className="mt-4 flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <Truck className="w-5 h-5" />
                  <span className="font-medium">Delivery disponible</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h2>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {category === "all" ? "Todos" : category}
                </button>
              ))}
            </div>
          )}
        </div>        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                  {product.imagen ? (
                    <img
                      src={product.imagen || "/placeholder.svg"}
                      alt={product.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center">
                      <Package className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{product.nombre}</h3>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${product.precio}</span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{product.descripcion}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{product.categoria}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}
                    >
                      {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isCompradorView ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    ) : (
                      <>
                        <Link
                          to={`/productos/${product.id}/editar`}
                          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-600 dark:bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {selectedCategory === "all" ? "No hay productos" : `No hay productos en "${selectedCategory}"`}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {isCompradorView
                ? "Esta tienda aún no tiene productos disponibles."
                : "Comienza agregando productos a tu tienda."}
            </p>
            {!isCompradorView && (isOwner || user?.role === "presidente") && (
              <Link
                to={`/tiendas/${shop.id}/productos/nuevo`}
                className="inline-flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Primer Producto</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
