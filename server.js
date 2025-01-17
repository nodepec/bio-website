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

// Set up Helmet with relaxed CSP for YouTube and "Connect With Me" buttons
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "'unsafe-inline'", // Allow inline scripts for dynamic elements
        ],
        frameSrc: [
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
        ],
        imgSrc: [
          "'self'",
          "https://i.ytimg.com", // YouTube thumbnails
          "https://*.gravatar.com", // For avatars (if used in buttons)
        ],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for buttons
        connectSrc: ["'self'"],
        objectSrc: ["'none'"], // Block plugins like Flash
        upgradeInsecureRequests: [], // Force HTTPS for all HTTP resources
      },
    },
  })
);

// Log HTTP requests
app.use(morgan('combined'));

// Limit repeated requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Main route (index page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Custom 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
