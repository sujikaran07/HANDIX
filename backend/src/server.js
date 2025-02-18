const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./routes/employeeLoginRoutes");
const { connectToDatabase } = require('./config/db');
const { setupAdminUser } = require('./models/employeeModel');
const net = require('net');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api", routes);

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
        await setupAdminUser();
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
