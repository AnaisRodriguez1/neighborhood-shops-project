"use client"

import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, LogOut, Eye, Settings, Sun, Moon } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useTheme } from "../../context/ThemeContext"

export default function Header() {
  const { user, viewMode, logout, switchToComprador, switchToAdmin } = useAuth()
  const { getTotalItems } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleViewModeSwitch = () => {
    if (viewMode?.current === "admin") {
      switchToComprador()
    } else {
      switchToAdmin()
    }
  }
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TiendaWeb</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* View Mode Indicator */}
                {viewMode && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Vista: {viewMode.current === "admin" ? "Administrador" : "Comprador"}
                    </span>
                    {viewMode.originalRole !== "comprador" && (
                      <button
                        onClick={handleViewModeSwitch}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        title="Cambiar vista"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Tiendas Link */}
                <Link to="/tiendas" className="text-muted-foreground hover:text-primary transition-colors">
                  Tiendas
                </Link>

                {/* Cart (only in comprador view) */}
                {viewMode?.current === "comprador" && (
                  <Link to="/carrito" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                    <ShoppingCart className="w-6 h-6" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {user.nombre} ({user.rol})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
