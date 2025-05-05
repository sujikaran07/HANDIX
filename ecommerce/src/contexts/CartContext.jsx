import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const CartContext = createContext(undefined);
const API_BASE_URL = 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [customizationTotal, setCustomizationTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
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

  // Load cart: from API if authenticated, otherwise from localStorage
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated()) {
          // Load cart from API
          const userId = getUserId();
          const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
          
          if (response.data) {
            setItems(response.data.items || []);
            setItemCount(response.data.itemCount || 0);
            setSubtotal(response.data.subtotal || 0);
            setCustomizationTotal(response.data.customizationTotal || 0);
            setTotal(response.data.total || 0);
          }
        } else {
          // Load cart from localStorage
          const savedCart = localStorage.getItem('handixCart');
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              setItems(parsedCart);
              
              // Calculate totals for local cart
              const count = parsedCart.reduce((sum, item) => sum + item.quantity, 0);
              const sub = parsedCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
              const customTotal = parsedCart.reduce((sum, item) => 
                sum + (item.customization && item.product.customizationFee ? 
                  item.product.customizationFee * item.quantity : 0), 0);
              
              setItemCount(count);
              setSubtotal(sub);
              setCustomizationTotal(customTotal);
              setTotal(sub + customTotal);
            } catch (error) {
              console.error('Failed to parse cart from localStorage', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setError('Failed to load your shopping cart');
        
        // Fallback to localStorage if API fails
        const savedCart = localStorage.getItem('handixCart');
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Failed to parse cart from localStorage', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  // Save cart to localStorage when it changes (as backup and for non-authenticated users)
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('handixCart', JSON.stringify(items));
    }
  }, [items, loading]);

  // Add item to cart
  const addItem = async (product, quantity, customization) => {
    try {
      // Calculate the total unit price (base price + customization fee if applicable)
      const basePrice = product.price || 0;
      const customizationFee = (customization && product.customizationFee) ? product.customizationFee : 0;
      const totalPrice = product.finalPrice || basePrice + customizationFee;
      
      // Check if quantity exceeds available inventory
      const maxAvailable = product.quantity || 999;
      const safeQuantity = Math.min(quantity, maxAvailable);
      
      console.log("Adding to cart with price breakdown:", {
        productId: product.id,
        name: product.name,
        quantity: safeQuantity,
        basePrice,
        customizationFee,
        totalPrice,
        hasCustomization: !!customization
      });
      
      if (isAuthenticated()) {
        // Add item to API cart with the total price
        const userId = getUserId();
        const response = await axios.post(`${API_BASE_URL}/cart/${userId}/items`, {
          productId: product.id,
          quantity: safeQuantity,
          customization,
          price: totalPrice // Send the total price including customization fee
        });
        
        console.log("API response:", response.data);
        
        // Refresh cart from API after adding item
        const cartResponse = await axios.get(`${API_BASE_URL}/cart/${userId}`);
        if (cartResponse.data) {
          setItems(cartResponse.data.items || []);
          setItemCount(cartResponse.data.itemCount || 0);
          setSubtotal(cartResponse.data.subtotal || 0);
          setCustomizationTotal(cartResponse.data.customizationTotal || 0);
          setTotal(cartResponse.data.total || 0);
        }
      } else {
        // Add item to local cart
        setItems(currentItems => {
          const existingItemIndex = currentItems.findIndex(item => 
            item.product.id === product.id && 
            item.customization === customization
          );

          let newItems;
          if (existingItemIndex > -1) {
            // Update existing item, respecting inventory limits
            newItems = [...currentItems];
            const currentQty = newItems[existingItemIndex].quantity;
            const newQty = Math.min(currentQty + safeQuantity, maxAvailable);
            newItems[existingItemIndex].quantity = newQty;
          } else {
            // Create a new product object with the customization fee info embedded
            const productWithPricing = {
              ...product,
              price: totalPrice, // Use the total price including customization
              basePrice: basePrice, // Store the original base price separately
              customizationApplied: !!customization
            };
            
            // Add new item
            newItems = [...currentItems, { 
              product: productWithPricing, 
              quantity: safeQuantity, 
              customization
            }];
          }
          
          // Update counts and totals
          const count = newItems.reduce((sum, item) => sum + item.quantity, 0);
          // Calculate subtotal based on the stored total price
          const sub = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          // Calculate customization fee separately for display purposes
          const customTotal = newItems.reduce((sum, item) => 
            sum + (item.customization && item.product.customizationFee ? 
              item.product.customizationFee * item.quantity : 0), 0);
          
          setItemCount(count);
          setSubtotal(sub);
          setCustomizationTotal(customTotal);
          setTotal(sub); // The total now includes customization fees
          
          return newItems;
        });
      }

      toast({
        title: "Item added to cart",
        description: `${product.name} x ${safeQuantity} added to your cart`,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        variant: "destructive",
        title: "Failed to add item",
        description: "There was a problem adding this item to your cart.",
      });
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      if (isAuthenticated()) {
        // Remove item from API cart
        const userId = getUserId();
        await axios.delete(`${API_BASE_URL}/cart/${userId}/items/${itemId}`);
        
        // Refresh cart from API after removing item
        const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
        if (response.data) {
          setItems(response.data.items || []);
          setItemCount(response.data.itemCount || 0);
          setSubtotal(response.data.subtotal || 0);
          setCustomizationTotal(response.data.customizationTotal || 0);
          setTotal(response.data.total || 0);
        }
      } else {
        // Remove item from local cart
        setItems(currentItems => {
          const newItems = currentItems.filter(item => 
            item.product.id !== itemId
          );
          
          // Update counts and totals
          const count = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const sub = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          const customTotal = newItems.reduce((sum, item) => 
            sum + (item.customization && item.product.customizationFee ? 
              item.product.customizationFee * item.quantity : 0), 0);
          
          setItemCount(count);
          setSubtotal(sub);
          setCustomizationTotal(customTotal);
          setTotal(sub + customTotal);
          
          return newItems;
        });
      }

      toast({
        title: "Item removed",
        description: "Item removed from your cart",
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast({
        variant: "destructive",
        title: "Failed to remove item",
        description: "There was a problem removing this item from your cart.",
      });
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      // Find the item to get its product info
      const item = items.find(i => (i.itemId || i.product.id) === itemId);
      if (!item) return;
      
      // Get max available quantity
      const maxAvailable = item.product.quantity || 999; // Changed from 10 to 999
      const safeQuantity = Math.min(quantity, maxAvailable);
      
      if (isAuthenticated()) {
        // Update item in API cart
        const userId = getUserId();
        await axios.patch(`${API_BASE_URL}/cart/${userId}/items/${itemId}`, {
          quantity: safeQuantity
        });
        
        // Refresh cart from API after updating item
        const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
        if (response.data) {
          setItems(response.data.items || []);
          setItemCount(response.data.itemCount || 0);
          setSubtotal(response.data.subtotal || 0);
          setCustomizationTotal(response.data.customizationTotal || 0);
          setTotal(response.data.total || 0);
        }
      } else {
        // Update item in local cart
        setItems(currentItems => {
          const newItems = currentItems.map(item => 
            (item.itemId || item.product.id) === itemId ? 
            { ...item, quantity: safeQuantity } : item
          );
          
          // Update counts and totals
          const count = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const sub = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          const customTotal = newItems.reduce((sum, item) => 
            sum + (item.customization && item.product.customizationFee ? 
              item.product.customizationFee * item.quantity : 0), 0);
          
          setItemCount(count);
          setSubtotal(sub);
          setCustomizationTotal(customTotal);
          setTotal(sub + customTotal);
          
          return newItems;
        });
      }
      
      // If quantity was adjusted, show message
      if (safeQuantity !== quantity) {
        toast({
          title: "Quantity adjusted",
          description: "Maximum available quantity has been applied",
        });
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      toast({
        variant: "destructive",
        title: "Failed to update quantity",
        description: "There was a problem updating the quantity.",
      });
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (isAuthenticated()) {
        // Clear API cart
        const userId = getUserId();
        await axios.delete(`${API_BASE_URL}/cart/${userId}`);
      }
      
      // Clear local state regardless
      setItems([]);
      setItemCount(0);
      setSubtotal(0);
      setCustomizationTotal(0);
      setTotal(0);
      
      // Clear localStorage
      localStorage.removeItem('handixCart');
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        variant: "destructive",
        title: "Failed to clear cart",
        description: "There was a problem clearing your cart.",
      });
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      customizationTotal,
      total,
      loading,
      error
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
