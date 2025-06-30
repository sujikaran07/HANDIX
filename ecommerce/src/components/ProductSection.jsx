import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductSection = ({ title, products, viewAllLink, bgColor = 'bg-white' }) => {
  return (
    <section className={`py-16 ${bgColor} w-full`}>
      <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
              View All <ArrowRight size={16} />
            </Link>
          )}
        </div>
        
        {/* Product grid: 4 per row on md+ screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
