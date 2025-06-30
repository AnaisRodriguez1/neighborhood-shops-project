"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { apiService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { Package, DollarSign, Hash, FileText, Tag, ImageIcon } from "lucide-react"

interface CrearProductoShop {
  id: string
  name: string
  ownerId: string
}

export default function CrearProductoPage() {
  const params = useParams<{ tiendaId: string; productId?: string }>()
  const { tiendaId, productId } = params
  
  // Backup: extraer shopId de la URL si useParams no funciona
  const getShopIdFromPath = () => {
    const path = window.location.pathname
    const match = path.match(/\/tiendas\/([^\/]+)\/productos/)
    return match ? match[1] : null
  }
  
  const shopId = tiendaId || getShopIdFromPath()
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    tags: "",
    calories: "",
    stock: "",
    images: "",
  })
  const [shops, setShops] = useState<CrearProductoShop[]>([])
  const [selectedShopId, setSelectedShopId] = useState(shopId || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing] = useState(!!productId)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Asegurar que selectedShopId esté establecido cuando shopId esté disponible
    if (shopId) {
      setSelectedShopId(shopId)
    }
    loadShops()
    if (productId) {
      loadProduct()
    }
  }, [productId, shopId])

  const loadShops = async () => {
    try {
      const response = await apiService.getShops()
      const allShops = response.data || response
      
      // Si tenemos un shopId específico, cargar esa tienda directamente
      if (shopId) {
        try {
          const specificShop = await apiService.getShop(shopId)
          setShops([{
            id: specificShop.id,
            name: specificShop.name,
            ownerId: specificShop.ownerId
          }])
          setSelectedShopId(shopId)
          return
        } catch (err) {
          console.error("Error loading specific shop:", err)
        }
      }
      
      // Filtrar tiendas según el rol
      let userShops = allShops
      if (user?.role === "locatario") {
        userShops = allShops.filter((shop: CrearProductoShop) => shop.ownerId === user.id)
      }
      
      setShops(userShops)
    } catch (err) {
      console.error("Error loading shops:", err)
    }
  }

  const loadProduct = async () => {
    try {
      const product = await apiService.getProduct(productId!)
      setFormData({
        name: product.name ?? "",
        description: product.description ?? "",
        price: product.price != null ? product.price.toString() : "",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
        calories: product.calories != null ? product.calories.toString() : "",
        stock: product.stock != null ? product.stock.toString() : "",
        images: Array.isArray(product.images) ? product.images.join(", ") : "",
      })
      setSelectedShopId(product.shopId ?? "")
    } catch (err: any) {
      setError("Error al cargar el producto")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!selectedShopId) {
      const errorMsg = shopId 
        ? "No se pudo cargar la información de la tienda" 
        : "Error: No se pudo determinar la tienda. Accede desde la página de la tienda.";
      setError(errorMsg)
      setIsLoading(false)
      return
    }

    // Validar que selectedShopId sea un ID válido (24 caracteres hexadecimales para MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(selectedShopId)) {
      setError("El ID de la tienda no es válido");
      setIsLoading(false);
      return;
    }    try {
      // Validar y limpiar datos
      const price = Number.parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        setError("El precio debe ser un número válido mayor o igual a 0");
        setIsLoading(false);
        return;
      }

      const productData: any = {
        name: formData.name.trim(),
        price: price,
      }

      // Agregar campos opcionales solo si tienen contenido válido
      if (formData.description?.trim()) {
        productData.description = formData.description.trim();
      }

      if (formData.tags?.trim()) {
        productData.tags = formData.tags.trim();
      }

      if (formData.calories?.trim()) {
        const calories = Number.parseInt(formData.calories);
        if (!isNaN(calories) && calories >= 0) {
          productData.calories = calories;
        }
      }

      if (formData.stock?.trim()) {
        const stock = Number.parseInt(formData.stock);
        if (!isNaN(stock) && stock >= 0) {
          productData.stock = stock;
        }
      }

      if (formData.images?.trim()) {
        productData.images = formData.images.trim();
      }

      // Para crear productos, incluir shopId. Para actualizar, no incluirlo
      const finalProductData = isEditing 
        ? productData 
        : { ...productData, shopId: selectedShopId }

      if (isEditing) {
        await apiService.updateProduct(productId!, finalProductData)
      } else {
        await apiService.createProduct(finalProductData)
      }

      navigate(`/tiendas/${selectedShopId}`)
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }  // Verificar permisos - Solo locatarios pueden crear/editar productos
  if (user?.role === "comprador") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-300">No tienes permisos para crear productos.</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Solo los locatarios pueden gestionar productos.</p>
        </div>
      </div>
    )
  }

  if (user?.role !== "locatario" && user?.role !== "presidente") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceso Restringido</h1>
          <p className="text-gray-600 dark:text-gray-300">Solo los propietarios de tienda pueden crear productos.</p>
          <Link 
            to="/dashboard" 
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isEditing ? "Editar Producto" : "Crear Nuevo Producto"}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isEditing
              ? "Actualiza la información del producto"
              : "Completa la información para agregar un nuevo producto"}
          </p>
        </div>        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">{error}</div>}            {/* Mostrar Tienda (solo lectura) */}
            <div>
              <label htmlFor="tienda" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tienda
              </label>
              <div className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white select-none">
                {shops.find(shop => shop.id === selectedShopId)?.name || (selectedShopId ? 'Cargando tienda...' : 'No se pudo determinar la tienda')}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEditing 
                  ? "No puedes cambiar la tienda al editar un producto" 
                  : selectedShopId 
                    ? "La tienda está definida por la URL de acceso"
                    : "Debes acceder a esta página desde la página de una tienda específica"
                }
              </p>
            </div>{/* Nombre del producto */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del producto *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Camiseta de algodón"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe las características, materiales, usos..."
                />
              </div>
            </div>            {/* Precio, Stock y Calorías */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock (opcional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calorías (opcional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    id="calories"
                    name="calories"
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (opcional, separados por comas)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: ropa, algodón, casual, verano"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Separa múltiples tags con comas para facilitar la búsqueda
              </p>
            </div>

            {/* Imágenes (opcional) */}
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URLs de imágenes (separadas por comas)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="images"
                  name="images"
                  type="text"
                  value={formData.images}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Separa múltiples URLs con comas. La primera imagen será la principal.
              </p>
            </div>{/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(selectedShopId ? `/tiendas/${selectedShopId}` : "/dashboard")}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 dark:bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading
                  ? isEditing
                    ? "Actualizando..."
                    : "Creando..."
                  : isEditing
                    ? "Actualizar Producto"
                    : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
