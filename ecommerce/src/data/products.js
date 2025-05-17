import axios from 'axios';

export const fetchProducts = async () => {
  try {
    console.log('Fetching products from API...');
    
    const response = await axios.get('http://localhost:5000/api/inventory/public');
    
    console.log('API Response status:', response.status);
    
    if (!response.data || !response.data.inventory || !Array.isArray(response.data.inventory)) {
      console.error('Invalid API response structure:', JSON.stringify(response.data));
      
      console.log('Returning dummy products for testing');
      return [
        {
          id: 'TEST001',
          name: 'Test Product 1',
          description: 'This is a test product',
          price: 2500,
          currency: 'LKR',
          images: ['https://placehold.co/600x400?text=Test+Product'],
          category: 'Accessories',
          inStock: true,
          isCustomizable: false,
          quantity: 5
        },
        {
          id: 'TEST002',
          name: 'Test Product 2',
          description: 'This is another test product',
          price: 3500,
          currency: 'LKR',
          images: ['https://placehold.co/600x400?text=Product+2'],
          category: 'Crafts',
          inStock: true,
          isCustomizable: true,
          quantity: 3
        }
      ];
    }
    
    if (response.data.inventory.length === 0) {
      console.log('No products returned from API');
      return [];
    }
    
    const products = response.data.inventory.map(item => {
      try {
        const quantity = parseInt(item.quantity || 0);
        
        // Check if product is disabled, and if so, treat as "Out of Stock"
        const isDisabled = item.product_status === 'Disabled';
        const effectiveQuantity = isDisabled ? 0 : quantity;
        const effectiveInStock = !isDisabled && effectiveQuantity > 0;
        const effectiveStatus = isDisabled ? 'Out of Stock' : (effectiveQuantity > 0 ? 'In Stock' : 'Out of Stock');
        
        // Log disabled products for debugging
        if (isDisabled) {
          console.log(`Product ${item.product_id} is disabled, showing as Out of Stock`);
        }
        
        const product = {
          id: item.product_id,
          name: item.product_name || 'Unnamed Product',
          description: item.description || '',
          price: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price || 0),
          currency: 'LKR',
          images: item.images && item.images.length > 0 ? 
            item.images : 
            (item.default_image_url ? [item.default_image_url] : ['https://placehold.co/600x400?text=No+Image']),
          category: item.category?.category_name || 'Uncategorized',
          inStock: effectiveInStock,
          stockStatus: effectiveStatus,
          isCustomizable: Boolean(item.customization_available),
          quantity: effectiveQuantity
        };
        
        if (item.variations && Array.isArray(item.variations) && item.variations.length > 0) {
          console.log(`Processing variations for ${item.product_id}:`, item.variations);
          
          const validVariations = item.variations.filter(v => 
            v && v.size && parseInt(v.stock_level || 0) > 0
          );
          
          console.log(`Valid variations with stock for ${item.product_id}:`, validVariations);
          
          product.variations = validVariations.map(variation => ({
            id: variation.variation_id,
            size: variation.size,
            additionalPrice: parseFloat(variation.additional_price || 0),
            stockLevel: parseInt(variation.stock_level || 0),
            inStock: true
          }));

          if (product.variations.length === 0) {
            console.log(`Product ${product.id} has variations but none with stock`);
            product.inStock = quantity > 0;
          } else {
            product.inStock = true;
          }

          // If product is disabled, also mark all variations as out of stock
          if (isDisabled) {
            product.variations = product.variations.map(v => ({
              ...v,
              inStock: false
            }));
            product.inStock = false;
          }
        } else {
          product.variations = [];
          product.inStock = effectiveInStock;
        }

        if (product.category === 'Artistry') {
          product.customizationFee = 500;
          
          if (product.variations.length > 0) {
            product.hasAdditionalPriceOptions = true;
          }
        }
        
        if (item.rating !== undefined && item.rating !== null) {
          product.rating = parseFloat(item.rating);
          product.reviewCount = parseInt(item.review_count || 0);
        }
        
        return product;
      } catch (err) {
        console.error('Error mapping product item:', err, item);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`Successfully mapped ${products.length} products`);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [
      {
        id: 'ERR001',
        name: 'Error Fallback Product',
        description: 'This product is shown when API fails',
        price: 1500,
        currency: 'LKR',
        images: ['https://placehold.co/600x400?text=API+Error'],
        category: 'Accessories',
        inStock: true,
        isCustomizable: false,
        quantity: 5
      }
    ];
  }
};

export const fetchProductById = async (productId) => {
  try {
    console.log(`Fetching product details for ID: ${productId}`);
    
    let customizationFee = null;
    try {
      const feeResponse = await axios.get(`http://localhost:5000/api/variations/${productId}/customization-fee`);
      if (feeResponse.data && feeResponse.data.fee !== undefined) {
        customizationFee = parseFloat(feeResponse.data.fee);
        console.log(`Successfully fetched customization fee for ${productId}: ${customizationFee}`);
      }
    } catch (feeError) {
      console.error(`Error fetching customization fee for ${productId}:`, feeError);
    }
    
    const response = await axios.get('http://localhost:5000/api/inventory/public');
    
    if (!response.data || !response.data.inventory || !Array.isArray(response.data.inventory)) {
      console.error('Invalid API response structure:', JSON.stringify(response.data));
      return null;
    }
    
    const item = response.data.inventory.find(product => product.product_id === productId);
    
    if (!item) {
      console.error(`Product with ID ${productId} not found in inventory`);
      return null;
    }
    
    console.log(`Found product data:`, item);
    
    const quantity = parseInt(item.quantity || 0);
    
    // Check if product is disabled, and if so, treat as "Out of Stock"
    const isDisabled = item.product_status === 'Disabled';
    const effectiveQuantity = isDisabled ? 0 : quantity;
    const effectiveInStock = !isDisabled && effectiveQuantity > 0;
    const effectiveStatus = isDisabled ? 'Out of Stock' : (effectiveQuantity > 0 ? 'In Stock' : 'Out of Stock');
    
    const product = {
      id: item.product_id,
      name: item.product_name || 'Unnamed Product',
      description: item.description || '',
      price: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price || 0),
      currency: 'LKR',
      images: item.images && item.images.length > 0 ? 
        item.images : 
        (item.default_image_url ? [item.default_image_url] : ['https://placehold.co/600x400?text=No+Image']),
      category: item.category?.category_name || 'Uncategorized',
      inStock: effectiveInStock,
      stockStatus: effectiveStatus,
      isCustomizable: Boolean(item.customization_available),
      quantity: effectiveQuantity,
      rating: 0,         // Initialize with 0 instead of parsed value
      reviewCount: 0     // Initialize with 0 instead of parsed value
    };
    
    if (item.variations && Array.isArray(item.variations)) {
      console.log(`DEBUG: Raw variations for ${productId}:`, JSON.stringify(item.variations));
      
      if (customizationFee === null && item.category?.category_name === 'Artistry') {
        let highestAddPrice = 0;
        item.variations.forEach(variation => {
          const addPrice = parseFloat(variation.additional_price || 0);
          if (addPrice > highestAddPrice) {
            highestAddPrice = addPrice;
          }
        });
        customizationFee = highestAddPrice;
        console.log(`Extracted customization fee from variations: ${customizationFee}`);
      }
      
      product.allVariations = item.variations.map(variation => {
        const stockLevel = parseInt(variation.stock_level || 0);
        return {
          id: variation.variation_id,
          size: variation.size,
          additionalPrice: parseFloat(variation.additional_price || 0),
          stockLevel: stockLevel,
          inStock: stockLevel > 0
        };
      });
      
      product.variations = product.allVariations.filter(v => v.stockLevel > 0);
      
      const anyVariationInStock = product.variations.some(v => v.stockLevel > 0);
      if (!anyVariationInStock) {
        product.inStock = false;
        product.stockStatus = 'Out of Stock';
      }

      // If product is disabled, also mark all variations as out of stock
      if (isDisabled) {
        product.allVariations = product.allVariations.map(v => ({
          ...v,
          inStock: false
        }));
        product.variations = product.variations.map(v => ({
          ...v, 
          inStock: false
        }));
        product.inStock = false;
        product.stockStatus = 'Out of Stock';
      }
    } else {
      console.log(`No variations found for product ${productId}`);
      product.variations = [];
    }
    
    if (product.category === 'Artistry') {
      if (customizationFee !== null) {
        product.customizationFee = customizationFee;
        console.log(`Setting customization fee for ${productId} to ${customizationFee}`);
      }
      
      if (product.variations && product.variations.length > 0) {
        product.hasAdditionalPriceOptions = true;
      }
    }
    
    // Fetch approved reviews for this product
    try {
      const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/product?product_id=${productId}`);
      
      if (reviewsResponse.data) {
        // Replace the static rating values with the calculated ones from approved reviews
        product.reviews = reviewsResponse.data.reviews || [];
        product.rating = reviewsResponse.data.avgRating || 0;
        product.reviewCount = reviewsResponse.data.reviewCount || 0;
        
        console.log(`Loaded ${product.reviewCount} approved reviews with avg rating ${product.rating}`);
      }
    } catch (reviewError) {
      console.error('Failed to fetch product reviews:', reviewError);
      // If we fail to fetch reviews, use original values if available
      if (item.rating !== undefined && item.rating !== null) {
        product.rating = parseFloat(item.rating);
        product.reviewCount = parseInt(item.review_count || 0);
      }
    }
    
    console.log(`DEBUG: Final product details for ${productId}:`, {
      id: product.id,
      name: product.name,
      category: product.category,
      customizationFee: product.customizationFee,
      hasVariations: product.variations && product.variations.length > 0,
      variationsCount: product.variations ? product.variations.length : 0
    });
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const allProducts = await fetchProducts();
    if (!category) return allProducts;
    
    return allProducts.filter(product => 
      product.category && product.category.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    return [];
  }
};

export const products = [];

export const categories = [
  "Carry Goods",
  "Accessories",
  "Clothing",
  "Crafts",
  "Artistry"
];