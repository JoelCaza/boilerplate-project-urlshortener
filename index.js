require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Añadido para formularios HTML
app.use(cors());
app.use(express.static('public')); // Servir archivos estáticos

// Base de datos en memoria
const urlDatabase = new Map();
let shortUrlCounter = 1;

// Validación de URL mejorada
const verifyUrl = (url, callback) => {
  try {
    const { protocol, hostname } = new URL(url);
    if (!['http:', 'https:'].includes(protocol)) return callback(false);
    
    dns.lookup(hostname, (err) => {
      callback(!err);
    });
  } catch (error) {
    callback(false);
  }
};

// Endpoint POST
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  verifyUrl(originalUrl, (isValid) => {
    if (!isValid) return res.json({ error: 'invalid url' });

    const existingEntry = Array.from(urlDatabase.entries())
      .find(([, value]) => value === originalUrl);

    if (existingEntry) {
      return res.json({
        original_url: originalUrl,
        short_url: existingEntry[0]
      });
    }

    const shortUrl = shortUrlCounter++;
    urlDatabase.set(shortUrl.toString(), originalUrl);

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// Endpoint GET
app.get('/api/shorturl/:short_url', (req, res) => {
  const originalUrl = urlDatabase.get(req.params.short_url);
  originalUrl ? res.redirect(originalUrl) : res.json({ error: 'invalid short url' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));