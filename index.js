require('dotenv').config();
const express = require('express');
const validUrl = require('valid-url');
const cors = require('cors');
const app = express();

// In-memory database for storing URLs
let urlDatabase = {};
let shortUrlCounter = 1;

// Middleware to parse JSON body and handle CORS
app.use(express.json());
app.use(cors());

// POST to shorten the URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Check if the URL is valid
  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid url' });  // Changed error message to match the test
  }

  // Check if the URL already exists
  let shortUrl = Object.keys(urlDatabase).find(
    key => urlDatabase[key] === originalUrl
  );

  // If URL is new, create a new short URL
  if (!shortUrl) {
    shortUrl = shortUrlCounter.toString(); // Generate a new short URL
    urlDatabase[shortUrl] = originalUrl;  // Store it in the database
    shortUrlCounter++;  // Increment the counter for future short URLs
  }

  // Respond with original_url and short_url
  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// GET to redirect using the short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl); // Redirect to the original URL
  } else {
    res.json({ error: 'No short URL found for the given input' }); // Handle the case if the short URL doesn't exist
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
