import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Minus, Plus, Check, ShoppingCart } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchProductById } from '../data/products';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage = () => {
  // State for product details, images, cart, etc.
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [customization, setCustomization] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariation, setSelectedVariation] = useState(null);
  const { addItem } = useCart();
  
  // Get max available quantity for selected variation or product
  const getMaxAvailableQuantity = () => {
    if (selectedVariation && selectedVariation.stockLevel !== undefined) {
      return selectedVariation.stockLevel;
    }
    return product ? product.quantity : 0;
  };

  // Load product and related products on mount or id change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const allProducts = await fetchProducts();
        setAllProducts(allProducts);
        
        if (id) {
          const productDetails = await fetchProductById(id);
          
          if (productDetails) {
            console.log("CRITICAL DEBUG - Product data:", {
              id: productDetails.id,
              name: productDetails.name,
              category: productDetails.category,
              variations: productDetails.variations.map(v => ({
                id: v.id,
                size: v.size,
                stock: v.stockLevel
              }))
            });
            
            setProduct(productDetails);
            setSelectedImage(productDetails.images[0]);
            setIsCustomizing(false);
            
            if (productDetails.variations && productDetails.variations.length > 0) {
              setSelectedSize(productDetails.variations[0].size);
              setSelectedVariation(productDetails.variations[0]);
            } else {
              setSelectedSize('');
              setSelectedVariation(null);
            }
            
            const related = allProducts.filter(p => 
              p.category === productDetails.category && 
              p.id !== productDetails.id
            ).slice(0, 4);
            
            setRelatedProducts(related);
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Handle quantity change
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const maxAvailable = getMaxAvailableQuantity();
    
    if (newQuantity >= 1 && newQuantity <= maxAvailable) {
      setQuantity(newQuantity);
    }
  };
  
  // Adjust quantity if variation changes
  useEffect(() => {
    const maxAvailable = getMaxAvailableQuantity();
    if (quantity > maxAvailable) {
      setQuantity(maxAvailable > 0 ? maxAvailable : 1);
    }
  }, [selectedVariation]);

  // Toggle customization UI
  const toggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
    if (!isCustomizing) {
      setCustomization('');
    }
  };
  
  // Handle size/variation change
  const handleSizeChange = (size, variation) => {
    setSelectedSize(size);
    setSelectedVariation(variation);
    
    if (variation && variation.stockLevel < quantity) {
      setQuantity(variation.stockLevel > 0 ? variation.stockLevel : 1);
    }
  };
  
  // Check authentication status
  const isLoggedIn = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };

  // Add product to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if user is logged in before adding to cart
    if (!isLoggedIn()) {
      navigate('/login', { 
        state: { 
          from: `/products/${id}`, 
          message: 'Please login to add items to cart' 
        } 
      });
      return;
    }
    
    // Create a modified product object with the calculated final price
    const itemToAdd = {
      ...product,
      id: product.id,
      // Add the final price INCLUDING customization fee if applicable
      finalPrice: calculateFinalPrice()
    };
    
    // Pass customization only if customizing is enabled
    const customizationText = isCustomizing ? customization : undefined;
    
    console.log("Adding to cart with customization:", {
      product: product.name,
      isCustomizing,
      customizationText,
      basePrice: product.price,
      customizationFee: isCustomizing ? product.customizationFee : 0,
      finalPrice: calculateFinalPrice(),
      quantity,
      maxAvailable: getMaxAvailableQuantity()
    });
    
    // Only allow adding to cart if there's inventory available
    if (getMaxAvailableQuantity() > 0) {
      addItem(itemToAdd, quantity, customizationText);
    }
  };
  
  // Calculate final price with customization/variation
  const calculateFinalPrice = () => {
    if (!product) return 0;
    
    let finalPrice = product.price;
    
    if (selectedVariation && selectedVariation.additionalPrice) {
      finalPrice += selectedVariation.additionalPrice;
    }
    
    if (isCustomizing && product.customizationFee) {
      finalPrice += product.customizationFee;
    }
    
    return finalPrice;
  };
  
  if (loading) {
    // Show loading spinner
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    // Show error message
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] py-16 text-center">
          <p className="text-xl">{error || "Product not found"}</p>
          <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
            Return to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="flex items-center mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/products" className="hover:text-primary">Shop</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">
              {product.category}
            </Link>
            <ChevronRight size={14} className="mx-2" />
            <span>{product.name}</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="max-w-lg mx-auto w-full">
              <div className="mb-4 aspect-square overflow-hidden rounded-lg shadow-sm max-h-[420px]">
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map(image => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`border rounded-md overflow-hidden h-20 transition ${
                      selectedImage === image ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="mb-2 flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <span className="ml-2 text-sm text-gray-500">{product.category}</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star}
                      size={16} 
                      className={`${star <= Math.round(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-500">
                  {product.rating > 0 ? `${product.rating.toFixed(1)} (${product.reviewCount} reviews)` : '(No reviews yet)'}
                </span>
              </div>
              
              <p className="text-xl font-bold mb-4 text-primary">
                {product.currency} {calculateFinalPrice().toLocaleString()}
                {selectedVariation && selectedVariation.additionalPrice > 0 && (
                  <span className="text-sm text-gray-600 ml-2">
                    (Includes {product.currency} {selectedVariation.additionalPrice.toLocaleString()} for {selectedVariation.size})
                  </span>
                )}
                {isCustomizing && product.customizationFee > 0 && (
                  <div className="text-sm text-gray-600">
                    + {product.currency} {product.customizationFee.toLocaleString()} (customization fee)
                  </div>
                )}
              </p>
              
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="mb-6">
                {product.variations && product.variations.length > 0 && (
                  <>
                    <h3 className="font-medium mb-2">Select Option</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variations
                        .filter(v => v.stockLevel > 0)
                        .map(variation => (
                          <button
                            key={variation.id}
                            onClick={() => handleSizeChange(variation.size, variation)}
                            className={`border rounded-md py-2 px-4 transition ${
                              selectedSize === variation.size 
                                ? 'border-primary bg-primary text-white' 
                                : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {variation.size === 'N/A' ? 'One Size' : variation.size}
                            {variation.additionalPrice > 0 && 
                              ` (+${product.currency} ${variation.additionalPrice.toLocaleString()})`}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
              
              {product.category === 'Artistry' && product.isCustomizable && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="customization"
                      checked={isCustomizing}
                      onChange={toggleCustomization}
                      className="mr-2 accent-primary h-5 w-5"
                    />
                    <label htmlFor="customization" className="font-medium text-blue-800">
                      Make it Custom 
                      <span className="text-gray-500 ml-2">
                        (+{product.currency} {product.customizationFee?.toLocaleString()})
                      </span>
                    </label>
                  </div>
                  {isCustomizing && (
                    <div className="mt-2">
                      <label className="block text-sm text-gray-600 mb-1">Tell us how you want it customized:</label>
                      <textarea
                        value={customization}
                        onChange={(e) => setCustomization(e.target.value)}
                        placeholder="Describe your customization requirements..."
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="border border-gray-300 rounded-l-md p-2 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={getMaxAvailableQuantity()}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const maxAvailable = getMaxAvailableQuantity();
                      if (val >= 1 && val <= maxAvailable) {
                        setQuantity(val);
                      }
                    }}
                    className="border-t border-b border-gray-300 p-2 w-16 text-center focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="border border-gray-300 rounded-r-md p-2 hover:bg-gray-50"
                    disabled={quantity >= getMaxAvailableQuantity()}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {getMaxAvailableQuantity() <= 5 && getMaxAvailableQuantity() > 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    Only {getMaxAvailableQuantity()} {getMaxAvailableQuantity() === 1 ? 'item' : 'items'} left in stock
                  </p>
                )}
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || getMaxAvailableQuantity() < 1}
                className={`w-full py-3 px-6 rounded-md mb-4 flex items-center justify-center ${
                  (product.inStock && getMaxAvailableQuantity() > 0)
                    ? 'bg-primary text-white hover:bg-primary-hover' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} className="mr-2" />
                {getMaxAvailableQuantity() > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <div className="border-t pt-4 text-sm text-gray-500">
                <p className="flex items-center mb-2">
                  <Check size={16} className="mr-2 text-green-500" />
                  Handcrafted by local artisans
                </p>
                <p className="flex items-center mb-2">
                  <Check size={16} className="mr-2 text-green-500" />
                  Premium quality materials
                </p>
                <p className="flex items-center">
                  <Check size={16} className="mr-2 text-green-500" />
                  Supports local communities
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {product.reviewCount > 0 && product.reviews && product.reviews.length > 0 ? (
                // Display only top 3 reviews if available - sort by highest rating first
                product.reviews
                  .slice()
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 3)
                  .map((review) => (
                    <div key={review.id} className="border rounded-lg p-5">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                          {review.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{review.customer}</p>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star 
                                key={index}
                                size={14} 
                                className={`${
                                  index < Math.floor(review.rating) 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.review}</p>
                      
                      {/* Show review images if available */}
                      {review.images && review.images.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                          {review.images.map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`Review ${idx+1}`}
                              className="h-16 w-16 object-cover rounded-md"
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Show artisan response if available */}
                      {review.response && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="font-medium text-sm text-gray-700">Artisan Response:</p>
                          <p className="text-gray-600 text-sm mt-1">{review.response}</p>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
            
            {/* Show "View All Reviews" button if there are more than 3 reviews */}
            {product.reviewCount > 3 && (
              <div className="text-center mt-6">
                <Link 
                  to={`/products/${product.id}/reviews`} 
                  className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  View all {product.reviewCount} reviews
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage;