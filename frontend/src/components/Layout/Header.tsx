"use client";

import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, Sun, Moon, Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { capitalizeFirstLetter, getFirstName } from "@/utils/format";

export default function Header() {
  const { user, viewMode, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-card/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <Store className="text-primary-foreground font-bold text-xl" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Tienda Pez Caucho
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-full"
              title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <>                {/* Navigation Links */}
                <div className="flex items-center space-x-1">
                  <Link
                    to="/tiendas"
                    className="px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 rounded-full font-medium"
                  >
                    Tiendas
                  </Link>
                  
                  {/* Admin Links (only for presidente role) */}
                  {user.role === "presidente" && (
                    <>
                      <Link
                        to="/admin/metricas"
                        className="px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 rounded-full font-medium"
                      >
                        Métricas
                      </Link>
                      <Link
                        to="/admin/tiendas"
                        className="px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 rounded-full font-medium"
                      >
                        Admin Tiendas
                      </Link>                      <Link
                        to="/admin/productos"
                        className="px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 rounded-full font-medium"
                      >
                        Admin Productos
                      </Link>
                      <Link
                        to="/admin/usuarios"
                        className="px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 rounded-full font-medium"
                      >
                        Admin Usuarios
                      </Link>
                    </>
                  )}
                </div>
                {/* Cart (only in comprador view) */}
                {viewMode?.current === "comprador" && (
                  <Link
                    to="/carrito"
                    className="relative p-2.5 text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 rounded-full"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                )}{" "}
                {/* User Menu */}
                <Link to="/dashboard">
                  <div className="flex items-center space-x-3 pl-4 border-l border-border/40">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        Hola, {getFirstName(user.name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {capitalizeFirstLetter(user.role)}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-full"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {" "}
                <Link
                  to="/login"
                  className="px-4 py-2 text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 rounded-full font-medium"
                >
                  Iniciar Sesión
                </Link>{" "}
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2.5 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
