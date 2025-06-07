"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Package, DollarSign, Hash, FileText, Tag, ImageIcon } from "lucide-react"

interface CrearProductoShop {
  id: string
  name: string
  ownerId: string
}

export default function CrearProductoPage() {
  const { shopId, productId } = useParams<{ shopId: string; productId?: string }>()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  })
  const [shops, setShops] = useState<CrearProductoShop[]>([])
  const [selectedShopId, setSelectedShopId] = useState(shopId || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing] = useState(!!productId)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadShops()
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadShops = async () => {
    try {
      const response = await apiService.getShops()
      const allShops = response.data || response      // Filtrar tiendas según el rol
      let userShops = allShops
      if (user?.role === "locatario") {
        userShops = allShops.filter((shop: CrearProductoShop) => shop.ownerId === user.id)
      }      setShops(userShops)
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
        category: product.category ?? "",
        stock: product.stock != null ? product.stock.toString() : "",
        image: product.image ?? "",
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
      setError("Debes seleccionar una tienda")
      setIsLoading(false)
      return
    }    try {      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        tags: formData.category ? [formData.category] : undefined,
        stock: Number.parseInt(formData.stock),
        images: formData.image || undefined,
        shopId: selectedShopId,
      }

      console.log('=== FRONTEND UPDATE DEBUG ===');
      console.log('Is editing:', isEditing);
      console.log('Product ID:', productId);
      console.log('Product data to send:', JSON.stringify(productData, null, 2));
      console.log('=============================');

      if (isEditing) {
        await apiService.updateProduct(productId!, productData)
      } else {
        await apiService.createProduct(productData)
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
  }  // Verificar permisos
  if (user?.role === "comprador") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-300">No tienes permisos para crear productos.</p>
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
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">{error}</div>}            {/* Seleccionar Tienda */}
            {!shopId && (
              <div>
                <label htmlFor="tienda" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tienda *
                </label>
                {isEditing ? (
                  <div>
                    <div className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white">
                      {shops.find(shop => shop.id === selectedShopId)?.name || 'Cargando...'}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      No puedes cambiar la tienda al editar un producto
                    </p>
                  </div>
                ) : (
                  <select
                    id="tienda"
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecciona una tienda</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}{/* Nombre del producto */}
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
                Descripción *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe las características, materiales, usos..."
                />
              </div>
            </div>{/* Precio y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div>
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
                  Stock *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>            {/* Categoría */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Ropa, Electrónicos, Hogar..."
                />
              </div>
            </div>

            {/* Imagen (opcional) */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de imagen (opcional)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
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
