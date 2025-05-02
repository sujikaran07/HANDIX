import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('handixCart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('handixCart', JSON.stringify(items));
  }, [items]);

  // Add item to cart
  const addItem = (product, quantity, customization) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => 
        item.product.id === product.id && item.customization === customization
      );

      let newItems;
      if (existingItemIndex > -1) {
        // Update existing item
        newItems = [...currentItems];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        newItems = [...currentItems, { product, quantity, customization }];
      }

      toast({
        title: "Item added to cart",
        description: `${product.name} x ${quantity} added to your cart`,
      });

      return newItems;
    });
  };

  // Remove item from cart
  const removeItem = (productId) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
  };

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );
  
  const customizationTotal = items.reduce((total, item) => 
    total + (item.customization && item.product.customizationFee ? 
      item.product.customizationFee * item.quantity : 0), 0
  );
  
  const total = subtotal + customizationTotal;

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
      total
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
