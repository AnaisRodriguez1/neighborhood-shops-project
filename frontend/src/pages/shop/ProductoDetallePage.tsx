import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { apiService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { Star, ArrowLeft, ShoppingCart, Package } from "lucide-react"
import { Product, Tienda } from "../../types"
import { formatCurrency } from "../../utils/format"

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [shop, setShop] = useState<Tienda | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const { viewMode } = useAuth()
  const { addToCart } = useCart()
  const isCompradorView = viewMode?.current === "comprador"

  useEffect(() => {
    if (id) {
      loadProductAndShop()
    }
  }, [id])

  const loadProductAndShop = async () => {
    try {
      setLoading(true)
      // Assuming we have an API endpoint to get a single product
      const productResponse = await apiService.getProduct(id!)
      setProduct(productResponse)
      
      if (productResponse.shopId) {
        const shopResponse = await apiService.getShop(productResponse.shopId)
        setShop(shopResponse)
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar el producto")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product && shop) {
      addToCart(product, shop)
      // Show success notification
    }
  }

  const getStockMessage = (stock: number) => {
    if (stock === 0) return "Sin stock"
    if (stock === 1) return "¡Última unidad!"
    if (stock <= 5) return `¡Solo quedan ${stock}!`
    if (stock <= 10) return `¡Últimas ${stock} unidades!`
    return `${stock} disponibles`
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
    if (stock <= 5) return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
    return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error || "Producto no encontrado"}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  const productImages = product.images?.length ? product.images : (product.image ? [product.image] : [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              {productImages.length > 0 ? (
                <img
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "";
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                          <div class="text-center">
                            <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            <span class="text-lg">Sin imagen disponible</span>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Package className="w-24 h-24 mx-auto mb-4" />
                    <span className="text-lg">Sin imagen disponible</span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-blue-600 dark:border-blue-400"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Shop Link */}
            {shop && (
              <Link
                to={`/tiendas/${shop.id}`}
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <span className="text-sm font-medium">{shop.name}</span>
              </Link>
            )}

            {/* Product Name & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
              {product.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= product.rating! ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">
                    {product.rating.toFixed(1)} de 5
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(product.price)}
            </div>

            {/* Stock Status */}
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStockColor(product.stock)}`}>
                {getStockMessage(product.stock)}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Category & Tags */}
            <div className="space-y-3">
              {product.category && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Categoría: </span>
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Etiquetas:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {isCompradorView && (
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.stock === 0 ? "Sin stock" : "Agregar al carrito"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
