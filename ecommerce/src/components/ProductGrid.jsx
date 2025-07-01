import React from 'react';
import ProductCard from './ProductCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronUp } from 'lucide-react';

const ProductGrid = ({ products, onRemove, showRemoveButton = false }) => {
  // Scroll page to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Show message if no products
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No products found.
      </div>
    );
  }
  
  return (
    <div className="relative w-full px-1 sm:px-2 md:px-3 max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {products.map(product => {
          // Ensure product has required properties and correct types
          const formattedProduct = {
            ...product,
            id: product.id,
            name: product.name || 'Product',
            price: typeof product.price === 'number' ? product.price : 
                   parseFloat(product.price || '0'),
            images: Array.isArray(product.images) ? product.images : ['/images/placeholder.png'],
            inStock: product.inStock !== false,
            quantity: product.quantity || 999
          };

          return (
            <ProductCard 
              key={formattedProduct.id} 
              product={formattedProduct} 
              onRemove={showRemoveButton ? () => onRemove(formattedProduct.id) : undefined}
              showRemoveButton={showRemoveButton}
            />
          );
        })}
      </div>
      
      {/* Floating back-to-top button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button 
          onClick={scrollToTop}
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg hover:shadow-xl"
        >
          <ChevronUp className="h-5 w-5" />
          <span className="sr-only">Back to top</span>
        </Button>
      </div>
    </div>
  );
};

export default ProductGrid;
