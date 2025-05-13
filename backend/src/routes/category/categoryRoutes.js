const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category/categoryController');
const { upload } = require('../../utils/cloudinaryConfig');

router.get('/', categoryController.getAllCategories);
router.post('/', upload.single('category_image'), categoryController.createCategory);

module.exports = router;
