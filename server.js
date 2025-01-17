const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

// Middleware for Gzip compression
app.use(compression());

// Middleware for adding security headers
app.use(helmet());

// Middleware for logging requests
app.use(morgan('combined'));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files with caching
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve a 404 page for unmatched routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Serve a sitemap
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.send(`
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
                <loc>http://localhost:${PORT}/</loc>
                <priority>1.0</priority>
            </url>
        </urlset>
    `);
});

// Redirect HTTP to HTTPS (if needed)
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
