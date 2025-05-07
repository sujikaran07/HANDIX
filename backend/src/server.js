const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const employeeLoginRoutes = require("./routes/login/employeeLoginRoutes");
const employeeRoutes = require("./routes/employees/employeeRoutes");
const customerRoutes = require('./routes/customers/customerRoutes');
const productRoutes = require('./routes/products/productRoutes');
const adminProductRoutes = require('./routes/admin/adminProductRoutes');
const inventoryRoutes = require('./routes/inventory/inventoryRoutes');
const { connectToDatabase, sequelize } = require('./config/db');
const { Employee } = require('./models/employeeModel');
const net = require('net');
const { Address } = require('./models/addressModel');
const { Order } = require('./models/orderModel');
const { OrderDetail } = require('./models/orderDetailModel');
const { ProfileImage } = require('./models/profileImageModel');
const Inventory = require('./models/inventoryModel'); 
const Category = require('./models/categoryModel');
const ProductImage = require('./models/productImageModel');
const ProductEntry = require('./models/productEntryModel'); 
const ProductVariation = require('./models/productVariationModel');
const { Customer } = require('./models/customerModel');
const adminInventoryRoutes = require('./routes/admin/adminInventoryRoutes');
const orderRoutes = require('./routes/orders/orderRoutes');
const authRoutes = require('./routes/auth/authRoutes'); 
const categoryRoutes = require('./routes/category/categoryRoutes'); 
const cartRoutes = require('./routes/cart/cartRoutes');
const favoriteRoutes = require('./routes/favorites/favoriteRoutes'); 
const checkoutRoutes = require('./routes/checkout/checkoutRoutes'); 
const Cart = require('./models/cartModel');
const CartItem = require('./models/cartItemModel');
const Favorite = require('./models/favoriteModel'); 
const { ShippingMethod } = require('./models/shippingMethodModel');
const variationRoutes = require('./routes/variations/variationRoutes');
const addressRoutes = require('./routes/addresses/addressRoutes');

Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'orderDetails' });

Inventory.hasMany(ProductEntry, { foreignKey: 'product_id', as: 'inventoryEntries' });
ProductEntry.belongsTo(Inventory, { foreignKey: 'product_id', as: 'inventory' });

Category.hasMany(ProductEntry, { foreignKey: 'category_id', as: 'entries' });
ProductEntry.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

ProductEntry.hasMany(ProductImage, { foreignKey: 'product_id', sourceKey: 'product_id', as: 'entryImages' });
ProductImage.belongsTo(ProductEntry, { foreignKey: 'product_id', targetKey: 'product_id', as: 'productEntry' });

Inventory.hasMany(ProductImage, { 
  foreignKey: 'product_id',
  sourceKey: 'product_id',
  as: 'productImages'
});

ProductImage.belongsTo(Inventory, { 
  foreignKey: 'product_id', 
  targetKey: 'product_id',
  as: 'inventory' 
});

Customer.hasMany(Address, {
  foreignKey: 'c_id',
  as: 'addresses',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Address.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });

Order.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });
Customer.hasMany(Order, {
  foreignKey: 'c_id',
  as: 'customerOrders',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], 
}));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api", employeeLoginRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes); 
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminInventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/login', employeeLoginRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes); 
app.use('/api/checkout', checkoutRoutes); 
app.use('/api/variations', variationRoutes);
app.use('/api/addresses', addressRoutes); 

const PORT = process.env.PORT || 5000;

try {
  require('./setup/copyLogo');
  console.log('Logo setup complete');
} catch (error) {
  console.log('Logo setup failed, but continuing server startup:', error.message);
}

const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve();
    });
    server.listen(port);
  });
};

checkPort(PORT)
  .then(() => {
    app.listen(PORT, async () => {
      try {
        if (typeof connectToDatabase === 'function') {
          await connectToDatabase();
        } else {
          console.log('PostgreSQL connected');
        }
        console.log(`Server is running on port ${PORT}`);
      } catch (error) {
        console.error('Error during server startup:', error);
      }
    });
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

sequelize
  .sync({ alter: false }) 
  .then(() => {
    console.log('Database synced successfully.');
   
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});