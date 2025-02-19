const express = require("express");
const router = express.Router();
const { getEmployees, login, authMiddleware } = require("../controllers/employeeLoginControllers");


router.get("/employees", authMiddleware, getEmployees);


router.post("/login", login);

module.exports = router;
