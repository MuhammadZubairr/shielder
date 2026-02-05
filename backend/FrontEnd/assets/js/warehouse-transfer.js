// Warehouse Transfer JavaScript
// API_BASE_URL is provided by navbar.js

// Note: getToken(), checkAuth(), and handleLogout() are provided by navbar.js

// API Headers with token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// DOM Elements
let transferForm;
let productSelect;
let fromWarehouseSelect;
let toWarehouseSelect;
let quantityInput;
let sourceStockInfo;
let destStockInfo;
let transfersTableBody;
let searchTransfers;

let products = [];
let warehouses = [];
let currentProduct = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return;

  // Get DOM elements
  transferForm = document.getElementById('transferForm');
  productSelect = document.getElementById('productSelect');
  fromWarehouseSelect = document.getElementById('fromWarehouseSelect');
  toWarehouseSelect = document.getElementById('toWarehouseSelect');
  quantityInput = document.getElementById('quantityInput');
  sourceStockInfo = document.getElementById('sourceStockInfo');
  destStockInfo = document.getElementById('destStockInfo');
  transfersTableBody = document.getElementById('transfersTableBody');
  searchTransfers = document.getElementById('searchTransfers');

  // Load initial data
  loadProducts();
  loadWarehouses();
  loadRecentTransfers();

  // Event listeners
  if (transferForm) {
    transferForm.addEventListener('submit', handleTransfer);
  }

  if (productSelect) {
    productSelect.addEventListener('change', handleProductChange);
  }

  if (fromWarehouseSelect) {
    fromWarehouseSelect.addEventListener('change', updateStockInfo);
  }

  if (toWarehouseSelect) {
    toWarehouseSelect.addEventListener('change', updateStockInfo);
  }

  if (searchTransfers) {
    searchTransfers.addEventListener('input', debounce(loadRecentTransfers, 500));
  }

  // Logout functionality
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });
});

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Load products
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    products = data.data.products;

    // Populate product dropdown
    if (productSelect) {
      productSelect.innerHTML = '<option value="">Select product...</option>' +
        products.map(product => `
          <option value="${product._id}">${product.name} (${product.sku})</option>
        `).join('');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    showAlert('Failed to load products: ' + error.message, 'danger');
  }
}

// Load warehouses
async function loadWarehouses() {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouses/active/list`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch warehouses');
    }

    const data = await response.json();
    warehouses = data.data.warehouses;

    // Populate warehouse dropdowns
    const warehouseOptions = warehouses.map(warehouse => `
      <option value="${warehouse._id}">${warehouse.name} (${warehouse.code})</option>
    `).join('');

    if (fromWarehouseSelect) {
      fromWarehouseSelect.innerHTML = '<option value="">Select source warehouse...</option>' + warehouseOptions;
    }

    if (toWarehouseSelect) {
      toWarehouseSelect.innerHTML = '<option value="">Select destination warehouse...</option>' + warehouseOptions;
    }
  } catch (error) {
    console.error('Error loading warehouses:', error);
    showAlert('Failed to load warehouses: ' + error.message, 'danger');
  }
}

// Handle product change
function handleProductChange() {
  const productId = productSelect.value;
  currentProduct = products.find(p => p._id === productId);
  updateStockInfo();
}

// Update stock information
function updateStockInfo() {
  if (!currentProduct) {
    sourceStockInfo.innerHTML = '';
    destStockInfo.innerHTML = '';
    return;
  }

  const fromWarehouseId = fromWarehouseSelect.value;
  const toWarehouseId = toWarehouseSelect.value;

  // Show source warehouse stock
  if (fromWarehouseId && currentProduct.warehouseStock) {
    const sourceStock = currentProduct.warehouseStock.find(
      ws => ws.warehouse === fromWarehouseId || ws.warehouse._id === fromWarehouseId
    );

    if (sourceStock) {
      sourceStockInfo.innerHTML = `
        <div class="alert alert-info py-2 mb-0">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Available:</strong> ${sourceStock.quantity} units
          ${sourceStock.quantity <= sourceStock.minStockLevel ? 
            '<span class="badge bg-warning ms-2">Low Stock</span>' : ''}
        </div>
      `;

      // Set max quantity
      if (quantityInput) {
        quantityInput.max = sourceStock.quantity;
      }
    } else {
      sourceStockInfo.innerHTML = `
        <div class="alert alert-danger py-2 mb-0">
          <i class="bi bi-exclamation-triangle me-1"></i>
          Product not available in this warehouse
        </div>
      `;
    }
  } else {
    sourceStockInfo.innerHTML = '';
  }

  // Show destination warehouse stock
  if (toWarehouseId && currentProduct.warehouseStock) {
    const destStock = currentProduct.warehouseStock.find(
      ws => ws.warehouse === toWarehouseId || ws.warehouse._id === toWarehouseId
    );

    if (destStock) {
      destStockInfo.innerHTML = `
        <div class="alert alert-secondary py-2 mb-0">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Current Stock:</strong> ${destStock.quantity} units
        </div>
      `;
    } else {
      destStockInfo.innerHTML = `
        <div class="alert alert-secondary py-2 mb-0">
          <i class="bi bi-info-circle me-1"></i>
          Product will be added to this warehouse
        </div>
      `;
    }
  } else {
    destStockInfo.innerHTML = '';
  }
}

// Handle transfer
async function handleTransfer(e) {
  e.preventDefault();

  const formData = new FormData(transferForm);
  const transferData = {
    productId: formData.get('productId'),
    fromWarehouse: formData.get('fromWarehouse'),
    toWarehouse: formData.get('toWarehouse'),
    quantity: parseInt(formData.get('quantity')),
    notes: formData.get('notes') || ''
  };

  // Validation
  if (transferData.fromWarehouse === transferData.toWarehouse) {
    showAlert('Source and destination warehouses must be different', 'warning');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/warehouses/transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transferData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to transfer inventory');
    }

    showAlert(data.message || 'Inventory transferred successfully!', 'success');
    
    // Reset form
    transferForm.reset();
    sourceStockInfo.innerHTML = '';
    destStockInfo.innerHTML = '';
    currentProduct = null;

    // Reload data
    loadProducts();
    loadRecentTransfers();
  } catch (error) {
    console.error('Error transferring inventory:', error);
    showAlert(error.message, 'danger');
  }
}

// Load recent transfers
async function loadRecentTransfers() {
  try {
    const params = new URLSearchParams();
    
    if (searchTransfers && searchTransfers.value) {
      params.append('search', searchTransfers.value);
    }

    // Get transfers with warehouse populated
    const response = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transfers');
    }

    const data = await response.json();
    
    // Filter only transfer transactions (stock_out only to avoid duplicates)
    // Each transfer creates 2 transactions: stock_out and stock_in
    // We only show stock_out to avoid showing the same transfer twice
    const transfers = data.data.transactions.filter(t => 
      t.notes && t.notes.includes('Transfer from') && t.type === 'stock_out'
    );

    displayTransfers(transfers);
  } catch (error) {
    console.error('Error loading transfers:', error);
    if (transfersTableBody) {
      transfersTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }
}

// Display transfers
function displayTransfers(transfers) {
  if (!transfersTableBody) return;

  if (!transfers || transfers.length === 0) {
    transfersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No transfers found</td></tr>';
    return;
  }

  transfersTableBody.innerHTML = transfers.map(transfer => {
    const date = new Date(transfer.transactionDate);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Parse transfer note to get destination warehouse
    // Format: "Transfer from [Source] to [Destination]"
    let destinationName = 'N/A';
    if (transfer.notes) {
      const match = transfer.notes.match(/Transfer from .+ to (.+)/);
      if (match) {
        destinationName = match[1];
      }
    }
    
    return `
      <tr>
        <td><small>${formattedDate}</small></td>
        <td>
          ${transfer.product?.name || 'N/A'}
          <br><small class="text-muted">${transfer.product?.sku || ''}</small>
        </td>
        <td>${transfer.warehouse?.name || 'N/A'}</td>
        <td>${destinationName}</td>
        <td><strong>${transfer.quantity}</strong> units</td>
        <td>${transfer.performedBy?.name || transfer.performedBy?.email || 'Unknown'}</td>
        <td><small class="text-muted">${transfer.notes || '-'}</small></td>
      </tr>
    `;
  }).join('');
}

// Show alert
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Note: handleLogout() is provided by navbar.js
