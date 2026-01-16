// Load assets on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAssets();
    setupUploadForm();
});

// Setup upload form handler
function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];
        
        if (!file) {
            showStatus('Please select a file', 'error');
            return;
        }

        // Append category first so multer can use it for destination
        formData.append('category', document.getElementById('category').value);
        formData.append('name', document.getElementById('name').value || file.name);
        formData.append('description', document.getElementById('description').value);
        formData.append('tags', document.getElementById('tags').value);
        formData.append('file', file);

        try {
            const response = await fetch('/api/assets', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showStatus('Asset uploaded successfully!', 'success');
                form.reset();
                loadAssets();
            } else {
                showStatus(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        }
    });
}

// Load and display assets
async function loadAssets() {
    const search = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;

    let url = '/api/assets?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            displayAssets(result.data);
            document.getElementById('assetsCount').textContent = 
                `${result.count} asset${result.count !== 1 ? 's' : ''} found`;
        } else {
            showStatus(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    }
}

// Display assets in grid
function displayAssets(assets) {
    const assetsList = document.getElementById('assetsList');
    
    if (assets.length === 0) {
        assetsList.innerHTML = '<div class="no-assets">No assets found. Upload your first asset to get started!</div>';
        return;
    }

    assetsList.innerHTML = assets.map(asset => `
        <div class="asset-card" onclick="showAssetDetail('${asset.id}')">
            <span class="asset-category">${formatCategory(asset.category)}</span>
            <h3>${escapeHtml(asset.name)}</h3>
            <div class="asset-info">Type: ${asset.type.toUpperCase()}</div>
            <div class="asset-info">Version: ${asset.version}</div>
            ${asset.description ? `<div class="asset-info">${escapeHtml(asset.description)}</div>` : ''}
            ${asset.tags.length > 0 ? `
                <div class="asset-tags">
                    ${asset.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Show asset detail modal
async function showAssetDetail(id) {
    try {
        const response = await fetch(`/api/assets/${id}`);
        const result = await response.json();

        if (result.success) {
            const asset = result.data;
            const detailHtml = `
                <h2>${escapeHtml(asset.name)}</h2>
                <span class="asset-category">${formatCategory(asset.category)}</span>
                
                <div style="margin: 20px 0;">
                    <strong>Type:</strong> ${asset.type.toUpperCase()}<br>
                    <strong>Current Version:</strong> ${asset.version}<br>
                    <strong>Created:</strong> ${new Date(asset.createdAt).toLocaleString()}<br>
                    <strong>Last Updated:</strong> ${new Date(asset.updatedAt).toLocaleString()}<br>
                    ${asset.description ? `<strong>Description:</strong> ${escapeHtml(asset.description)}<br>` : ''}
                    ${asset.tags.length > 0 ? `
                        <strong>Tags:</strong>
                        <div class="asset-tags" style="display: inline-flex; gap: 5px; margin-left: 10px;">
                            ${asset.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>

                ${asset.versions && asset.versions.length > 0 ? `
                    <div class="version-history">
                        <h3>Version History</h3>
                        ${asset.versions.map(v => `
                            <div class="version-item">
                                <strong>Version ${v.version}</strong> - 
                                ${new Date(v.createdAt).toLocaleString()}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div style="margin-top: 20px;">
                    <button onclick="deleteAsset('${asset.id}')" class="btn btn-danger">Delete Asset</button>
                </div>
            `;

            document.getElementById('assetDetail').innerHTML = detailHtml;
            document.getElementById('assetModal').style.display = 'block';
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('assetModal').style.display = 'none';
}

// Delete asset
async function deleteAsset(id) {
    if (!confirm('Are you sure you want to delete this asset?')) {
        return;
    }

    try {
        const response = await fetch(`/api/assets/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            showStatus('Asset deleted successfully', 'success');
            loadAssets();
        } else {
            showStatus(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    }
}

// Show status message
function showStatus(message, type) {
    const statusEl = document.getElementById('uploadStatus');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}

// Format category name
function formatCategory(category) {
    const categoryNames = {
        'ui': 'UI Files',
        'brand': 'Brand Assets',
        'illustrations': 'Illustrations',
        'templates': 'Templates'
    };
    return categoryNames[category] || category;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('assetModal');
    if (event.target === modal) {
        closeModal();
    }
}
