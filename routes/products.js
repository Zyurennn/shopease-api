const {
    body,
    validationResult
} = require('express-validator');

const router = require('express').Router();

const multer = require('multer');

const Product = require('../models/Product');

const requireAuth = require('../middleware/auth');

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});


router.get('/', async (req, res) => {
    res.json(await Product.find());
});


router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            error: 'Product not found'
        });
    }

    res.json(product);
});


router.post(
    '/',
    requireAuth,
    [
        body('name')
            .notEmpty()
            .withMessage('name is required'),

        body('price')
            .isFloat({ gt: 0 })
            .withMessage('price must be a positive number'),

        body('category')
            .notEmpty()
            .withMessage('category is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        res.status(201).json(
            await Product.create(req.body)
        );
    }
);


router.patch('/:id', requireAuth, async (req, res) => {
    res.json(
        await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
    );
});


router.delete('/:id', requireAuth, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: 'Product deleted'
    });
});


router.post(
    '/:id/photo',
    requireAuth,
    upload.single('photo'),
    async (req, res) => {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                imageFilename: req.file.filename
            },
            {
                new: true
            }
        );

        res.status(200).json(product);
    }
);


module.exports = router;
