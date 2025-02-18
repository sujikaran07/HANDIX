const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require('./routes/authRoutes');
const pool = require("./config/db");
const sequelize = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api", employeeRoutes);
app.use('/login', authRoutes);

app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching employees", err);
    res.status(500).json({ message: "Error fetching employees" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await sequelize.query("SELECT * FROM employees WHERE email = :email", {
      replacements: { email },
      type: sequelize.QueryTypes.SELECT
    });
    if (result.length > 0) {
      const user = result[0];
      res.status(200).json({ message: `Welcome, ${user.email}` });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
