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
          inStock: quantity > 0,
          stockStatus: quantity > 0 ? 'In Stock' : 'Out of Stock',
          isCustomizable: Boolean(item.customization_available),
          quantity: quantity
        };
        
        // Include variations if available
        if (item.variations && Array.isArray(item.variations) && item.variations.length > 0) {
          console.log(`Processing variations for ${item.product_id}:`, item.variations);
          
          // Filter out variations with no stock
          const validVariations = item.variations.filter(v => 
            v && v.size && parseInt(v.stock_level || 0) > 0
          );
          
          console.log(`Valid variations with stock for ${item.product_id}:`, validVariations);
          
          // When processing variations from the API response
          product.variations = validVariations.map(variation => ({
            id: variation.variation_id,
            size: variation.size,               // Each variation has a size field (could be "S", "M", "N/A", etc.)
            additionalPrice: parseFloat(variation.additional_price || 0),  // And can have an additional price
            stockLevel: parseInt(variation.stock_level || 0),
            inStock: true
          }));
          
          // For clothing products, check if we have real sizes or just N/A
          if (product.category === 'Clothing') {
            // Log all sizes for debugging
            const allSizes = product.variations.map(v => v.size);
            console.log(`All sizes for ${product.id}:`, allSizes);
            
            // Check if all variations are "N/A" or if we have actual sizes
            const nonNASizes = product.variations.filter(v => v.size !== 'N/A');
            
            if (nonNASizes.length > 0) {
              // We have actual sizes (XS, S, M, L, XL, etc.)
              product.hasSizeOptions = true;
              console.log(`Product ${product.id} has size options:`, nonNASizes.map(v => v.size));
            } else {
              // All variations are "N/A" - this is a one-size-fits-all product
              product.hasNoSizeOptions = true;
              console.log(`Product ${product.id} has no specific size options`);
            }
          }
          
          // Check if we have any valid variations with stock
          if (product.variations.length === 0) {
            console.log(`Product ${product.id} has variations but none with stock`);
            product.inStock = quantity > 0; // Fall back to main product stock
          } else {
            // At least one variation is in stock
            product.inStock = true;
          }
        } else {
          product.variations = [];
          // No variations at all
          if (product.category === 'Clothing') {
            product.hasNoSizeOptions = true; // Indicate it's a one-size clothing item
          }
          product.inStock = quantity > 0;
        }

        // Add customization fee based on category and variations
        if (product.category === 'Artistry') {
          product.customizationFee = 500; // Default fee
          
          // If we have variations with additional price
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

// Fixed: Combine both implementations of fetchProductById
export const fetchProductById = async (productId) => {
  try {
    console.log(`Fetching product details for ID: ${productId}`);
    
    // Instead of a dedicated endpoint, use the public inventory endpoint
    const response = await axios.get('http://localhost:5000/api/inventory/public');
    
    if (!response.data || !response.data.inventory || !Array.isArray(response.data.inventory)) {
      console.error('Invalid API response structure:', JSON.stringify(response.data));
      return null;
    }
    
    // Find the specific product in the inventory
    const item = response.data.inventory.find(product => product.product_id === productId);
    
    if (!item) {
      console.error(`Product with ID ${productId} not found in inventory`);
      return null;
    }
    
    console.log(`Found product data:`, item);
    
    // Map the product similar to fetchProducts but with special attention to variations
    const quantity = parseInt(item.quantity || 0);
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
      inStock: quantity > 0,
      stockStatus: quantity > 0 ? 'In Stock' : 'Out of Stock',
      isCustomizable: Boolean(item.customization_available),
      quantity: quantity,
      rating: parseFloat(item.rating || 0),
      reviewCount: parseInt(item.review_count || 0)
    };
    
    // Process variations with enhanced debugging 
    if (item.variations && Array.isArray(item.variations)) {
      // Log raw variations data for inspection
      console.log(`DEBUG: Raw variations for ${productId}:`, JSON.stringify(item.variations));
      
      // Store all variations including those with zero stock for debugging
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
      
      // Log all sizes from all variations, even those without stock
      console.log(`DEBUG: All sizes from all variations: ${product.allVariations.map(v => v.size).join(', ')}`);
      
      // Include only variations with stock in the response
      product.variations = product.allVariations.filter(v => v.stockLevel > 0);
      
      console.log(`DEBUG: Products with stock: ${product.variations.length}/${product.allVariations.length}`);
      
      // For clothing products, ensure we're correctly identifying size options
      if (product.category === 'Clothing') {
        // Special treatment for clothing variations - log ALL variations first
        console.log(`DEBUG: ALL variations for clothing product ${productId}:`, 
          product.allVariations.map(v => `${v.size} (stock: ${v.stockLevel})`));
        
        // Get list of actual sizes (not N/A) with stock
        const actualSizes = product.variations
          .filter(v => v.size !== 'N/A')
          .map(v => v.size);
        
        console.log(`DEBUG: Actual sizes with stock for ${productId}: [${actualSizes.join(', ')}]`);
        
        // Special fix: Force hasSizeOptions = true if there are actual sizes
        if (actualSizes.length > 0) {
          product.hasSizeOptions = true;
          product.actualSizes = actualSizes;
          console.log(`DEBUG: Setting hasSizeOptions=true because found sizes: ${actualSizes.join(', ')}`);
        } else {
          product.hasNoSizeOptions = true;
          console.log(`DEBUG: Setting hasNoSizeOptions=true because no actual sizes found`);
        }
      }
      
      // Check overall stock status based on variations
      const anyVariationInStock = product.variations.some(v => v.stockLevel > 0);
      if (!anyVariationInStock) {
        product.inStock = false;
        product.stockStatus = 'Out of Stock';
      }
    } else {
      console.log(`No variations found for product ${productId}`);
      product.variations = [];
    }
    
    // Add customization fee for Artistry products
    if (product.category === 'Artistry') {
      product.customizationFee = 500; // Default fee
      
      // If we have variations with additional price
      if (product.variations && product.variations.length > 0) {
        product.hasAdditionalPriceOptions = true;
      }
    }
    
    // Debug product before returning
    console.log(`DEBUG: Final product details for ${productId}:`, {
      id: product.id,
      name: product.name,
      category: product.category,
      hasVariations: product.variations && product.variations.length > 0,
      variationsCount: product.variations ? product.variations.length : 0,
      hasSizeOptions: product.hasSizeOptions,
      hasNoSizeOptions: product.hasNoSizeOptions,
      actualSizes: product.actualSizes
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