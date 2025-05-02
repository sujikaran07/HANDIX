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