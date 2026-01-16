const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Asset = require('../models/Asset');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'ui';
    const uploadPath = path.join(__dirname, `../../assets/${category}`);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common design file formats
    const allowedTypes = /jpeg|jpg|png|gif|svg|pdf|psd|ai|sketch|fig|xd|webp|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');
    
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only design asset files are allowed.'));
  }
});

// GET /api/assets - List all assets with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      tags: req.query.tags ? req.query.tags.split(',') : undefined
    };

    const assets = await Asset.findAll(filters);
    res.json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/assets/:id - Get a specific asset
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/assets - Upload a new asset
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Extract category from the actual file destination
    const actualCategory = path.basename(path.dirname(req.file.path));

    const assetData = {
      id: uuidv4(),
      name: req.body.name || req.file.originalname,
      category: actualCategory,
      type: path.extname(req.file.originalname).substring(1),
      filePath: `/assets/${actualCategory}/${req.file.filename}`,
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };

    const asset = await Asset.create(assetData);

    res.status(201).json({
      success: true,
      message: 'Asset uploaded successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/assets/:id - Update asset metadata
router.put('/:id', async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      description: req.body.description,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : undefined
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => 
      updates[key] === undefined && delete updates[key]
    );

    const asset = await Asset.update(req.params.id, updates);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/assets/:id/version - Add a new version of an asset
router.post('/:id/version', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Extract category from the actual file destination
    const actualCategory = path.basename(path.dirname(req.file.path));
    const filePath = `/assets/${actualCategory}/${req.file.filename}`;
    const asset = await Asset.addVersion(req.params.id, filePath);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    res.json({
      success: true,
      message: 'New version added successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/assets/:id - Delete an asset
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Asset.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
