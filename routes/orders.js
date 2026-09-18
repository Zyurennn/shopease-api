const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const { getIO } = require('../socket');

router.post('/', requireAuth, async (req, res) => {
    const items = [];
    let total = 0;

    for (const { productId, qty } of req.body.items) {
        const product = await Product.findById(productId);

        items.push({
            product: product._id,
            name: product.name,
            price: product.price,
            qty
        });

        total += product.price * qty;

        product.stock -= qty;

        await product.save();
    }

    const order = await Order.create({
        user: req.user.userId,
        items,
        total
    });

    getIO().emit('orderPlaced', {
        orderId: order._id,
        total: order.total
    });

    res.status(201).json(order);
});

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = req.query.category
        ? { category: req.query.category }
        : {};

    const products = await Product.find(filter)
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
        data: products,
        page,
        totalPages: Math.ceil(total / limit)
    });
});

module.exports = router;