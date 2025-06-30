import { useState, useEffect, useCallback } from 'react';
import { 
  getSuppliersRequest, 
  getSupplierProductsRequest,
  addProductsToShop
} from '../../api/suppliersApi';
import { getMyShopsRequest } from '../../api/shopsApi';
import { 
  Package, 
  ShoppingCart, 
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
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  stock: number;
  images: string[];
  supplierId: string;
}

interface ProductQuantity {
  [productId: string]: number;
}

interface Shop {
  _id?: string;
  id?: string;
  name: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<Product[]>([]);
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [productQuantities, setProductQuantities] = useState<ProductQuantity>({});
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isAddingToShop, setIsAddingToShop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Helper function to get supplier ID
  const getSupplierId = (supplier: Supplier): string => {
    return supplier._id || supplier.id || '';
  };
  
  // Helper function to get product ID
  const getProductId = (product: any, index: number): string => {
    return product._id || product.id || product.productId || `temp-id-${index}-${product.name?.replace(/\s+/g, '-').toLowerCase()}`;
  };
  
  // Helper function to get shop ID
  const getShopId = (shop: any): string => {
    return shop._id || shop.id || shop.name;
  };
  
  useEffect(() => {
    loadSuppliers();
    loadUserShops();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliersRequest();
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
        const firstShopId = getShopId(shops[0]);
        setSelectedShop(firstShopId);
      }
    } catch (error) {
      console.error('Error loading user shops:', error);
    }
  };

  const loadSupplierProducts = async (supplierId: string) => {
    try {
      setLoadingProducts(true);
      const products = await getSupplierProductsRequest(supplierId);
      setSupplierProducts(products || []);
    } catch (error) {
      console.error('Error loading supplier products:', error);
      setSupplierProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    const supplierId = getSupplierId(supplier);
    setSelectedSupplier(supplier);
    setSelectedCategory('');
    setProductQuantities({}); // Reset quantities when changing supplier
    loadSupplierProducts(supplierId);
  };

  const updateProductQuantity = useCallback((productId: string, change: number) => {
    setProductQuantities(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      // Si la nueva cantidad es 0, eliminar el producto del objeto
      if (newQuantity === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      
      // Actualizar la cantidad
      return {
        ...prev,
        [productId]: newQuantity
      };
    });
  }, []);

  const handleAddProductsToShop = async () => {
    // Get products with quantities > 0
    const selectedProducts = Object.keys(productQuantities).filter(id => productQuantities[id] > 0);
    
    if (!selectedSupplier || !selectedShop || selectedProducts.length === 0) {
      alert('Por favor selecciona una tienda y añade al menos un producto al carrito (cantidad > 0)');
      return;
    }

    try {
      setIsAddingToShop(true);
      
      // Debug: Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Error: No hay sesión activa. Por favor inicia sesión.');
        return;
      }
      console.log('Token exists:', !!token);
      
      const supplierId = getSupplierId(selectedSupplier);
      const shopId = selectedShop; // selectedShop is already a string ID
      
      console.log('Making request to:', `http://localhost:8080/api/suppliers/${supplierId}/add-to-shop/${shopId}`);
      
      // Prepare the request body in the format expected by the backend
      const requestBody = {
        products: selectedProducts.map(productId => {
          const product = supplierProducts.find((p: any) => getProductId(p, supplierProducts.indexOf(p)) === productId);
          return {
            productId: product?._id || product?.id || productId,
            quantity: productQuantities[productId]
          };
        })
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      // Make API call to add products to shop
      await addProductsToShop(supplierId, shopId, requestBody);
      
      const totalUnits = Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0);
      const selectedShopObj = userShops.find(shop => getShopId(shop) === selectedShop);
      const shopName = selectedShopObj?.name || 'la tienda seleccionada';
      alert(`¡Éxito! ${totalUnits} unidad(es) de ${selectedProducts.length} producto(s) diferentes de ${selectedSupplier.name} añadido(s) a ${shopName}. Ahora puedes gestionarlos desde tu inventario.`);
      setProductQuantities({});
    } catch (error: any) {
      // Display user-friendly error messages
      if (error.response?.status === 404) {
        alert('Error: Algunos productos no se encontraron o no pertenecen a este proveedor');
      } else if (error.response?.status === 400) {
        alert('Error: Datos inválidos. Verifica que los productos y el negocio sean correctos');
      } else {
        alert('Error al agregar productos al negocio. Inténtalo de nuevo');
      }
      
      console.error('Error adding products to shop:', error);
    } finally {
      setIsAddingToShop(false);
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
                          key={`${getSupplierId(supplier)}-${category}-${index}`}
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

            {/* Shop Selection and Action Bar */}
            <div className="mb-6 space-y-4">
              {/* Shop Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Seleccionar Tienda de Destino
                </h3>
                <select
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona una tienda...</option>
                  {userShops.map((shop) => {
                    const shopId = getShopId(shop);
                    return (
                      <option key={shopId} value={shopId}>
                        {capitalizeWords(shop.name)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Action Bar */}
              {Object.keys(productQuantities).length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        🛒 {Object.keys(productQuantities).length} producto(s) en el carrito
                      </span>
                      <span className="text-green-600 dark:text-green-300 text-sm">
                        Total unidades: {Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setProductQuantities({})}
                        className="px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                      >
                        Vaciar Carrito
                      </button>
                      <button
                        onClick={handleAddProductsToShop}
                        disabled={!selectedShop || isAddingToShop}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{isAddingToShop ? 'Añadiendo...' : 'Añadir a Tienda'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Layout with Filter and Products */}
            <div className="flex gap-6">
              {/* Category Filter Box */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar por Categoría
                  </h3>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === ''
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Todas las categorías
                    </button>
                    
                    {[...new Set(supplierProducts.flatMap(p => p.tags))].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {capitalizeWords(category)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="flex-1">
                {loadingProducts ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Cargando productos...</p>
                  </div>
                ) : (
                  <>
                    {/* Filtered Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {supplierProducts
                        .filter(product => !selectedCategory || product.tags.includes(selectedCategory))
                        .map((product, index) => {
                          const productId = getProductId(product, index);
                          const quantity = productQuantities[productId] || 0;
                          
                          return (
                            <div
                              key={productId}
                              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
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
                                {quantity > 0 && (
                                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    {quantity}
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
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    ${product.price.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Stock: {product.stock}
                                  </span>
                                </div>
                                <div className="mb-4">
                                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                    {product.tags.length > 0 ? capitalizeWords(product.tags[0]) : 'Sin categoría'}
                                  </span>
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Cantidad para comprar:
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateProductQuantity(productId, -1);
                                      }}
                                      disabled={quantity === 0}
                                      className="w-8 h-8 rounded-full border border-red-300 dark:border-red-600 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-red-600"
                                      type="button"
                                    >
                                      <span className="text-lg leading-none">-</span>
                                    </button>
                                    <span className="w-12 text-center font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 py-1 rounded">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateProductQuantity(productId, 1);
                                      }}
                                      className="w-8 h-8 rounded-full border border-green-300 dark:border-green-600 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-green-600"
                                      type="button"
                                    >
                                      <span className="text-lg leading-none">+</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {supplierProducts.filter(product => !selectedCategory || product.tags.includes(selectedCategory)).length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          No hay productos en esta categoría
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedCategory 
                            ? `No se encontraron productos en la categoría "${capitalizeWords(selectedCategory)}"`
                            : 'Este proveedor no tiene productos disponibles en este momento'
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
