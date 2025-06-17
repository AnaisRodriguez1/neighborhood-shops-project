import { useState, useEffect } from 'react';
import { Store, Trash2, AlertTriangle, Star, MapPin, Users } from 'lucide-react';
import { Tienda } from '../../types';
import { apiService } from '../../services/api';
import { capitalizeWords } from '../../utils/format';

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await apiService.getShops(1, 100); // Cargar todas las tiendas
      setShops(response.data || response);
    } catch (err) {
      setError('Error al cargar las tiendas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = async (shopId: string, shopName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar permanentemente la tienda "${shopName}"?\n\nEsta acción también eliminará todos los productos de la tienda y no se puede deshacer.`)) {
      return;
    }

    try {
      setDeleteLoading(shopId);
      await apiService.adminDeleteShop(shopId);
      
      // Remover de la lista
      setShops(shops.filter(shop => shop.id !== shopId));
      
      alert('Tienda eliminada correctamente');
    } catch (err: any) {
      alert(`Error al eliminar tienda: ${err.message || 'Error desconocido'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando tiendas...</p>
        </div>
      </div>
    );
  }

  const lowScoreShops = shops.filter(shop => (shop.score || 0) < 3);
  const activeShops = shops.filter(shop => shop.isActive !== false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Administración de Tiendas
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Gestiona y modera tiendas sospechosas o que violen políticas de la plataforma
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Tiendas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{shops.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Tiendas Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeShops.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Score Bajo (&lt;3)</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {lowScoreShops.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Score Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {shops.length > 0 ? 
                    (shops.reduce((acc, shop) => acc + (shop.score || 0), 0) / shops.length).toFixed(1) : 
                    '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiendas con problemas destacadas */}
        {lowScoreShops.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                Tiendas que requieren atención (Score &lt; 3.0)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowScoreShops.map((shop) => (
                <div key={shop.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {capitalizeWords(shop.name)}
                    </h4>
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{(shop.score || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">
                    {shop.email}
                  </p>
                  <button
                    onClick={() => handleDeleteShop(shop.id, shop.name)}
                    disabled={deleteLoading === shop.id}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {deleteLoading === shop.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de todas las tiendas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Todas las Tiendas ({shops.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tienda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {shops.map((shop) => (
                  <tr 
                    key={shop.id} 
                    className={`${(shop.score || 0) < 3 ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {shop.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {capitalizeWords(shop.name)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {shop.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className={`w-4 h-4 mr-1 ${(shop.score || 0) >= 3 ? 'text-yellow-400' : 'text-red-400'}`} />
                        <span className={`text-sm font-medium ${(shop.score || 0) >= 3 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {(shop.score || 0).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate max-w-xs">{shop.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        shop.isActive !== false 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {shop.isActive !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteShop(shop.id, shop.name)}
                        disabled={deleteLoading === shop.id}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {deleteLoading === shop.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {!loading && shops.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-24 h-24 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay tiendas registradas
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Aún no hay tiendas en la plataforma para gestionar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
