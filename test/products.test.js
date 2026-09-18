require('dotenv').config();

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);

    const email = `test${Date.now()}@example.com`;
    const password = 'Test12345';

    await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Test User',
            email,
            password
        });

    const login = await request(app)
        .post('/api/auth/login')
        .send({
            email,
            password
        });

    global.testToken = login.body.token;
}, 15000);

afterAll(async () => {
    await mongoose.connection.close();
});

describe('POST /api/products', () => {
    it('rejects a negative price', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${global.testToken}`)
            .send({
                name: 'Bad Item',
                price: -10,
                category: 'Electronics'
            });

        expect(res.statusCode).toBe(400);
    });

    it('creates a product with valid data', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${global.testToken}`)
            .send({
                name: 'Wireless Mouse',
                price: 799,
                category: 'Electronics'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Wireless Mouse');
    });
});