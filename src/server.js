const express = require('express');
const path = require('path');
const assetRoutes = require('./routes/assets');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/assets', assetRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`AtlasArchive server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

module.exports = app;
