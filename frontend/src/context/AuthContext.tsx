"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "../services/api"
import type { User, ViewMode } from "../types"

interface AuthContextType {  user: User | null
  viewMode: ViewMode | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  switchToComprador: () => void
  switchToOriginalRole: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const userData = await apiService.checkAuthStatus(token)
        setUser(userData)
        setViewMode({
          current: userData.role,
          originalRole: userData.role,
        })
      }
    } catch (error) {
      // Token inválido, limpiar
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await apiService.login(email, password)

      // Guardar token
      localStorage.setItem("token", data.token)
      // Obtener datos completos del usuario
      const userData = await apiService.checkAuthStatus(data.token)
      setUser(userData)
      setViewMode({
        current: userData.role,
        originalRole: userData.role,
      })
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      await apiService.register({
        email: userData.email,
        password: userData.password,
        name: userData.name, // Use name for API to match backend
        rol: userData.rol, // Keep rol for the API call (DTO expects rol)
      })

      // Hacer login automático después del registro
      await login(userData.email, userData.password)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setViewMode(null)
    localStorage.removeItem("token")
  }

  const switchToComprador = () => {
    if (viewMode) {
      setViewMode({ ...viewMode, current: "comprador" })
    }
  }
  const switchToOriginalRole = () => {
    if (viewMode) {
      setViewMode({ ...viewMode, current: viewMode.originalRole })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        viewMode,
        login,
        register,
        logout,        switchToComprador,
        switchToOriginalRole,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
