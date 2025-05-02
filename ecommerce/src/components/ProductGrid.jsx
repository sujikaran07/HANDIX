import React from 'react';
import ProductCard from './ProductCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronUp } from 'lucide-react';

const ProductGrid = ({ products }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-1">No products found</h2>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset all filters
        </Button>
      </div>
    );
  }
  
  return (
    <div className="relative w-full px-1 sm:px-2 md:px-3 max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
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
