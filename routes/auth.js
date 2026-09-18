const router = require('express').Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {

    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashed
    });

    res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email
    });

});

router.post('/login', async (req, res) => {

    const user = await User.findOne({
        email: req.body.email
    });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {

        return res.status(401).json({
            error: 'Invalid email or password'
        });

    }

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '2h'
        }
    );

    res.status(200).json({
        token,
        name: user.name
    });

});

module.exports = router;