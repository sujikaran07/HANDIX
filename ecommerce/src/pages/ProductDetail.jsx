import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronRight, Minus, Plus, Check, ShoppingCart } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../data/products';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
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
  const { addItem } = useCart();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const products = await fetchProducts();
        setAllProducts(products);
        
        if (id) {
          const foundProduct = products.find(p => p.id === id);
          
          if (foundProduct) {
            setProduct(foundProduct);
            setSelectedImage(foundProduct.images[0]);
            setIsCustomizing(false); // Reset customization state
            
            // Set default size if available
            if (foundProduct.sizes && foundProduct.sizes.length > 0) {
              setSelectedSize(foundProduct.sizes[0]);
            } else {
              setSelectedSize('');
            }
            
            // Find related products (same category, but not this product)
            const related = products.filter(p => 
              p.category === foundProduct.category && 
              p.id !== foundProduct.id
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
  
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const toggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
    if (!isCustomizing) {
      setCustomization('');
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity, isCustomizing ? customization : undefined);
    }
  };
  
  if (loading) {
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
          {/* Breadcrumb */}
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
            {/* Product Images - Larger Size */}
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
            
            {/* Product Info */}
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
                      className={`${star <= product.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>
              
              <p className="text-xl font-bold mb-4 text-primary">
                {product.currency} {product.price.toLocaleString()}
                {isCustomizing && product.customizationFee && (
                  <span className="text-sm text-gray-500 ml-2">
                    + {product.currency} {product.customizationFee.toLocaleString()} (customization fee)
                  </span>
                )}
              </p>
              
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              {/* Size Selection (only for Clothing) */}
              {product.category === 'Clothing' && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`border rounded-md py-2 px-4 min-w-[64px] transition ${
                          selectedSize === size 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Customization Option (only for Artistry) */}
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
              
              {/* Quantity Selector */}
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
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="border-t border-b border-gray-300 p-2 w-16 text-center focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="border border-gray-300 rounded-r-md p-2 hover:bg-gray-50"
                    disabled={quantity >= 10}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-3 px-6 rounded-md mb-4 flex items-center justify-center ${
                  product.inStock 
                    ? 'bg-primary text-white hover:bg-primary-hover' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} className="mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              {/* Additional Info */}
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
          
          {/* Product Reviews */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {product.reviewCount > 0 ? (
                [1, 2].map(i => (
                  <div key={i} className="border rounded-lg p-5">
                    <div className="flex items-center mb-2">
                      <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">Customer Name</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star 
                              key={index}
                              size={14} 
                              className={`${
                                index < Math.floor(product.rating) 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      This product exceeded my expectations. The craftsmanship is outstanding and it arrived quickly. I'll definitely be ordering more items from Handix.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
          
          {/* Related Products */}
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