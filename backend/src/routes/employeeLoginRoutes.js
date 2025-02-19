const express = require("express");
const router = express.Router();
const { getEmployees, login, authMiddleware } = require("../controllers/employeeLoginControllers");

// Employee routes
router.get("/employees", authMiddleware, getEmployees);

// Auth routes
router.post("/login", login);

module.exports = router;
