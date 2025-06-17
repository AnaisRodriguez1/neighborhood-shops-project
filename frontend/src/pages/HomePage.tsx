import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { apiService } from "../services/api"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useOrderNotifications } from "../hooks/useOrderNotifications"
import { ShoppingCart, Package, Star, Plus } from "lucide-react"
import { Product, Tienda } from "../types"
import { capitalizeWords } from '../utils/format';
import OrderNotifications from "../components/OrderNotifications"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Tienda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { addToCart, getTotalItems } = useCart()
  const { user } = useAuth()
  const { notifications, addNotification, dismissNotification } = useOrderNotifications()

  useEffect(() => {
    loadProductsAndShops()
  }, [])
  const loadProductsAndShops = async () => {
    try {
      setLoading(true)
      console.log("🔍 Cargando Products y tiendas...")
      const [productsResponse, shopsResponse] = await Promise.all([
        apiService.getProducts(),
        apiService.getShops()
      ])
      
      console.log("📦 Products cargados:", productsResponse)
      console.log("🏪 Tiendas cargadas:", shopsResponse)
      
      setProducts(productsResponse)
      setShops(shopsResponse.data || shopsResponse)
    } catch (err) {
      setError("Error al cargar los Products")
      console.error("❌ Error cargando datos:", err)    } finally {
      setLoading(false)
    }
  }
  const handleAddToCart = (product: Product) => {
    console.log("🛒 Intentando agregar al carrito:", product.name)
    console.log("👤 Usuario actual:", user)
    console.log("🏪 Tiendas disponibles:", shops)
    
    // Find the shop for this product - handle both string ID and object with ID
    let shopId: string
    if (typeof product.shopId === 'string') {
      shopId = product.shopId
    } else if (product.shopId && typeof product.shopId === 'object' && 'id' in product.shopId) {
      shopId = (product.shopId as any).id
    } else {
      console.log("❌ ShopId inválido:", product.shopId)
      return
    }
    
    const shop = shops.find(s => s.id === shopId)
    console.log("🔍 ShopId extraído:", shopId)
    console.log("🔍 Tienda encontrada para Product:", shop)
    
    if (shop) {
      console.log("✅ Agregando al carrito:", product.name, "de tienda:", shop.name)
      addToCart(product, shop)
      addNotification(`${product.name} agregado al carrito`, 'success')
    } else {
      console.log("❌ No se encontró la tienda para el Product:", product.shopId)
      console.log("❌ ShopId extraído:", shopId)
      console.log("❌ IDs de tiendas disponibles:", shops.map(s => s.id))
    }
  }
  const getShopName = (shopId: string | any) => {
    let actualShopId: string
    if (typeof shopId === 'string') {
      actualShopId = shopId
    } else if (shopId && typeof shopId === 'object' && 'id' in shopId) {
      actualShopId = shopId.id
    } else {
      return "Tienda"
    }
    
    const shop = shops.find(s => s.id === actualShopId)
    return capitalizeWords(shop?.name || "Tienda")
  }

  return (
  <div className="min-h-screen app-container">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Bienvenido a <span className="text-blue-900 dark:text-blue-400">Tienda Pez Caucho</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              La plataforma que conecta tiendas locales con compradores. Descubre Products únicos, apoya negocios
              locales y disfruta de una experiencia de compra excepcional y personalizada.
            </p>
            
            {/* Cart indicator */}
            {user && getTotalItems() > 0 && (
              <div className="flex justify-center mb-8">
                <Link
                  to="/carrito"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ver Carrito ({getTotalItems()} items)
                </Link>
              </div>
            )}          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Products Destacados
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Descubre la variedad de Products disponibles en nuestras tiendas locales
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando Products...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, 12).map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >                    {/* Product Image */}
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
                          }}
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center">
                          <Package className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">Sin imagen</span>
                        </div>
                      )}
                    </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem] flex items-center">
                        {product.name}
                      </h3>
                      {product.rating && (
                        <div className="flex items-center ml-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {getShopName(product.shopId)}
                    </p>

                    {product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-center">

                      {/* Botón agregar al carrito, NEWCESARIO QUE HAYA STOCK DEL PRODUCTO */}
                      {product.stock > 0 && (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`p-2 rounded-full transition-colors ${
                            user && user.role === "comprador" 
                              ? "bg-blue-600 hover:bg-blue-700 text-white" 
                              : "bg-gray-400 hover:bg-gray-500 text-white"
                          }`}
                          title={user && user.role === "comprador" ? "Agregar al carrito" : "Debes loguearte como comprador"}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && products.length > 12 && (
            <div className="text-center mt-12">
              <Link
                to="/tiendas"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver Todas las Tiendas
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-sky-500/30 to-indigo-950/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de tiendas y compradores. Comienza tu experiencia en Tienda Pez Caucho hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Crear Cuenta
            </Link>
            <Link
              to="/tiendas"
              className="bg-transparent text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors border-2 border-white"
            >
              Explorar Tiendas
            </Link>
          </div>        </div>
      </div>
      
      {/* Order Notifications */}
      <OrderNotifications 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </div>
  )
}
