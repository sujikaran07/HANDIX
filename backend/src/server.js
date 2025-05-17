const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const employeeLoginRoutes = require("./routes/login/employeeLoginRoutes");
const employeeRoutes = require("./routes/employees/employeeRoutes");
const employeeSettingsRoutes = require("./routes/employees/settingsRoutes");
const customerRoutes = require('./routes/customers/customerRoutes');
const productRoutes = require('./routes/products/productRoutes');
const adminProductRoutes = require('./routes/admin/adminProductRoutes');
const adminRoutes = require('./routes/admin/adminRoutes'); // Add this line to import adminRoutes
const inventoryRoutes = require('./routes/inventory/inventoryRoutes');
const { connectToDatabase, sequelize } = require('./config/db');
const { Employee } = require('./models/employeeModel');
const net = require('net');
const { Address } = require('./models/addressModel');
const { Order } = require('./models/orderModel');
const { OrderDetail } = require('./models/orderDetailModel');
const { ProfileImage } = require('./models/profileImageModel');
const EmployeeProfile = require('./models/employeeProfileModel');
const Inventory = require('./models/inventoryModel'); 
const Category = require('./models/categoryModel');
const ProductImage = require('./models/productImageModel');
const ProductEntry = require('./models/productEntryModel'); 
const ProductVariation = require('./models/productVariationModel');
const { Customer } = require('./models/customerModel');
const { Transaction } = require('./models/transactionModel');
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
const profileImageRoutes = require('./routes/profileImages/profileImageRoutes');
const shippingMethodRoutes = require('./routes/shippingMethods/shippingMethodRoutes');
const artisanRoutes = require('./routes/artisan/artisanRoutes');
const assignedOrderRoutes = require('./routes/orders/assignedOrderRoutes');
const adminDashboardRoutes = require('./routes/admin/adminDashboardRoutes');
const artisanDashboardRoutes = require('./routes/artisan/artisanDashboardRoutes');
const reportRoutes = require('./routes/reports/reportRoutes'); 
const artisanReportRoutes = require('./routes/artisan/artisanReportRoutes');
const discountRoutes = require('./routes/discounts/discountRoutes');
const { Discount } = require('./models/discountModel');
const RetailShippingSettings = require('./models/retailShippingSettingsModel');
const DistrictShippingRates = require('./models/districtShippingRatesModel');
const PurchaseLimit = require('./models/purchaseLimitsModel');
const Review = require('./models/reviewModel');
const ReviewImage = require('./models/reviewImageModel');

Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'orderDetails' });
// Change the alias to match what we set in the Review model
Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'orderInfo' });

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

// Transaction associations
Transaction.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });
Transaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Customer.hasMany(Transaction, { foreignKey: 'c_id', as: 'transactions' });
Order.hasMany(Transaction, { foreignKey: 'order_id', as: 'transactions' });

// Associate Order with ShippingMethod
Order.belongsTo(ShippingMethod, { foreignKey: 'shippingMethodId', as: 'shippingMethod' });
ShippingMethod.hasMany(Order, { foreignKey: 'shippingMethodId', as: 'orders' });

// Add association between Customer and Discount
Customer.hasMany(Discount, { foreignKey: 'c_id', as: 'discounts', onDelete: 'CASCADE' });
Discount.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });

// Associate Inventory with Discount
Inventory.hasMany(Discount, { foreignKey: 'productId', as: 'discounts', sourceKey: 'product_id' });
Discount.belongsTo(Inventory, { foreignKey: 'productId', targetKey: 'product_id', as: 'inventory' });

// Associate Inventory with PurchaseLimit
Inventory.hasOne(PurchaseLimit, { foreignKey: 'productId', as: 'purchaseLimit', sourceKey: 'product_id' });
PurchaseLimit.belongsTo(Inventory, { foreignKey: 'productId', targetKey: 'product_id', as: 'inventory' });

// Remove this if statement if it's causing issues, and use direct associations instead
// Register associations for reviews
// Comment out the problematic block to prevent duplicate associations
/* 
if (Review.associate) Review.associate({ Customer, Order, Inventory, ReviewImage });
if (ReviewImage.associate) ReviewImage.associate({ Review });
*/

// Add these direct associations instead
Review.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });
Review.belongsTo(Inventory, { foreignKey: 'product_id', as: 'product' });
Review.hasMany(ReviewImage, { foreignKey: 'review_id', as: 'reviewImages' });
ReviewImage.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:3000'
  ], 
  credentials: true
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
app.use('/api/admin', adminRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/orders', assignedOrderRoutes);
app.use('/api/login', employeeLoginRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes); 
app.use('/api/checkout', checkoutRoutes); 
app.use('/api/variations', variationRoutes);
app.use('/api/addresses', addressRoutes); 
app.use('/api/profileImages', profileImageRoutes); 
app.use('/api/shipping-methods', shippingMethodRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/employees/settings', employeeSettingsRoutes);
app.use('/api/dashboard', adminDashboardRoutes);
app.use('/api/artisan-dashboard', artisanDashboardRoutes);
app.use('/api/reports', reportRoutes); 
app.use('/api/artisan/reports', artisanReportRoutes); 
app.use('/api/discounts', discountRoutes);

// Register artisan routes
app.use('/api/artisan', artisanRoutes);

// Register review routes
app.use('/api/reviews', require('./routes/reviews/reviewRoutes'));

// Enable debug routes only in development environment
if (process.env.NODE_ENV === 'development') {
  app.use('/api/artisan-debug', require('./routes/artisan/debugRoutes'));
}

const PRIMARY_PORT = process.env.PRIMARY_PORT || 5000;
const SECONDARY_PORT = process.env.SECONDARY_PORT || 5001;

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

checkPort(PRIMARY_PORT)
  .then(() => {
    app.listen(PRIMARY_PORT, async () => {
      try {
        if (typeof connectToDatabase === 'function') {
          await connectToDatabase();
        } else {
          console.log('PostgreSQL connected');
        }
        console.log(`Primary server is running on port ${PRIMARY_PORT}`);
        
        // Start secondary server
        try {
          await checkPort(SECONDARY_PORT);
          const secondaryApp = express();
          // Apply same middleware and routes
          secondaryApp.use(cors({
            origin: [
              'http://localhost:5173', 
              'http://localhost:5174', 
              'http://localhost:5175', 
              'http://localhost:5176', 
              'http://localhost:3000'
            ], 
            credentials: true
          }));
          secondaryApp.use(bodyParser.json());
          secondaryApp.use(express.json());
          
          // Copy all routes to secondaryApp
          Object.keys(app._router.stack).forEach(key => {
            if (app._router.stack[key].route) {
              secondaryApp.use(app._router.stack[key].route);
            }
          });
          
          secondaryApp.listen(SECONDARY_PORT, () => {
            console.log(`Secondary server is running on port ${SECONDARY_PORT}`);
          });
        } catch (error) {
          console.error(`Failed to start secondary server: ${error.message}`);
        }
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