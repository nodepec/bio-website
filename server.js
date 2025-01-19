const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

// Apply Gzip compression
app.use(compression());

// Set up Helmet with a relaxed CSP for YouTube and buttons
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
        ],
        frameSrc: [
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
        ],
        imgSrc: [
          "'self'",
          "https://i.ytimg.com", // YouTube thumbnails
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Allow inline styles for buttons and dynamic content
        ],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"], // Block plugins like Flash
        upgradeInsecureRequests: [], // Force HTTPS for all resources
      },
    },
  })
);

// Log HTTP requests for debugging
app.use(morgan('combined'));

// Limit repeated requests to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve sitemap.xml
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

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow:');
});

// Custom 404 page for unmatched routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
