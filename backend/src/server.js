const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const employeeLoginRoutes = require("./routes/login/employeeLoginRoutes");  
const employeeRoutes = require("./routes/employees/employeeRoutes");  
const customerRoutes = require('./routes/customers/customerRoutes'); 
const { connectToDatabase, sequelize } = require('./config/db'); 
const { Employee } = require('./models/employeeModel');
// Removed direct import of Customer model
// const { Customer } = require('./models/customerModel');
const net = require('net');
const { Address } = require('./models/addressModel');
const { Order } = require('./models/orderModel');
const { OrderDetail } = require('./models/orderDetailModel');
const { ProfileImage } = require('./models/profileImageModel');

// Ensure associations are initialized
const { Customer } = require('./models/customerModel');
Customer.associate({ Address, Order });
Address.associate({ Customer });
// Removed duplicate association
// Address.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
}));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api/login", employeeLoginRoutes);  
app.use("/api/employees", employeeRoutes);  
app.use("/api/customers", customerRoutes); 

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
        // Dynamically require Customer model to avoid circular dependency
        const { Customer } = require('./models/customerModel');
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

// Removed direct usage of Customer model in sequelize.sync()
sequelize.sync() 
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});