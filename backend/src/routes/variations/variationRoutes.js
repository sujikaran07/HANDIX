const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/db');

// Route: Get highest customization fee for a product
router.get('/:productId/customization-fee', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const [result] = await sequelize.query(
      `SELECT product_id, additional_price 
       FROM public."ProductVariations" 
       WHERE product_id = :productId 
       ORDER BY additional_price DESC
       LIMIT 1`,
      {
        replacements: { productId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (result) {
      return res.json({ 
        fee: parseFloat(result.additional_price),
        productId: result.product_id
      });
    }
    
    return res.json({ fee: 0, productId });
    
  } catch (error) {
    console.error('Error fetching customization fee:', error);
    res.status(500).json({ error: 'Failed to fetch customization fee', details: error.message });
  }
});

module.exports = router;
