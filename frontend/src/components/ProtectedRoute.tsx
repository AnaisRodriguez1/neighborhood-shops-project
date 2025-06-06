"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "presidente" | "locatario" | "comprador"
  requiredViewMode?: "admin" | "comprador"
}

export default function ProtectedRoute({ children, requiredRole, requiredViewMode }: ProtectedRouteProps) {
  const { user, viewMode, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  if (requiredViewMode && viewMode?.current !== requiredViewMode) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
