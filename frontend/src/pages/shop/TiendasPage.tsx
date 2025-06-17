"use client";

import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Star, Clock, MapPin, Truck, Phone, Mail, Store } from "lucide-react";
import { Tienda } from "../../types";
import { capitalizeWords } from "../../utils/format";

export default function TiendasPage() {
  const [shops, setShops] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {} = useAuth();

  useEffect(() => {
    loadShops();
  }, [page]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await apiService.getShops(page, 10);

      if (page === 1) {
        setShops(response.data || response);
      } else {
        setShops((prev) => [...prev, ...(response.data || response)]);
      }

      setHasMore((response.data || response).length === 10);
    } catch (err) {
      setError("Error al cargar las tiendas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Ordenar tiendas por score (de mayor a menor)
  const sortedShops = [...shops].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );
  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Cargando tiendas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {" "}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Explorar Tiendas
          </h1>{" "}
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Descubre productos únicos en tiendas locales (ordenadas por score)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tiendas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {" "}              {/* Shop Image */}
              <div className="h-48 relative overflow-hidden">
                {shop.images && shop.images[1] ? (
                  // Imagen de banner (dashboard) si está disponible
                  <img
                    src={shop.images[1]}
                    alt={`Banner de ${shop.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.querySelector('.fallback-banner')!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {/* Fallback banner si no hay imagen */}
                <div className={`fallback-banner absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ${shop.images && shop.images[1] ? 'hidden' : ''}`}>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-white">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Profile Image (icono) overlay */}
                <div className="absolute bottom-4 left-4">
                  {shop.images && shop.images[0] ? (
                    <img
                      src={shop.images[0]}
                      alt={`Logo de ${shop.name}`}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.querySelector('.fallback-profile')!.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Fallback profile si no hay imagen */}
                  <div className={`fallback-profile w-16 h-16 bg-white bg-opacity-90 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${shop.images && shop.images[0] ? 'hidden' : ''}`}>
                    <span className="text-xl font-bold text-gray-800">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Shop Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {capitalizeWords(shop.name)}
                  </h3>
                  {shop.rating !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {shop.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {shop.description}
                </p>
                {/* Shop Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{shop.address}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{shop.schedule}</span>
                  </div>

                  {shop.delivery && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <Truck className="w-4 h-4" />
                      <span>Delivery disponible</span>
                    </div>
                  )}
                </div>{" "}
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{shop.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{shop.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              Cargar Más Tiendas
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div className="text-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && shops.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>{" "}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay tiendas disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Aún no hay tiendas registradas en la plataforma.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
