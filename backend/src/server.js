const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const employeeLoginRoutes = require("./routes/login/employeeLoginRoutes");
const employeeRoutes = require("./routes/employees/employeeRoutes");
const customerRoutes = require('./routes/customers/customerRoutes');
const productRoutes = require('./routes/products/productRoutes'); // Import product routes
const { connectToDatabase, sequelize } = require('./config/db');
const { Employee } = require('./models/employeeModel');
const net = require('net');
const { Address } = require('./models/addressModel');
const { Order } = require('./models/orderModel');
const { OrderDetail } = require('./models/orderDetailModel');
const { ProfileImage } = require('./models/profileImageModel');
const Product = require('./models/productModel'); // Ensure the correct import
const ProductVariation = require('./models/productVariationModel');
const Category = require('./models/categoryModel');
const { Customer } = require('./models/customerModel');

// Ensure associations are initialized
Customer.associate({ Address, Order });
Address.associate({ Customer });
Product.associate({ Category, ProductVariation });
Category.associate({ Product });
ProductVariation.associate({ Product });

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the frontend's origin
}));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api/login", employeeLoginRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use('/api/products', productRoutes); // Add product routes

const PORT = process.env.PORT || 5000;

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
        await connectToDatabase();
        await Employee.sync();
        await Product.sync();
        await Category.sync();
        await ProductVariation.sync();
        await Customer.sync();
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

sequelize.sync()
  .then(() => console.log('Database synced successfully.'))
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});