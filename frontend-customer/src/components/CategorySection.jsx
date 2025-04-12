
import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/products';
import '../styles/CategorySection.css'; 

const CategorySection = () => {
  return (
    <section className="category-section">
      <div className="container">
        <div className="text-center">
          <h2>Shop by Category</h2>
          <p>
            Explore our range of handcrafted products across different categories.
            Each item is made with care and designed to bring joy.
          </p>
        </div>

        <div className="grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products/${category.id}`}
              className="group"
            >
              <div className="category-card">
                <div className="h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="card-content">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div className="explore">
                    Explore
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;