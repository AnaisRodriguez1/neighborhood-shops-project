import { Link } from "react-router-dom"
import { Store, ShoppingBag, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Bienvenido a <span className="text-blue-600 dark:text-blue-400">TiendaWeb</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              La plataforma que conecta tiendas locales con compradores. Descubre productos únicos, apoya negocios
              locales y disfruta de una experiencia de compra excepcional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg border-2 border-blue-600 dark:border-blue-400"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">¿Qué puedes hacer en TiendaWeb?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Nuestra plataforma está diseñada para diferentes tipos de usuarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Para Compradores */}
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Para Compradores</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Explora tiendas locales</li>
                <li>• Compra productos únicos</li>
                <li>• Deja reseñas y calificaciones</li>
                <li>• Disfruta del delivery</li>
              </ul>
            </div>

            {/* Para Locatarios */}
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Para Locatarios</h3>              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Crea tu tienda online</li>
                <li>• Gestiona tu inventario</li>
                <li>• Configura delivery</li>
                <li>• Conecta con clientes</li>
              </ul>
            </div>

            {/* Para Administradores */}
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Para Administradores</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Supervisa todas las tiendas</li>
                <li>• Gestiona contenido</li>
                <li>• Modera reseñas</li>
                <li>• Mantiene la calidad</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de tiendas y compradores. Comienza tu experiencia en TiendaWeb hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors shadow-lg"
            >
              Crear Cuenta
            </Link>
            <Link
              to="/tiendas"
              className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors border-2 border-white"
            >
              Explorar Tiendas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
