import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const FavoriteContext = createContext(undefined);
const API_BASE_URL = 'http://localhost:5000/api';

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Get user from localStorage (if authenticated)
  const getUserId = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        return userData.c_id || null;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true' && getUserId() !== null;
  };

  // Load favorites: from API if authenticated, otherwise from localStorage
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated()) {
          // Load favorites from API
          const userId = getUserId();
          const response = await axios.get(`${API_BASE_URL}/favorites/${userId}`);
          
          // Make sure each item has a valid price
          const processedFavorites = response.data.map(item => ({
            ...item,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '3999')
          }));
          
          setFavorites(processedFavorites);
        } else {
          // Load favorites from localStorage
          const savedFavorites = localStorage.getItem('handixFavorites');
          if (savedFavorites) {
            try {
              const parsed = JSON.parse(savedFavorites);
              
              // Make sure each item has a valid price
              const processedFavorites = parsed.map(item => ({
                ...item,
                price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '3999')
              }));
              
              setFavorites(processedFavorites);
            } catch (error) {
              console.error('Failed to parse favorites from localStorage', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setError('Failed to load your favorites');
        
        // Fallback to localStorage if API fails
        const savedFavorites = localStorage.getItem('handixFavorites');
        if (savedFavorites) {
          try {
            const parsed = JSON.parse(savedFavorites);
            // Ensure price is valid
            const processedFavorites = parsed.map(item => ({
              ...item,
              price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '3999')
            }));
            setFavorites(processedFavorites);
          } catch (error) {
            console.error('Failed to parse favorites from localStorage', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, []);

  // Save favorites to localStorage when it changes (as backup and for non-authenticated users)
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('handixFavorites', JSON.stringify(favorites));
    }
  }, [favorites, loading]);

  // Check if product is in favorites
  const isFavorite = (productId) => {
    if (!productId || !favorites || !Array.isArray(favorites)) return false;
    return favorites.some(item => item.id === productId);
  };

  // Add item to favorites
  const addToFavorites = async (product) => {
    if (!product || !product.id) {
      console.error('Invalid product object:', product);
      return;
    }
    
    // Ensure product has a valid price before adding to favorites
    const normalizedProduct = {
      ...product,
      price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '3999')
    };
    
    try {
      if (isAuthenticated()) {
        // Add to API favorites
        const userId = getUserId();
        await axios.post(`${API_BASE_URL}/favorites/${userId}`, {
          productId: normalizedProduct.id
        });
        
        // Refresh favorites from API
        const response = await axios.get(`${API_BASE_URL}/favorites/${userId}`);
        setFavorites(response.data);
      } else {
        // Add to local favorites
        if (!isFavorite(normalizedProduct.id)) {
          setFavorites(current => [...current, normalizedProduct]);
        }
      }

      toast({
        title: "Added to favorites",
        description: `${normalizedProduct.name} has been added to your favorites`,
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        variant: "destructive",
        title: "Failed to add to favorites",
        description: "There was a problem adding this item to your favorites.",
      });
    }
  };

  // Remove item from favorites
  const removeFromFavorites = async (productId) => {
    if (!productId) {
      console.error('Invalid product ID');
      return;
    }
    
    try {
      if (isAuthenticated()) {
        // Remove from API favorites
        const userId = getUserId();
        await axios.delete(`${API_BASE_URL}/favorites/${userId}/${productId}`);
      }
      
      // Always update local state
      setFavorites(current => current.filter(item => item.id !== productId));

      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites",
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        variant: "destructive",
        title: "Failed to remove from favorites",
        description: "There was a problem removing this item from your favorites.",
      });
    }
  };

  // Toggle favorite status
  const toggleFavorite = (product) => {
    if (!product || !product.id) {
      console.error('Invalid product object for toggle:', product);
      return;
    }
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  // Add a clearFavorites function
  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('handixFavorites');
  };

  return (
    <FavoriteContext.Provider value={{
      favorites,
      isFavorite,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      clearFavorites, // Add this to the context value
      loading,
      error
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    // Return a default implementation when used outside provider
    return {
      favorites: [],
      isFavorite: () => false,
      addToFavorites: () => console.warn('FavoriteContext not available'),
      removeFromFavorites: () => console.warn('FavoriteContext not available'),
      toggleFavorite: () => console.warn('FavoriteContext not available'),
      clearFavorites: () => console.warn('FavoriteContext not available'), // Add this to the default implementation
      loading: false,
      error: null
    };
  }
  return context;
};
