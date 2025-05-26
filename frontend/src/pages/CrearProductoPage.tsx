"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Package, DollarSign, Hash, FileText, Tag, ImageIcon } from "lucide-react"

interface Shop {
  id: string
  nombre: string
  locatarioId: string
}

export default function CrearProductoPage() {
  const { tiendaId, productId } = useParams<{ tiendaId: string; productId?: string }>()
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: "",
    imagen: "",
  })
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShopId, setSelectedShopId] = useState(tiendaId || "")
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
      const allShops = response.data || response

      // Filtrar tiendas según el rol
      let userShops = allShops
      if (user?.rol === "locatario") {
        userShops = allShops.filter((shop: Shop) => shop.locatarioId === user.id)
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
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio.toString(),
        categoria: product.categoria,
        stock: product.stock.toString(),
        imagen: product.imagen || "",
      })
      setSelectedShopId(product.tiendaId)
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
    }

    try {
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number.parseFloat(formData.precio),
        categoria: formData.categoria,
        stock: Number.parseInt(formData.stock),
        imagen: formData.imagen || undefined,
        tiendaId: selectedShopId,
      }

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
  }

  // Verificar permisos
  if (user?.rol === "comprador") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para crear productos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{isEditing ? "Editar Producto" : "Crear Nuevo Producto"}</h1>
          <p className="text-gray-600 mt-2">
            {isEditing
              ? "Actualiza la información del producto"
              : "Completa la información para agregar un nuevo producto"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            {/* Seleccionar Tienda */}
            {!tiendaId && (
              <div>
                <label htmlFor="tienda" className="block text-sm font-medium text-gray-700 mb-2">
                  Tienda *
                </label>
                <select
                  id="tienda"
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecciona una tienda</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nombre del producto */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del producto *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Camiseta de algodón"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="descripcion"
                  name="descripcion"
                  required
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe las características, materiales, usos..."
                />
              </div>
            </div>

            {/* Precio y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="precio"
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.precio}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="categoria"
                  name="categoria"
                  type="text"
                  required
                  value={formData.categoria}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Ropa, Electrónicos, Hogar..."
                />
              </div>
            </div>

            {/* Imagen (opcional) */}
            <div>
              <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-2">
                URL de imagen (opcional)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="imagen"
                  name="imagen"
                  type="url"
                  value={formData.imagen}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(selectedShopId ? `/tiendas/${selectedShopId}` : "/dashboard")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
