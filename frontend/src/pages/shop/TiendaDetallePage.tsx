import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { apiService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { Star, MapPin, Phone, Mail, Clock, Truck, Package, Plus, Edit, Trash2, ShoppingCart, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react"
import { Tienda, Product } from "../../types"
import { capitalizeWords, formatCurrency } from "../../utils/format"
import ShopOrdersManagement from "../../components/ShopOrdersManagement"

export default function TiendaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [shop, setShop] = useState<Tienda | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(5) // Productos por página
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')

  const { user, viewMode } = useAuth()
  const { addToCart } = useCart()
  const isCompradorView = viewMode?.current === "comprador"
  const isOwner = user && shop && user.id === shop.ownerId

  useEffect(() => {
    if (id) {
      loadShopAndProducts()
    }
  }, [id])

  const loadShopAndProducts = async () => {
    try {
      setLoading(true)
      const [shopResponse, productsResponse] = await Promise.all([
        apiService.getShop(id!), 
        apiService.getProductsByShop(id!)
      ])
      
      setShop(shopResponse)
      // Los productos ya vienen filtrados por tienda desde la API
      const shopProducts = productsResponse.data || productsResponse || []
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
  const categories = ["all", ...new Set(products.map((p) => p.category).filter(Boolean))]
  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((p) => p.category === selectedCategory)

  // Lógica de paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset página cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const goToPage = (page: number) => {
    setCurrentPage(page)
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
                    <span className="text-3xl font-bold">{shop.name.charAt(0)}</span>
                  </div>
                  <p className="text-sm opacity-90">Imagen de tienda</p>
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{capitalizeWords(shop.name)}</h1>
                  {shop.rating !== undefined && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900 dark:text-white">{shop.rating.toFixed(1)}</span>
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

              <p className="text-gray-600 dark:text-gray-300 mb-6">{shop.description}</p>

              {/* Shop Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5" />
                    <span>{shop.address}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5" />
                    <span>{shop.phone}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5" />
                    <span>{shop.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5" />
                    <span>{shop.schedule}</span>
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
      </div>

      {/* Products/Orders Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation for Shop Owners */}
        {isOwner && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'products'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Productos</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>Pedidos</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Orders Management Section */}
        {isOwner && activeTab === 'orders' && (
          <ShopOrdersManagement shop={shop} />
        )}

        {/* Products Section - Show only when products tab is active or for non-owners */}
        {(!isOwner || activeTab === 'products') && (
          <>
            {/* Dashboard-style header for shop owners */}
            {isOwner && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mis Productos</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {products.length} productos en total
                      {products.filter(p => p.stock < 10).length > 0 && ` • ${products.filter(p => p.stock < 10).length} con stock bajo`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/tiendas/${shop.id}/productos/nuevo`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Producto</span>
                    </Link>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <Package className="w-4 h-4" />
                      <span>Ver Todos</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard-style products grid (limited to 6) */}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((product) => (
                      <div key={product.id} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock < 10 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tienes productos</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Comienza agregando productos a tu tienda para que los clientes puedan encontrarlos.
                    </p>
                    <Link
                      to={`/tiendas/${shop.id}/productos/nuevo`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Primer Producto</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Regular products section for customers and full product view */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isOwner ? "Todos los Productos" : "Productos"}
                </h2>
                {filteredProducts.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
                  </p>
                )}
              </div>

              {/* Category Filter */}
              {categories.length > 1 && (
                <div className="flex space-x-2">
                  {categories.map((category) => (
                    <button
                      key={`category-${category}`}
                      onClick={() => setSelectedCategory(category || "all")}
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
            </div>

            {/* Products Grid */}
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Product Image */}
                      <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
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
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.price)}</span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>

                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{product.category}</span>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      key="prev-button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={`page-${page}`}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? "bg-blue-600 dark:bg-blue-500 text-white"
                              : "text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      key="next-button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
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
                  >                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Producto</span>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
