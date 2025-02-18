const pool = require("../config/db");

const getEmployees = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching employees", err);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM employees WHERE email = $1";
  
  try {
    const result = await pool.query(query, [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (user.password === password) { 
        res.status(200).json({ message: `Welcome, ${user.email}` });
      } else {
        res.status(400).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = {
  getEmployees,
  login,
};
