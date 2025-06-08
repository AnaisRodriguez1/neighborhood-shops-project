"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff, Mail, Lock, User, UserCheck, Truck, MapPin, Phone, Clock, Tag } from "lucide-react"

export default function RegisterPage() {  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "comprador" as "locatario" | "comprador" | "repartidor",    // Delivery person fields
    vehicle: "bicicleta" as "bicicleta" | "motocicleta" | "auto" | "caminando",
    isAvailable: true,
    deliveryAddress: "",
    // Shop fields
    shopName: "",
    shopDescription: "",
    shopAddress: "",
    shopPhone: "",
    shopEmail: "",
    shopSchedule: "",
    shopDelivery: true,
    shopCategories: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  const { register } = useAuth()
  const navigate = useNavigate()

  // Funciones de validación
  const validateEmail = (email: string) => {
    // Validación simple con regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password: string) => {
    if (password.length < 6 || password.length > 50) return false
    // Contiene al menos una mayúscula, una minúscula y un número
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
    return re.test(password)
  }
  
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio."
    }

    if (!formData.email.trim()) {
      errors.email = "El email es obligatorio."
    } else if (!validateEmail(formData.email)) {
      errors.email = "El email no es válido."
    }

    if (!formData.password) {
      errors.password = "La contraseña es obligatoria."
    } else if (!validatePassword(formData.password)) {
      errors.password = "La contraseña debe tener entre 6 y 50 caracteres, incluir mayúscula, minúscula y número."
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden."
    }    // Validate role-specific fields
    if (formData.rol === "repartidor") {
      // Para repartidores, la configuración de delivery se hará después del registro
      // No se requiere información adicional durante el registro inicial
    }

    if (formData.rol === "locatario") {
      if (!formData.shopName.trim()) {
        errors.shopName = "El nombre de la tienda es obligatorio."
      }
      if (!formData.shopDescription.trim()) {
        errors.shopDescription = "La descripción de la tienda es obligatoria."
      }
      if (!formData.shopAddress.trim()) {
        errors.shopAddress = "La dirección de la tienda es obligatoria."
      }
      if (!formData.shopPhone.trim()) {
        errors.shopPhone = "El teléfono de la tienda es obligatorio."
      }
      if (!formData.shopEmail.trim()) {
        errors.shopEmail = "El email de la tienda es obligatorio."
      } else if (!validateEmail(formData.shopEmail)) {
        errors.shopEmail = "El email de la tienda no es válido."
      }
      if (!formData.shopSchedule.trim()) {
        errors.shopSchedule = "El horario de la tienda es obligatorio."
      }
      if (!formData.shopCategories.trim()) {
        errors.shopCategories = "Las categorías de la tienda son obligatorias."
      }
    }    setFieldErrors(errors)
    return Object.keys(errors).length === 0  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Prepare base user data
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
      }      // Add role-specific data
      if (formData.rol === "repartidor") {
        // Para repartidores, solo guardamos la información básica del usuario
        // La información de delivery se puede configurar más tarde en el perfil
        // cuando el usuario proporcione coordenadas o active la geolocalización
      } else if (formData.rol === "locatario") {
        userData.shopData = {
          name: formData.shopName,
          description: formData.shopDescription,
          address: formData.shopAddress,
          phone: formData.shopPhone,
          email: formData.shopEmail,
          schedule: formData.shopSchedule,
          delivery: formData.shopDelivery,
          categories: formData.shopCategories.split(',').map(cat => cat.trim()),
        }
      }

      await register(userData)
      navigate("/dashboard")
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = err?.response?.data?.message || err?.message || "Error al crear la cuenta. Intenta de nuevo."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }
  return (
    <div className="min-h-screen app-container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Cuenta</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    fieldErrors.name ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Tu nombre completo"
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
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
                  className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    fieldErrors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.email}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de cuenta
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="comprador">Comprador</option>
                  <option value="locatario">Locatario (Vendedor)</option>
                  <option value="repartidor">Repartidor</option>
                </select>
              </div>            </div>

            {/* Delivery Person Fields */}
            {formData.rol === "repartidor" && (
              <>
                {/* Vehicle Type */}
                <div>
                  <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de vehículo
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <select
                      id="vehicle"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="bicicleta">Bicicleta</option>
                      <option value="motocicleta">Motocicleta</option>
                      <option value="auto">Auto</option>
                      <option value="caminando">Caminando</option>
                    </select>
                  </div>
                </div>                {/* Delivery Address */}
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección de operación <span className="text-gray-500">(opcional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      id="deliveryAddress"
                      name="deliveryAddress"
                      type="text"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        fieldErrors.deliveryAddress ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Puedes configurar tu ubicación después del registro"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Podrás configurar tu ubicación y disponibilidad desde tu perfil después del registro.
                  </p>
                  {fieldErrors.deliveryAddress && (
                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.deliveryAddress}</p>
                  )}
                </div>

                {/* Availability Toggle */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Disponible para entregas
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Shop Creation Fields */}
            {formData.rol === "locatario" && (
              <>
                {/* Shop Name */}
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la tienda
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      value={formData.shopName}
                      onChange={handleChange}
                      className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        fieldErrors.shopName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Nombre de tu tienda"
                    />
                  </div>
                  {fieldErrors.shopName && (
                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.shopName}</p>
                  )}
                </div>

                {/* Shop Description */}
                <div>
                  <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción de la tienda
                  </label>
                  <textarea
                    id="shopDescription"
                    name="shopDescription"
                    rows={3}
                    value={formData.shopDescription}
                    onChange={handleChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      fieldErrors.shopDescription ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Describe tu tienda y productos"
                  />
                  {fieldErrors.shopDescription && (
                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.shopDescription}</p>
                  )}
                </div>

                {/* Shop Address */}
                <div>
                  <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección de la tienda
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      id="shopAddress"
                      name="shopAddress"
                      type="text"
                      value={formData.shopAddress}
                      onChange={handleChange}
                      className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        fieldErrors.shopAddress ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Dirección completa de tu tienda"
                    />
                  </div>
                  {fieldErrors.shopAddress && (
                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.shopAddress}</p>
                  )}
                </div>

                {/* Shop Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="shopPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        id="shopPhone"
                        name="shopPhone"
                        type="tel"
                        value={formData.shopPhone}
                        onChange={handleChange}
                        className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          fieldErrors.shopPhone ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                    {fieldErrors.shopPhone && (
                      <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.shopPhone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="shopEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email de la tienda
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        id="shopEmail"
                        name="shopEmail"
                        type="email"
                        value={formData.shopEmail}
                        onChange={handleChange}
                        className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          fieldErrors.shopEmail ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="tienda@email.com"
                      />
                    </div>
                    {fieldErrors.shopEmail && (
                      <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.shopEmail}</p>
                    )}
                  </div>
                </div>

                {/* Shop Schedule */}
                <div>
                  <label htmlFor="shopSchedule" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horario de atención
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      id="shopSchedule"
                      name="shopSchedule"
                      type="text"
                      value={formData.shopSchedule}
                      onChange={handleChange}
                      className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        fieldErrors.shopSchedule ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
                    />
                  </div>
                  {fieldErrors.shopSchedule && (
                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.shopSchedule}</p>
                  )}
                </div>

                {/* Shop Categories */}
                <div>
                  <label htmlFor="shopCategories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categorías (separadas por comas)
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      id="shopCategories"
                      name="shopCategories"
                      type="text"
                      value={formData.shopCategories}
                      onChange={handleChange}
                      className={`pl-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        fieldErrors.shopCategories ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Alimentación, Bebidas, Snacks"
                    />
                  </div>
                  {fieldErrors.shopCategories && (
                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.shopCategories}</p>
                  )}
                </div>

                {/* Delivery Option */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="shopDelivery"
                      checked={formData.shopDelivery}
                      onChange={(e) => setFormData(prev => ({ ...prev, shopDelivery: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ofrecer servicio de delivery
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    fieldErrors.password ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    fieldErrors.confirmPassword ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{fieldErrors.confirmPassword}</p>
              )}
            </div>            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {isLoading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
