import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { apiService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { Star, MapPin, Truck, Package, Plus, Edit, Trash2, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import { Tienda, Product } from "../../types"
import { capitalizeWords, formatCurrency } from "../../utils/format"
import ShopOrdersManagement from "../../components/ShopOrdersManagement"

export default function TiendaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shop, setShop] = useState<Tienda | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  const [shopRating, setShopRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)

  const { user, viewMode } = useAuth()
  const { addToCart } = useCart()
  const isCompradorView = viewMode?.current === "comprador"
  
  // Corregir la comparación del propietario
  const isOwner = user && shop && (
    user.id === shop.ownerId || 
    (typeof shop.ownerId === 'object' && user.id === (shop.ownerId as any)?.id)
  )

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
        apiService.getProductsByShop(id!, 1, 50)
      ])
      
      setShop(shopResponse)
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

  const handleRateShop = async (rating: number) => {
    if (!shop || !user || !isCompradorView) return
    
    try {
      setSubmittingRating(true)
      
      // Calcular el cambio en el puntaje
      let ratingChange = 0
      if (rating === 1 || rating === 2) {
        ratingChange = -0.001 // Restar puntos por calificaciones bajas
      } else if (rating >= 3 && rating <= 5) {
        ratingChange = 0.001 // Sumar puntos por calificaciones buenas
      }
      
      // Enviar la calificación al backend
      await apiService.rateShop(shop.id, {
        rating,
        ratingChange,
        userId: user.id
      })
      
      // Recargar la tienda para obtener el rating actualizado
      await loadShopAndProducts()
      
      // Resetear el estado
      setShopRating(0)
      setHoveredRating(0)
      
      // Mostrar mensaje de éxito
      const message = rating <= 2 
        ? `¡Calificación enviada! Se restaron ${Math.abs(ratingChange)} puntos del rating de la tienda.`
        : `¡Calificación enviada! Se sumaron ${ratingChange} puntos al rating de la tienda.`
      
      alert(message)
    } catch (err: any) {
      console.error('Error rating shop:', err)
      alert("Error al enviar la calificación: " + (err.message || "Error desconocido"))
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleProductClick = (productId: string) => {
    navigate(`/productos/${productId}`)
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
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shop Image */}
            <div className="lg:col-span-1">
              <div className="h-64 relative rounded-xl overflow-hidden select-none">
                {/* Banner Image */}
                {shop.images && shop.images[1] ? (
                  <img
                    src={shop.images[1]}
                    alt={`Banner de ${shop.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.querySelector('.fallback-banner')!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {/* Fallback banner */}
                <div className={`fallback-banner absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ${shop.images && shop.images[1] ? 'hidden' : ''}`}>
                  <div className="text-white text-center">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold">{shop.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-sm opacity-90">Banner de tienda</p>
                  </div>
                </div>
                
                {/* Profile Image Overlay */}
                <div className="absolute bottom-4 left-4">
                  {shop.images && shop.images[0] ? (
                    <img
                      src={shop.images[0]}
                      alt={`Logo de ${shop.name}`}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.querySelector('.fallback-profile')!.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Fallback profile */}
                  <div className={`fallback-profile w-20 h-20 bg-white bg-opacity-90 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${shop.images && shop.images[0] ? 'hidden' : ''}`}>
                    <span className="text-2xl font-bold text-gray-800">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div className="lg:col-span-2 select-none">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 select-text">{capitalizeWords(shop.name)}</h1>
                  {shop.rating !== undefined && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900 dark:text-white">{shop.rating}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-gray-600 dark:text-gray-300">{products.length} productos</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Para propietarios de la tienda (locatarios) y presidentes */}
                {!isCompradorView && (
                  (isOwner && user?.role === "locatario") || 
                  user?.role === "presidente"
                ) && (
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
                      <span>Nuevo Producto</span>
                    </Link>
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6 select-text">{shop.description}</p>

              {/* Shop Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5" />
                    <span>{shop.address}</span>
                  </div>
                </div>
              </div>              {shop.deliveryAvailable && (
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

        {/* Shop Rating Section for Buyers */}
        {isCompradorView && user && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Calificar Tienda
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Ayuda a otros compradores calificando esta tienda. Tu calificación afecta el puntaje general.
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateShop(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={submittingRating}
                    className="transition-colors disabled:cursor-not-allowed"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || shopRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {(hoveredRating > 0 || shopRating > 0) && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {(() => {
                    const rating = hoveredRating || shopRating
                    if (rating === 1) return "Muy malo (-0.001 pts)"
                    if (rating === 2) return "Malo (-0.001 pts)"
                    if (rating === 3) return "Regular (+0.001 pts)"
                    if (rating === 4) return "Bueno (+0.001 pts)"
                    if (rating === 5) return "Excelente (+0.001 pts)"
                    return ""
                  })()}
                </div>
              )}
              
              {submittingRating && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <span className="text-sm">Enviando...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Management Section */}
        {isOwner && (
          <ShopOrdersManagement shop={shop} />
        )}

        {/* Products Section */}
        <div>
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
              <>                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform"
                    >{/* Product Image */}
                      <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-gray-500 dark:text-gray-400 text-center">
                                    <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                    </svg>
                                    <span class="text-sm">Sin imagen</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-gray-500 dark:text-gray-400 text-center">
                                    <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                    </svg>
                                    <span class="text-sm">Sin imagen</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400 text-center">
                            <Package className="w-12 h-12 mx-auto mb-2" />
                            <span className="text-sm">Sin imagen</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.price)}</span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{product.category}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}
                          >
                            {product.stock > 0 
                              ? product.stock === 1 
                                ? "¡Última unidad!" 
                                : product.stock <= 5 
                                  ? `¡Solo quedan ${product.stock}!` 
                                  : product.stock <= 10 
                                    ? `¡Últimas ${product.stock} unidades!` 
                                    : `${product.stock} disponibles`
                              : "Sin stock"
                            }
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          {isCompradorView ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
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
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                              >
                                Editar
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(product.id);
                                }}
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
                {!isCompradorView && (
                  (isOwner && user?.role === "locatario") || 
                  user?.role === "presidente"
                ) && (
                  <Link
                    to={`/tiendas/${shop.id}/productos/nuevo`}
                    className="inline-flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Producto</span>
                  </Link>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
