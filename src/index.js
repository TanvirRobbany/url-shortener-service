const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('../swaggerConfig.js');
const cors = require('cors');
require('dotenv').config();

// Models
const URL = require('./models/urlModel.js');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware to parse JSON data
app.use(express.json());

// Middleware to enable CORS
const corsOptions = {
    origin: '*',
    methods: 'GET, POST',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
app.use(cors(corsOptions));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
if (require.main === module) {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('MongoDB connected');
        }).catch((error) => {
            console.error('MongoDB connection error:', error);
        })
}

// Routes
/**
 * @swagger
 * /shorten:
 *   post:
 *     summary: Shorten a URL
 *     tags: [URL Shortener]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: The long URL to shorten
 *                 example: "https://example.com"
 *     responses:
 *       200:
 *         description: URL has already been shortened
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "URL already shortened"
 *                 shortUrl:
 *                   type: string
 *                   example: "abc123"
 *       201:
 *         description: Short URL successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 longUrl:
 *                   type: string
 *                   example: "https://example.com"
 *                 shortUrl:
 *                   type: string
 *                   example: "abc123"
 *       400:
 *         description: Invalid URL format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid URL format"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */  
app.post('/shorten', async (req, res) => {
    const { longUrl } = req.body;

    // URL validation
    if (!validUrl.isUri(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    try {
        // Generate a unique short URL and ensure there are no collisions
        let shortUrl;
        let urlExists;
        do {
            shortUrl = nanoid(6);
            urlExists = await URL.findOne({ shortUrl });
        } while (urlExists);

        // Check if the URL already exists
        let url = await URL.findOne({ longUrl });
        if (url) {
            return res.status(200).json({ message: 'URL already shortened', shortUrl: url.shortUrl });
        }

        // If not, create a new one
        url = new URL({ longUrl, shortUrl });
        await url.save();

        res.status(201).json({ longUrl, shortUrl });
    } catch (error) {
        if (err.name === 'MongoNetworkError') {
            res.status(500).json({ error: 'Database connection error' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * @swagger
 * /{shortUrl}:
 *   get:
 *     summary: Redirect to the original URL
 *     tags: [URL Shortener]
 *     parameters:
 *       - in: path
 *         name: shortUrl
 *         required: true
 *         schema:
 *           type: string
 *         description: The short URL code
 *     responses:
 *       302:
 *         description: Redirects to the original URL
 *       404:
 *         description: URL not found
 */
app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    try {
        // Find the original URL form the short URL
        const url = await URL.findOne({ shortUrl });

        if (url) {
            // Redirect to the long URL
            res.status(302).redirect(url.longUrl);
        } else {
            res.status(404).json({ error: 'Short URL not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Test route
app.get('/', (req, res) => {
    res.send('URL Shortener API is running...');
});

// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;