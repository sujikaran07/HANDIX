const express = require('express');
const { login } = require('../../controllers/login/employeeLoginControllers'); // Corrected import path
const router = express.Router();

router.post('/', login);

module.exports = router;
