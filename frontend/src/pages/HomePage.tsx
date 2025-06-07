import { Link } from "react-router-dom"

export default function HomePage() {
  return (
  <div className="min-h-screen app-container">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-80">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Bienvenido a <span className="text-blue-900 dark:text-blue-400">Tienda Pez Caucho</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              La plataforma que conecta tiendas locales con compradores. Descubre productos únicos, apoya negocios
              locales y disfruta de una experiencia de compra excepcional y personalizada.
            </p>
          </div>
        </div>

      </div>   
      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-sky-500/30 to-indigo-950/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de tiendas y compradores. Comienza tu experiencia en Tienda Pez Caucho hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Crear Cuenta
            </Link>
            <Link
              to="/tiendas"
              className="bg-transparent text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors border-2 border-white"
            >
              Explorar Tiendas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
