import { useState, useEffect } from 'react';
import { 
  getSuppliersRequest, 
  getSupplierProductsRequest, 
  addSupplierProductsToShopRequest,
  toggleSupplierRelationshipRequest
} from '../../api/suppliersApi';
import { getMyShopsRequest } from '../../api/shopsApi';
import { 
  Package, 
  ShoppingCart, 
  Plus, 
  Check, 
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { capitalizeWords } from '../../utils/format';

interface Supplier {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  categories: string[];
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  stock: number;
  images: string[];
  supplierId: string;
}

interface Shop {
  _id: string;
  name: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<Product[]>([]);
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Helper function to get supplier ID
  const getSupplierId = (supplier: Supplier): string => {
    return supplier._id || supplier.id || '';
  };
  
  useEffect(() => {
    loadSuppliers();
    loadUserShops();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliersRequest();
      console.log('🏪 Loaded suppliers:', data);
      console.log('🏪 First supplier structure:', data?.[0]);
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserShops = async () => {
    try {
      const shops = await getMyShopsRequest();
      setUserShops(shops || []);
      if (shops && shops.length > 0) {
        setSelectedShop(shops[0]._id);
      }
    } catch (error) {
      console.error('Error loading user shops:', error);
    }
  };

  const loadSupplierProducts = async (supplierId: string) => {
    try {
      console.log('🔍 Loading products for supplier:', supplierId);
      setLoadingProducts(true);
      const products = await getSupplierProductsRequest(supplierId);
      console.log('📦 Received products:', products);
      console.log('📦 Products count:', products?.length || 0);
      setSupplierProducts(products || []);
    } catch (error) {
      console.error('❌ Error loading supplier products:', error);
      setSupplierProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    const supplierId = getSupplierId(supplier);
    console.log('🏪 Selecting supplier:', supplier.name, 'ID:', supplierId);
    setSelectedSupplier(supplier);
    setSelectedProducts([]);
    loadSupplierProducts(supplierId);
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddProductsToShop = async () => {
    if (!selectedSupplier || !selectedShop || selectedProducts.length === 0) {
      alert('Por favor selecciona un proveedor, una tienda y al menos un producto');
      return;
    }

    try {
      const supplierId = getSupplierId(selectedSupplier);
      const response = await addSupplierProductsToShopRequest(supplierId, selectedShop, selectedProducts);
      console.log('✅ Productos añadidos exitosamente:', response);
      alert(`¡Éxito! ${selectedProducts.length} producto(s) de ${selectedSupplier.name} añadido(s) a tu tienda. Ahora puedes gestionarlos desde tu inventario.`);
      setSelectedProducts([]);
      // Opcional: volver a la lista de proveedores
      // setSelectedSupplier(null);
    } catch (error) {
      console.error('❌ Error adding products to shop:', error);
      alert('Error al añadir productos a la tienda. Por favor intenta de nuevo.');
    }
  };

  const handleToggleSupplierRelationship = async (supplierId: string, isWorking: boolean) => {
    if (!selectedShop) {
      alert('Por favor selecciona una tienda');
      return;
    }

    try {
      await toggleSupplierRelationshipRequest(supplierId, selectedShop, isWorking);
      alert(`${isWorking ? 'Comenzaste' : 'Dejaste'} de trabajar con este proveedor`);
      loadSuppliers();
    } catch (error) {
      console.error('Error toggling supplier relationship:', error);
      alert('Error al actualizar relación con proveedor');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || supplier.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const allCategories = [...new Set(suppliers.flatMap(s => s.categories))];

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-950/70 dark:bg-gray-900/70 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedSupplier ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gestión de Proveedores
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Encuentra proveedores y añade sus productos a tus tiendas
              </p>
            </div>

            {/* Shop Selection */}
            {userShops.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Seleccionar Tienda
                </h3>
                <select
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {userShops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {capitalizeWords(shop.name)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buscar proveedores
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filtrar por categoría
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Todas las categorías</option>
                      {allCategories.map((category) => (
                        <option key={category} value={category}>
                          {capitalizeWords(category)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={getSupplierId(supplier)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {capitalizeWords(supplier.name)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {supplier.contactPhone}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {supplier.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {supplier.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Categorías:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {capitalizeWords(category)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSupplierSelect(supplier)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Ver Productos
                    </button>
                    {selectedShop && (
                      <button
                        onClick={() => handleToggleSupplierRelationship(getSupplierId(supplier), true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Trabajar con este proveedor"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No se encontraron proveedores
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchTerm || selectedCategory 
                    ? 'Intenta ajustar tus filtros de búsqueda'
                    : 'No hay proveedores disponibles en este momento'
                  }
                </p>
              </div>
            )}
          </>
        ) : (
          /* Supplier Products View */
          <>
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a proveedores</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Productos de {capitalizeWords(selectedSupplier.name)}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedSupplier.description}
              </p>
            </div>

            {/* Action Bar */}
            {selectedProducts.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                      {selectedProducts.length} producto(s) seleccionado(s)
                    </span>
                    {userShops.length > 1 && (
                      <select
                        value={selectedShop}
                        onChange={(e) => setSelectedShop(e.target.value)}
                        className="px-3 py-1 border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-700 text-sm"
                      >
                        {userShops.map((shop) => (
                          <option key={shop._id} value={shop._id}>
                            {capitalizeWords(shop.name)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedProducts([])}
                      className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddProductsToShop}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Añadir a Tienda</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Cargando productos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {supplierProducts.map((product) => (
                  <div
                    key={product._id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                      selectedProducts.includes(product._id) 
                        ? 'ring-2 ring-blue-500 transform scale-105' 
                        : ''
                    }`}
                    onClick={() => handleProductToggle(product._id)}
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {selectedProducts.includes(product._id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {capitalizeWords(product.name)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          {product.tags.length > 0 ? capitalizeWords(product.tags[0]) : 'Sin categoría'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {supplierProducts.length === 0 && !loadingProducts && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay productos disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Este proveedor no tiene productos disponibles en este momento
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
