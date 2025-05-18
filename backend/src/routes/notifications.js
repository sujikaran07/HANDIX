const express = require('express');
const router = express.Router();
const RestockOrder = require('../models/restockOrderModel');
const ProductEntry = require('../models/productEntryModel');
const { Order } = require('../models/orderModel');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const artisan_id = req.query.artisan_id; // e.g., 'E006'
    const artisan_name = req.query.artisan_name; // e.g., 'Arunan karunakaran'

    // Only fetch notifications related to this artisan
    const restocks = artisan_id ? await RestockOrder.findAll({
      where: { artisan_id, status: 'Assigned' },
      limit: 10,
      order: [['updated_at', 'DESC']],
    }) : [];

    const entries = artisan_id ? await ProductEntry.findAll({
      where: { e_id: artisan_id },
      limit: 10,
      order: [['date_added', 'DESC']]
    }) : [];

    // Debug: log received values
    console.log('artisan_id:', artisan_id, 'artisan_name:', artisan_name);
    // Orders: hardcode for debug
    let orders = [];
    orders = await Order.findAll({
      where: {
        assignedArtisan: { [Op.iLike]: '%Arunan karunakaran%' }
      },
      limit: 10,
      order: [
        ['orderDate', 'DESC']
      ]
    });
    console.log('Orders found:', orders.length);
    orders.forEach(o => console.log('Order:', o.order_id, 'assignedArtisan:', o.assignedArtisan));

    const notifications = [];

    restocks.forEach(r => {
      notifications.push({
        type: 'restock',
        message: `Restock request for product ${r.product_id} assigned to you. Quantity: ${r.quantity}.`,
        notes: r.notes || '',
        timestamp: r.updated_at || r.created_at
      });
    });

    entries.forEach(e => {
      const status = (e.status || '').toLowerCase();
      if (status === 'approved') {
        notifications.push({
          type: 'entry',
          message: `Your product '${e.product_name}' has been approved.`,
          timestamp: e.date_added
        });
      } else if (status === 'rejected') {
        notifications.push({
          type: 'entry',
          message: `Your product '${e.product_name}' has been rejected.`,
          timestamp: e.date_added
        });
      }
    });

    orders.forEach(o => {
      notifications.push({
        type: 'order',
        message: `New order #${o.order_id} has been assigned to you.`,
        timestamp: o.orderDate
      });
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

module.exports = router; 