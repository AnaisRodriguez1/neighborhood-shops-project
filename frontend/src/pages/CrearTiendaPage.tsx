"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Store, MapPin, Phone, Mail, Clock, Truck } from "lucide-react"

export default function CrearTiendaPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    horario: "",
    delivery: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { user } = useAuth()
  const navigate = useNavigate()
  // Verificar que el usuario sea locatario
  if (user?.rol !== "locatario") {
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
      await apiService.createShop(formData)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message || "Error al crear la tienda")
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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Nueva Tienda</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Completa la información para crear tu tienda en la plataforma</p>
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
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
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
                name="descripcion"
                required
                rows={4}
                value={formData.descripcion}
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
                  name="direccion"
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Calle, número, ciudad"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email de contacto *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="contacto@mitienda.com"
                />
              </div>
            </div>

            {/* Horario */}
            <div>
              <label htmlFor="horario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horario de atención *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="horario"
                  name="horario"
                  type="text"
                  required
                  value={formData.horario}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Lun-Vie 9:00-18:00, Sáb 9:00-14:00"
                />
              </div>
            </div>

            {/* Delivery */}
            <div className="flex items-center space-x-3">
              <input
                id="delivery"
                name="delivery"
                type="checkbox"
                checked={formData.delivery}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
              />
              <label htmlFor="delivery" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Truck className="w-4 h-4" />
                <span>Ofrecer servicio de delivery</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Creando..." : "Crear Tienda"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
