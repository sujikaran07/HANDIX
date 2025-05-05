import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { Heart, Loader2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoriteContext';

const FavoritesPage = () => {
  const { favorites, removeFromFavorites, loading, error } = useFavorites();
  
  // Process favorites to ensure they have proper number values for price
  const processedFavorites = Array.isArray(favorites) ? favorites.map(item => ({
    ...item,
    id: item.id,
    price: typeof item.price === 'string' ? Number(item.price) : 
           typeof item.price === 'number' ? item.price : 3999,
    name: item.name || 'Product',
    images: Array.isArray(item.images) && item.images.length > 0 
      ? item.images 
      : ['/images/placeholder.png']
  })) : [];

  useEffect(() => {
    // Log the first product to help debug price issues
    if (processedFavorites.length > 0) {
      console.log('First favorite after processing:', {
        id: processedFavorites[0].id,
        name: processedFavorites[0].name,
        price: processedFavorites[0].price,
        priceType: typeof processedFavorites[0].price
      });
    }
  }, [processedFavorites]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-16">
          <div className="container-custom flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p>Loading your favorites...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-16">
          <div className="container-custom">
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Favorites</h1>
            
            {processedFavorites.length > 0 && (
              <div className="bg-gray-100 py-2 px-4 rounded-full flex items-center">
                <Heart size={18} className="text-primary mr-2" />
                <span className="font-medium">
                  {processedFavorites.length} {processedFavorites.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            )}
          </div>
          
          {processedFavorites.length > 0 ? (
            <ProductGrid 
              products={processedFavorites} 
              onRemove={removeFromFavorites} 
              showRemoveButton={true}
            />
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <Heart size={64} className="mx-auto text-gray-300" />
              </div>
              <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
              <p className="text-gray-500 mb-6">
                Browse our products and click the heart icon to add items to your favorites.
              </p>
              <Link to="/products" className="btn-primary">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FavoritesPage;
