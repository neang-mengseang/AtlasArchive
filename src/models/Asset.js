const fs = require('fs').promises;
const path = require('path');

const ASSETS_DB_PATH = path.join(__dirname, '../../data/assets.json');

class Asset {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category; // ui, brand, illustrations, templates
    this.type = data.type; // file extension
    this.filePath = data.filePath;
    this.version = data.version || 1;
    this.versions = data.versions || [];
    this.description = data.description || '';
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static async loadAssets() {
    try {
      const data = await fs.readFile(ASSETS_DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  static async saveAssets(assets) {
    const dir = path.dirname(ASSETS_DB_PATH);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Ignore EEXIST error (directory already exists), but log others
      if (error.code !== 'EEXIST') {
        console.warn('Error creating data directory:', error.message);
      }
    }
    await fs.writeFile(ASSETS_DB_PATH, JSON.stringify(assets, null, 2));
  }

  static async findAll(filters = {}) {
    const assets = await this.loadAssets();
    let filtered = assets;

    if (filters.category) {
      filtered = filtered.filter(a => a.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(a => 
        filters.tags.some(tag => a.tags.includes(tag))
      );
    }

    return filtered.map(a => new Asset(a));
  }

  static async findById(id) {
    const assets = await this.loadAssets();
    const asset = assets.find(a => a.id === id);
    return asset ? new Asset(asset) : null;
  }

  static async create(assetData) {
    const assets = await this.loadAssets();
    const newAsset = new Asset(assetData);
    newAsset.versions.push({
      version: 1,
      filePath: newAsset.filePath,
      createdAt: newAsset.createdAt
    });
    assets.push(newAsset);
    await this.saveAssets(assets);
    return newAsset;
  }

  static async update(id, updates) {
    const assets = await this.loadAssets();
    const index = assets.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }

    const asset = assets[index];
    const updatedAsset = new Asset({
      ...asset,
      ...updates,
      updatedAt: new Date().toISOString()
    });

    assets[index] = updatedAsset;
    await this.saveAssets(assets);
    return updatedAsset;
  }

  static async addVersion(id, filePath) {
    const assets = await this.loadAssets();
    const index = assets.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }

    const asset = assets[index];
    const newVersion = asset.version + 1;
    
    asset.versions.push({
      version: newVersion,
      filePath: filePath,
      createdAt: new Date().toISOString()
    });

    asset.version = newVersion;
    asset.filePath = filePath;
    asset.updatedAt = new Date().toISOString();

    assets[index] = asset;
    await this.saveAssets(assets);
    return new Asset(asset);
  }

  static async delete(id) {
    const assets = await this.loadAssets();
    const assetIndex = assets.findIndex(a => a.id === id);
    
    if (assetIndex === -1) {
      return false;
    }

    const asset = assets[assetIndex];
    
    // Delete all version files from filesystem
    for (const version of asset.versions) {
      const filePath = path.join(__dirname, '../..', version.filePath);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, continue anyway
        console.warn(`Failed to delete file: ${filePath}`, error.message);
      }
    }

    // Remove from metadata
    const filtered = assets.filter(a => a.id !== id);
    await this.saveAssets(filtered);
    return true;
  }
}

module.exports = Asset;
