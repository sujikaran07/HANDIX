const express = require('express');
const { login, refreshToken } = require('../../controllers/login/employeeLoginControllers'); 
const router = express.Router();

router.post('/', login);
router.post('/refresh-token', refreshToken); 

module.exports = router;
