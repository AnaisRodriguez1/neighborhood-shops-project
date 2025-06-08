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
import MisPedidosPage from "./pages/MisPedidosPage"
import AdminMetricsPage from "./pages/AdminMetricsPage"
import AdminShopsPage from "./pages/AdminShopsPage"
import AdminProductsPage from "./pages/AdminProductsPage"
import AdminUsersPage from "./pages/AdminUsersPage"
import TodosLosPedidosPage from "./pages/TodosLosPedidosPage"
import RepartidorPage from "./pages/RepartidorPage"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="app-container relative z-10 min-h-screen">
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
                />                <Route
                  path="/todos-los-pedidos"
                  element={
                    <ProtectedRoute requiredRole="locatario">
                      <TodosLosPedidosPage />
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