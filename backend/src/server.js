const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./routes/employeeLoginRoutes");
const sequelize = require('./config/db');
const Employee = require('./models/employeeModel');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync the Employee model
    await Employee.sync({ alter: true });

    // Check if the admin user exists, if not, create it
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';
    const adminUser = await Employee.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Employee.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        phoneNumber: '1234567890',
        role: 'admin',
        password: hashedPassword,
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user already exists.');
    }

    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
