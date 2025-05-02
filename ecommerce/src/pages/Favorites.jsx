import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { useToast } from '../hooks/use-toast';
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch favorites from localStorage
    const savedFavorites = localStorage.getItem('handixFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites', error);
      }
    }
    setLoading(false);
  }, []);

  const removeFromFavorites = (productId) => {
    const updatedFavorites = favorites.filter(product => product.id !== productId);
    setFavorites(updatedFavorites);
    localStorage.setItem('handixFavorites', JSON.stringify(updatedFavorites));
    toast({
      title: "Removed from favorites",
      description: "The product has been removed from your favorites",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Favorites</h1>
            
            {/* Favorites Count Badge */}
            {!loading && favorites.length > 0 && (
              <div className="bg-gray-100 py-2 px-4 rounded-full flex items-center">
                <Heart size={18} className="text-primary mr-2" />
                <span className="font-medium">
                  {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p>Loading your favorites...</p>
            </div>
          ) : favorites.length > 0 ? (
            <>
              <ProductGrid products={favorites} />
            </>
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
