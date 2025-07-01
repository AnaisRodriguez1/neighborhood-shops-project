"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { Store, MapPin, Truck, Image } from "lucide-react"

export default function CrearTiendaPage() {
  const params = useParams<{ shopId?: string }>()
  const { shopId } = params
  const isEditing = !!shopId

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    deliveryAvailable: false,
    categories: [] as string[],
    images: ["", ""] as string[], // [icon, banner]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const navigate = useNavigate()

  // Cargar datos de la tienda si está editando
  useEffect(() => {
    if (isEditing && shopId) {
      const loadShopData = async () => {
        try {
          setIsLoading(true)
          const shop = await apiService.getShop(shopId)
          
          // Función para extraer el valor real del ObjectId o User object
          const extractIdValue = (id: any): string => {
            if (typeof id === 'string') {
              return id;
            } else if (typeof id === 'object' && id !== null) {
              // Si es un objeto User con propiedad 'id'
              if (id.id) return String(id.id);
              // Si es un ObjectId con propiedades comunes
              if (id.$oid) return id.$oid;
              if (id._id) return id._id;
              if (id.toString && typeof id.toString === 'function') {
                const str = id.toString();
                if (str !== '[object Object]') return str;
              }
            }
            return String(id);
          };
          
          // Verificar que el usuario sea el dueño de la tienda
          const shopOwnerIdStr = extractIdValue(shop.ownerId);
          const userIdStr = extractIdValue(user?.id);
          
          if (shopOwnerIdStr !== userIdStr) {
            setError(`No tienes permisos para editar esta tienda`)
            return
          }
          
          setFormData({
            name: shop.name || "",
            description: shop.description || "",
            address: shop.address || "",
            deliveryAvailable: shop.deliveryAvailable || false,
            categories: shop.categories || [],
            images: shop.images || ["", ""],
          })
        } catch (err: any) {
          setError(err.message || "Error al cargar los datos de la tienda")
        } finally {
          setIsLoading(false)
        }
      }
      
      loadShopData()
    }
  }, [isEditing, shopId, user?.id])

  // Verificar que el usuario sea locatario
  if (user?.role !== "locatario") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-300">Solo los locatarios pueden crear tiendas.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Prepare shop data according to CreateShopDto
      const shopData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        deliveryAvailable: formData.deliveryAvailable,
        categories: formData.categories.join(','), // Convertir array a string separado por comas
        images: formData.images
      }
      
      if (isEditing && shopId) {
        await apiService.updateShop(shopId, shopData)
        navigate(`/tiendas/${shopId}`)
      } else {
        await apiService.createShop(shopData)
        navigate("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la tienda`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(cat => cat !== category)
        : [...prev.categories, category]
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Editar Tienda" : "Crear Nueva Tienda"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isEditing 
              ? "Actualiza la información de tu tienda" 
              : "Completa la información para crear tu tienda en la plataforma"
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">{error}</div>}            {/* Nombre de la tienda */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la tienda *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="nombre"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Mi Tienda Local"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe tu tienda, productos que vendes, especialidades..."
              />
            </div>            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="direccion"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Calle, número, ciudad"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categorías de la tienda *
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                {['comida','electronica','ropa','libros','hogar','mascotas','belleza','farmacia','papeleria','ferreteria','jardineria','juguetes','deportes','otro'].map((category) => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shop Icon Image */}
            <div>
              <label htmlFor="iconImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL del ícono de la tienda *
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="iconImage"
                  name="iconImage"
                  type="url"
                  required
                  value={formData.images[0]}
                  onChange={(e) => handleImageChange(0, e.target.value)}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://ejemplo.com/icono-tienda.png"
                />
              </div>
            </div>

            {/* Shop Banner Image */}
            <div>
              <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL del banner/dashboard de la tienda *
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="bannerImage"
                  name="bannerImage"
                  type="url"
                  required
                  value={formData.images[1]}
                  onChange={(e) => handleImageChange(1, e.target.value)}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://ejemplo.com/banner-tienda.png"
                />
              </div>
            </div>            {/* Delivery */}
            <div className="flex items-center space-x-3">
              <input
                id="deliveryAvailable"
                name="deliveryAvailable"
                type="checkbox"
                checked={formData.deliveryAvailable}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
              />
              <label htmlFor="deliveryAvailable" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Truck className="w-4 h-4" />
                <span>Ofrecer servicio de delivery</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(isEditing ? `/tiendas/${shopId}` : "/dashboard")}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading 
                  ? (isEditing ? "Actualizando..." : "Creando...") 
                  : (isEditing ? "Actualizar Tienda" : "Crear Tienda")
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
