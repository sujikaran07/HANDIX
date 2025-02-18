const express = require("express");
const router = express.Router();
const { getEmployees, login } = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/employees", authMiddleware, getEmployees);
router.post("/login", login);

module.exports = router;
