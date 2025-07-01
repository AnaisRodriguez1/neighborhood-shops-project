import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { ThemeProvider } from "./context/ThemeContext"
import Header from "./components/Layout/Header"
import ProtectedRoute from "./components/ProtectedRoute"
import "./App.css"

// Pages
import HomePage from "./pages/HomePage"
import DashboardPage from "./pages/DashboardPage"

// Auth Pages
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"

// Shop Pages
import TiendasPage from "./pages/shop/TiendasPage"
import TiendaDetallePage from "./pages/shop/TiendaDetallePage"
import ProductoDetallePage from "./pages/shop/ProductoDetallePage"
import CrearTiendaPage from "./pages/shop/CrearTiendaPage"
import CrearProductoPage from "./pages/shop/CrearProductoPage"
import ShopOrdersPage from "./pages/shop/ShopOrdersPage"

// Order Pages
import CarritoPage from "./pages/orders/CarritoPage"
import MisPedidosPage from "./pages/orders/MisPedidosPage"

// Delivery Pages
import RepartidorPage from "./pages/delivery/RepartidorPage"

// Admin Pages
import AdminMetricsPage from "./pages/admin/AdminMetricsPage"
import AdminShopsPage from "./pages/admin/AdminShopsPage"
import AdminProductsPage from "./pages/admin/AdminProductsPage"
import AdminUsersPage from "./pages/admin/AdminUsersPage"

// Supplier Pages
import { SuppliersPage } from "./pages/suppliers"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="app-container relative z-10 min-h-screen">
              <Header />
              <Routes>                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/tiendas" element={<TiendasPage />} />
                <Route path="/tiendas/:id" element={<TiendaDetallePage />} />
                <Route path="/productos/:id" element={<ProductoDetallePage />} />

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
                  path="/tiendas/:shopId/editar"
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
                />                <Route
                  path="/carrito"
                  element={
                    <ProtectedRoute requiredViewMode="comprador">
                      <CarritoPage />
                    </ProtectedRoute>
                  }
                />                <Route
                  path="/mis-pedidos"
                  element={
                    <ProtectedRoute>
                      <MisPedidosPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/gestionar-pedidos"
                  element={
                    <ProtectedRoute requiredRole="locatario">
                      <ShopOrdersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/proveedores"
                  element={
                    <ProtectedRoute requiredRole="locatario">
                      <SuppliersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/repartidor"
                  element={
                    <ProtectedRoute requiredRole="repartidor">
                      <RepartidorPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/repartidor"
                  element={
                    <ProtectedRoute requiredRole="repartidor">
                      <RepartidorPage />
                    </ProtectedRoute>
                  }
                />{/* Admin routes */}
                <Route
                  path="/admin/metricas"
                  element={
                    <ProtectedRoute requiredRole="presidente">
                      <AdminMetricsPage />
                    </ProtectedRoute>
                  }
                />                <Route
                  path="/admin/tiendas"
                  element={
                    <ProtectedRoute requiredRole="presidente">
                      <AdminShopsPage />
                    </ProtectedRoute>
                  }
                />                <Route
                  path="/admin/productos"
                  element={
                    <ProtectedRoute requiredRole="presidente">
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute requiredRole="presidente">
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App