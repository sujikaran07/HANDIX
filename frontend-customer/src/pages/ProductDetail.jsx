import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaArrowLeft, FaStore, FaTag } from 'react-icons/fa';
import { products, categories } from '../data/products';
import '../styles/ProductDetail.css';

const ProductDetail = ({ addToCart, userType }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const isWholesale = userType === 'wholesale';

  useEffect(() => {
    const productId = parseInt(id);
    const foundProduct = products.find(p => p.id === productId);

    if (foundProduct) {
      setProduct(foundProduct);

      const related = products
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 4);

      setRelatedProducts(related);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getPrice = () => {
    if (!product) return 0;
    return isWholesale ? (product.wholesale_price || Math.round(product.price * 0.8)) : product.price;
  };

  const getDiscountPercentage = () => {
    if (!product || !isWholesale) return 0;
    const wholesalePrice = product.wholesale_price || Math.round(product.price * 0.8);
    return Math.round((1 - (wholesalePrice / product.price)) * 100);
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading product details...</p>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category);

  return (
    <div className="product-detail-container">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/products/${product.category}`} className="breadcrumb-link">
            {category?.name || product.category}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        <Link to="/products" className="back-button">
          <FaArrowLeft className="back-icon" />
          Back to Products
        </Link>

        <div className="product-grid">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            {product.tamil_name && <p className="product-subtitle">{product.tamil_name}</p>}
            <div className="rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => <FaStar key={i} />)}
              </div>
              <span className="rating-count">(12 reviews)</span>
            </div>

            <div className="price-section">
              {isWholesale ? (
                <div>
                  <div className="flex items-center">
                    <span className="price">{`LKR ${getPrice().toLocaleString()}`}</span>
                    <span className="original-price">{`LKR ${product.price.toLocaleString()}`}</span>
                    <span className="discount-badge">{`Save ${getDiscountPercentage()}%`}</span>
                  </div>
                  <div className="wholesale-tag">
                    <FaStore className="mr-2" />
                    <span>Wholesale Price</span>
                  </div>
                  <div className="bulk-info">Minimum order: 5 units | Bulk pricing available</div>
                </div>
              ) : (
                <div className="price">{`LKR ${product.price.toLocaleString()}`}</div>
              )}
            </div>

            <div className="description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="category">
              <h3>Category</h3>
              <Link to={`/products/${product.category}`} className="category-tag">
                {category?.name || product.category}
              </Link>
              {category?.tamil_name && <span className="category-tamil">({category.tamil_name})</span>}
            </div>

            <div className="quantity-selector">
              <h3>Quantity</h3>
              <div className="quantity-control">
                <button onClick={decrementQuantity} className="quantity-button">-</button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantity-input"
                />
                <button onClick={incrementQuantity} className="quantity-button">+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="add-to-cart-button">
              <FaShoppingCart className="cart-icon" />
              Add to Cart
            </button>

            <div className="additional-info">
              <div className="info-grid">
                <div className="info-item">
                  <h4>Handmade with care</h4>
                  <p>Each item is uniquely crafted by skilled artisans from Sri Lanka</p>
                </div>
                <div className="info-item">
                  <h4>Fast Shipping</h4>
                  <p>Orders ship within 2-3 business days</p>
                </div>
              </div>
            </div>

            {!isWholesale && (
              <div className="wholesale-info">
                <div className="wholesale-content">
                  <FaTag className="wholesale-icon" />
                  <div className="wholesale-text">
                    <h4>Wholesale Available</h4>
                    <p>Are you a business owner? Register for a wholesale account to access bulk pricing.</p>
                    <Link to="/register" className="wholesale-link">Learn More About Wholesale</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-grid">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="related-card">
                  <Link to={`/product/${relatedProduct.id}`}>
                    <div className="related-image">
                      <img src={relatedProduct.image} alt={relatedProduct.name} />
                    </div>
                    <div className="related-content">
                      <h3 className="related-title">{relatedProduct.name}</h3>
                      <div className="related-price">
                        {isWholesale ? (
                          <div>
                            <span className="wholesale-price">{`LKR ${(relatedProduct.wholesale_price || Math.round(relatedProduct.price * 0.8)).toLocaleString()}`}</span>
                            <span className="retail-price">{`LKR ${relatedProduct.price.toLocaleString()}`}</span>
                          </div>
                        ) : (
                          <span className="price">{`LKR ${relatedProduct.price.toLocaleString()}`}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;