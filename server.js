const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = 3000;

// Set up Helmet with custom CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
        frameSrc: ["https://www.youtube.com", "https://www.youtube-nocookie.com"],
        imgSrc: ["'self'", "https://i.ytimg.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"], // Disallow Flash and other plugins
        upgradeInsecureRequests: [], // Enforce HTTPS for all requests
      },
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
