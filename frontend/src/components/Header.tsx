import { Link } from "react-router-dom"
import { ShoppingCart, User, MapPin } from "lucide-react"

interface HeaderProps {
  cartItemsCount?: number
}

export default function Header({ cartItemsCount = 0 }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Food Del</span>
          </Link>

          {/* Location */}
          <div className="hidden md:flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Deliver to: Your Location</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link to="/restaurants" className="text-gray-700 hover:text-orange-500 transition-colors">
              Restaurants
            </Link>
            <Link to="/orders" className="text-gray-700 hover:text-orange-500 transition-colors">
              Orders
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User */}
            <Link to="/profile" className="p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <User className="w-6 h-6" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
