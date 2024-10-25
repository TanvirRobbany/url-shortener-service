const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');
const URL = require('../src/models/urlModel');

let server;



beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI;
    await mongoose.connect(mongoUri);
    server = app.listen(5000);
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
})

describe('POST /shorten', () => {
    beforeEach(async () => {
        await URL.deleteMany({});
    })
    test('should shorten a valid URL with unique short code', async () => {
        const response = await request(app)
            .post('/shorten')
            .send({ longUrl: 'https://example.com' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('shortUrl');
    });

    test('should return an error for an invalid URL', async () => {
        const response = await request(app)
            .post('/shorten')
            .send({ longUrl: 'invalid-url' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should not create duplicate short URLs for the same long URL', async () => {
        await URL.create({ longUrl: 'https://example.com', shortUrl: 'abc123' });

        const response = await request(app)
            .post('/shorten')
            .send({ longUrl: 'https://example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('shortUrl');
    });
});

describe('GET /:shortUrl', () => {
    beforeEach(async () => {
        await URL.deleteMany({});
    })
    test('should redirect to the original URL', async () => {
        const url = await URL.create({ longUrl: 'https://example.com', shortUrl: 'abc123' });

        const response = await request(app).get('/abc123');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(url.longUrl);
    });

    test('should return a 404 for a non-existent short URL', async () => {
        const response = await request(app).get('/nonexistent');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Short URL not found');
    });
});
