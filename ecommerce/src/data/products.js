export const products = [
  {
    id: 1,
    name: "Handwoven Basket Bag",
    description: "Beautifully crafted basket bag made from locally sourced palm leaves. Perfect for shopping or beach days.",
    price: 3500,
    currency: "LKR",
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
    ],
    category: "Carry Goods",
    rating: 4.8,
    reviewCount: 24,
    inStock: true,
    isCustomizable: false
  },
  {
    id: 2,
    name: "Handloom Cotton Scarf",
    description: "Soft and elegant handloom cotton scarf with traditional Sri Lankan patterns.",
    price: 1800,
    currency: "LKR",
    images: [
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04"
    ],
    category: "Accessories",
    rating: 4.5,
    reviewCount: 18,
    inStock: true,
    isCustomizable: false
  },
  {
    id: 3,
    name: "Traditional Batik Shirt",
    description: "Hand-dyed batik shirt featuring unique patterns inspired by Sri Lankan heritage.",
    price: 4500,
    currency: "LKR",
    images: [
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
    ],
    category: "Clothing",
    rating: 4.7,
    reviewCount: 32,
    inStock: true,
    isCustomizable: false,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Ceramic Tea Set",
    description: "Handcrafted ceramic tea set with intricate hand-painted designs.",
    price: 6500,
    currency: "LKR",
    images: [
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    ],
    category: "Crafts",
    rating: 4.9,
    reviewCount: 15,
    inStock: false,
    isCustomizable: false
  },
  {
    id: 5,
    name: "Coconut Shell Jewelry Box",
    description: "Exquisite jewelry box crafted from polished coconut shell with brass inlays.",
    price: 2800,
    currency: "LKR",
    images: [
      "https://images.unsplash.com/photo-1472396961693-142e6e269027",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
    ],
    category: "Artistry",
    rating: 4.6,
    reviewCount: 21,
    inStock: true,
    isCustomizable: true,
    customizationFee: 1000
  },
  {
    id: 6,
    name: "Handmade Leather Wallet",
    description: "Premium quality leather wallet, hand-stitched by local artisans.",
    price: 3200,
    currency: "LKR",
    images: [
      "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"
    ],
    category: "Accessories",
    rating: 4.7,
    reviewCount: 28,
    inStock: true,
    isCustomizable: false
  },
];

export const categories = [
  "Carry Goods",
  "Accessories",
  "Clothing",
  "Crafts",
  "Artistry"
];