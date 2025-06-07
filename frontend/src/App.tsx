import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { ThemeProvider } from "./context/ThemeContext"
import Header from "./components/Layout/Header"
import ProtectedRoute from "./components/ProtectedRoute"
import "./App.css"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import TiendasPage from "./pages/TiendasPage"
import TiendaDetallePage from "./pages/TiendaDetallePage"
import CrearTiendaPage from "./pages/CrearTiendaPage"
import CrearProductoPage from "./pages/CrearProductoPage"
import CarritoPage from "./pages/CarritoPage"

function App() {  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="app-container"></div>
            <div className="relative z-10 min-h-screen">
              <Header />
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tiendas" element={<TiendasPage />} />
              <Route path="/tiendas/:id" element={<TiendaDetallePage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/crear-tienda"
                element={
                  <ProtectedRoute requiredRole="locatario">
                    <CrearTiendaPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tiendas/:tiendaId/productos/nuevo"
                element={
                  <ProtectedRoute>
                    <CrearProductoPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/productos/:productId/editar"
                element={
                  <ProtectedRoute>
                    <CrearProductoPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/carrito"
                element={
                  <ProtectedRoute requiredViewMode="comprador">
                    <CarritoPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/tiendas"
                element={
                  <ProtectedRoute requiredViewMode="admin">
                    <TiendasPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/productos"
                element={
                  <ProtectedRoute requiredViewMode="admin">
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Gestión de Productos</h1>
                      <p className="text-gray-600 mt-2">Funcionalidad en desarrollo</p>
                    </div>
                  </ProtectedRoute>
                }
                            />            </Routes>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
