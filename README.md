# AtlasArchive

AtlasArchive is a Design Asset Management System that helps teams store, organize, version, and reuse design assets efficiently. It centralizes creative resources such as UI files, brand assets, illustrations, and templates into a single, structured system — enabling designers and developers to work faster, cleaner, and more consistently.

## Features

- **Asset Storage**: Upload and store design assets in organized categories (UI Files, Brand Assets, Illustrations, Templates)
- **Version Control**: Track multiple versions of each asset with full version history
- **Metadata Management**: Add descriptions, tags, and categorization to assets for easy discovery
- **Search & Filter**: Powerful search capabilities to find assets by name, description, tags, or category
- **REST API**: Complete API for programmatic access to all functionality
- **Web Interface**: User-friendly interface for managing assets

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/neang-mengseang/AtlasArchive.git
cd AtlasArchive
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Web Interface

1. **Upload Assets**: Use the upload form to add new design assets
   - Select a file (supports: JPG, PNG, SVG, PDF, PSD, AI, Sketch, Figma, XD, etc.)
   - Choose a category (UI Files, Brand Assets, Illustrations, or Templates)
   - Add optional metadata (name, description, tags)

2. **Browse Assets**: View all assets in a grid layout
   - Filter by category
   - Search by name, description, or tags
   - Click on any asset to view details

3. **Asset Details**: View complete information about an asset
   - See all metadata
   - View version history
   - Delete assets

### API Endpoints

#### Get All Assets
```
GET /api/assets
Query Parameters:
  - category: Filter by category (ui, brand, illustrations, templates)
  - search: Search in name, description, and tags
  - tags: Filter by tags (comma-separated)
```

#### Get Single Asset
```
GET /api/assets/:id
```

#### Upload New Asset
```
POST /api/assets
Body: multipart/form-data
  - file: The asset file
  - name: Asset name (optional)
  - category: Category (ui, brand, illustrations, templates)
  - description: Description (optional)
  - tags: Comma-separated tags (optional)
```

#### Update Asset Metadata
```
PUT /api/assets/:id
Body: JSON
  - name: New name
  - description: New description
  - tags: New tags (comma-separated)
```

#### Add New Version
```
POST /api/assets/:id/version
Body: multipart/form-data
  - file: The new version file
  - category: Category
```

#### Delete Asset
```
DELETE /api/assets/:id
```

## Project Structure

```
AtlasArchive/
├── src/
│   ├── models/
│   │   └── Asset.js          # Asset data model
│   ├── routes/
│   │   └── assets.js         # API routes
│   └── server.js             # Express server
├── public/
│   ├── index.html            # Main UI
│   ├── app.js                # Frontend JavaScript
│   └── styles.css            # Styles
├── assets/                   # Stored assets (categorized)
│   ├── ui/
│   ├── brand/
│   ├── illustrations/
│   └── templates/
├── data/
│   └── assets.json           # Asset metadata database
└── package.json
```

## Technologies Used

- **Backend**: Node.js, Express
- **File Upload**: Multer
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: File system with JSON metadata

## License

ISC
