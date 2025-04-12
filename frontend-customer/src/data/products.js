const products = [
    {
      id: 1,
      name: "Handcrafted Tote Bag",
      category: "carry-goods",
      price: 3500,
      description: "Beautifully handcrafted tote bag made of sustainable materials from Sri Lanka. Perfect for daily use with plenty of pocket space.",
      image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: true,
      wholesale_price: 2800
    },
    {
      id: 2,
      name: "Felt Pencil Pouch",
      category: "carry-goods",
      price: 1800,
      description: "Handmade felt pencil pouch with zipper. Keep your stationery organized in style. Made by local artisans in Batticaloa.",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: false,
      wholesale_price: 1200
    },
    {
      id: 3,
      name: "Embroidered Pillow Cover",
      category: "carry-goods",
      price: 2200,
      description: "Hand-embroidered pillow cover with traditional Sri Lankan patterns. Adds a touch of elegance to any home.",
      image: "https://images.unsplash.com/photo-1602940659805-770d1b3b9911?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
      featured: true,
      wholesale_price: 1650
    },
    {
      id: 4,
      name: "Hot Handle Holder",
      category: "carry-goods",
      price: 1200,
      description: "Protect your hands with these handmade handle holders. Perfect for cast iron and hot pots. Made by artisans in Jaffna.",
      image: "https://images.unsplash.com/photo-1609708993822-c3a768d6f712?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: false,
      wholesale_price: 850
    },
  
    {
      id: 5,
      name: "Handmade Beaded Necklace",
      category: "accessories",
      price: 4200,
      description: "Beautiful handcrafted beaded necklace with unique design from Sri Lankan artisans. Each piece is one of a kind.",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: true,
      wholesale_price: 3500
    },
    {
      id: 6,
      name: "Knitted Winter Hat",
      category: "accessories",
      price: 2650,
      description: "Stay warm with this handknitted hat. Made with premium wool by skilled artisans in the hill country of Sri Lanka.",
      image: "https://images.unsplash.com/photo-1576871337622-c3a769296611?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: false,
      wholesale_price: 2000
    },
  
    {
      id: 7,
      name: "Hand-Knit Wool Socks",
      category: "clothing",
      price: 1750,
      description: "Cozy hand-knit wool socks to keep your feet warm. Made with love and care by artisans in Nuwara Eliya.",
      image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: true,
      wholesale_price: 1300
    },
    {
      id: 8,
      name: "Baby Wool Sweater",
      category: "clothing",
      price: 3100,
      description: "Adorable handmade baby wool sweater. Perfect gift for newborns and infants. Crafted with care in Sri Lanka.",
      image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: false,
      wholesale_price: 2500
    },
  
    {
      id: 9,
      name: "DIY Pottery Kit",
      category: "crafts",
      price: 4500,
      description: "Create your own pottery at home with this complete DIY kit. Includes all necessary tools and clay from Sri Lankan soil.",
      image: "https://images.unsplash.com/photo-1565193566173-7a0af771fe10?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: true,
      wholesale_price: 3800
    },
    {
      id: 10,
      name: "Handmade Rope Bowl",
      category: "crafts",
      price: 2750,
      description: "Beautifully crafted rope bowl made with local materials, perfect for holding fruits or as a decorative piece in Sri Lankan homes.",
      image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: false,
      wholesale_price: 2200
    },
    {
      id: 11,
      name: "Crafted Fabric Headband",
      category: "crafts",
      price: 1400,
      description: "Stylish fabric headband, handmade with premium materials from Sri Lanka for comfort and durability.",
      image: "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: false,
      wholesale_price: 950
    },
    {
      id: 12,
      name: "Handcrafted Bookmark Set",
      category: "crafts",
      price: 1150,
      description: "Set of 5 unique handcrafted bookmarks with traditional Sri Lankan designs. Perfect for book lovers and avid readers.",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: true,
      wholesale_price: 800
    },
  
    {
      id: 13,
      name: "Aari Work Dress",
      category: "artistry",
      price: 14500,
      description: "Stunning Aari work dress with intricate embroidery by skilled artisans from Eastern Sri Lanka. Each piece is meticulously handcrafted.",
      image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: true,
      wholesale_price: 12000
    },
    {
      id: 14,
      name: "Aari Work Carpet",
      category: "artistry",
      price: 22500,
      description: "Exquisite Aari work carpet showcasing traditional Sri Lankan craftsmanship and artistry from the Northern Province.",
      image: "https://images.unsplash.com/photo-1584269881831-c21093466924?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: true,
      wholesale_price: 18000
    },
    {
      id: 15,
      name: "Embroidered Decorative Pillow",
      category: "artistry",
      price: 5500,
      description: "Beautiful decorative pillow with detailed embroidery work by Sri Lankan artisans. A perfect accent for any living space.",
      image: "https://images.unsplash.com/photo-1579656381253-c2109346692f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      featured: false,
      wholesale_price: 4200
    }
  ];
  
  const categories = [
    {
      id: "carry-goods",
      name: "Carry Goods",
      description: "Storage, organization, and carrying items",
      image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    },
    {
      id: "accessories",
      name: "Accessories",
      description: "Personal adornments and wearable accessories",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    },
    {
      id: "clothing",
      name: "Clothing",
      description: "Handmade clothing for comfort and style",
      image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    },
    {
      id: "crafts",
      name: "Crafts",
      description: "DIY supplies for creative projects",
      image: "https://images.unsplash.com/photo-1565193566173-7a0af771fe10?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    },
    {
      id: "artistry",
      name: "Artistry",
      description: "Traditional Aari work items, both decor and wearable",
      image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    },
  ];
  
  const EXCHANGE_RATE = {
    USD_TO_LKR: 320,
    LKR_TO_USD: 0.00313
  };
  
  export { products, categories, EXCHANGE_RATE };