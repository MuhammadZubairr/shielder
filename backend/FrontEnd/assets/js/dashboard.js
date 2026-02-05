// Dashboard JavaScript - Modern ERP Style
// API_BASE_URL is defined globally by admin-auth.js
// getToken() and checkAuth() are defined globally by navbar.js

// API Headers with token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Format currency in PKR (Pakistani Rupees)
const formatCurrency = (amount) => {
  return 'Rs ' + new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Animate counter
function animateCounter(element, target, duration = 1000) {
  if (!element) return;
  
  const start = 0;
  const increment = target / (duration / 16); // 60 FPS
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return;

  // Load dashboard data
  loadDashboardStats();
  loadRecentTransactions();
  loadLowStockAlerts();
  loadMonthlyTrends(); // Load chart data (default to monthly)

  // Trend period button handlers
  const trendButtons = document.querySelectorAll('#trendPeriodButtons button');
  trendButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      trendButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Load trends based on period
      const period = this.getAttribute('data-period');
      loadTrendsByPeriod(period);
    });
  });

  // Logout functionality
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });

  // Refresh button
  const refreshBtn = document.querySelector('.btn-outline-secondary');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      location.reload();
    });
  }
});

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const response = await fetch(`${window.API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const data = await response.json();
    console.log('Dashboard stats received:', data);
    
    // The API returns data in data.overview, so pass that to display function
    displayDashboardStats(data.data.overview);
    
    // Update category chart with real data
    if (data.data.productsByCategory && window.updateCategoryChart) {
      window.updateCategoryChart(data.data.productsByCategory);
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    showAlert('Failed to load dashboard statistics', 'danger');
  }
}

// Display dashboard statistics with animations
function displayDashboardStats(stats) {
  console.log('=== DASHBOARD STATS DEBUG ===');
  console.log('Displaying stats:', stats);
  console.log('Total Products Value:', stats.totalProducts);
  
  // Update Total Products with animation
  const totalProductsEl = document.getElementById('total-products');
  console.log('Total Products Element:', totalProductsEl);
  if (totalProductsEl && stats.totalProducts !== undefined) {
    console.log('Animating total products to:', stats.totalProducts);
    animateCounter(totalProductsEl, stats.totalProducts);
  } else {
    console.error('Cannot display total products - Element:', totalProductsEl, 'Value:', stats.totalProducts);
  }

  // Update Stock Value with animation
  const stockValueEl = document.getElementById('stock-value');
  // The API returns stockValue as an object with totalValue property
  const stockValue = stats.stockValue?.totalValue || stats.totalValue || 0;
  if (stockValueEl) {
    // Animate and format as currency
    let currentValue = 0;
    const target = stockValue;
    const duration = 1000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= target) {
        stockValueEl.textContent = formatCurrency(target);
        clearInterval(timer);
      } else {
        stockValueEl.textContent = formatCurrency(Math.round(currentValue));
      }
    }, 16);
  }

  // Update Low Stock Items with animation
  const lowStockEl = document.getElementById('low-stock');
  // API returns lowStockProducts instead of lowStockCount
  const lowStockCount = stats.lowStockProducts || stats.lowStockCount || 0;
  if (lowStockEl) {
    animateCounter(lowStockEl, lowStockCount);
  }

  // Update Total Suppliers with animation
  const totalSuppliersEl = document.getElementById('total-suppliers');
  if (totalSuppliersEl && stats.totalSuppliers !== undefined) {
    animateCounter(totalSuppliersEl, stats.totalSuppliers);
  }

  // Backward compatibility - old IDs
  const totalProductsOld = document.getElementById('totalProducts');
  if (totalProductsOld) {
    totalProductsOld.textContent = stats.totalProducts || 0;
  }

  const totalSuppliersOld = document.getElementById('totalSuppliers');
  if (totalSuppliersOld) {
    totalSuppliersOld.textContent = stats.totalSuppliers || 0;
  }

  const lowStockCountOld = document.getElementById('lowStockCount');
  if (lowStockCountOld) {
    lowStockCountOld.textContent = lowStockCount;
  }

  const totalValueOld = document.getElementById('totalInventoryValue');
  if (totalValueOld) {
    totalValueOld.textContent = `$${(stats.totalInventoryValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const recentTransactionsCountEl = document.getElementById('recentTransactionsCount');
  if (recentTransactionsCountEl) {
    recentTransactionsCountEl.textContent = stats.recentTransactionsCount || 0;
  }

  // Categories breakdown (if you have a chart)
  if (stats.categoriesBreakdown && stats.categoriesBreakdown.length > 0) {
    displayCategoriesChart(stats.categoriesBreakdown);
  }
}

// Display categories breakdown (simple text version)
function displayCategoriesChart(categories) {
  const categoriesContainer = document.getElementById('categoriesBreakdown');
  if (!categoriesContainer) return;

  categoriesContainer.innerHTML = categories.map(cat => `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span>${cat._id}</span>
      <span class="badge bg-primary">${cat.count} items</span>
    </div>
  `).join('');
}

// Load recent transactions for dashboard
async function loadRecentTransactions() {
  const transactionsContainer = document.getElementById('recent-transactions');
  if (!transactionsContainer) return;

  try {
    const response = await fetch(`${window.API_BASE_URL}/transactions?limit=5&sort=-createdAt`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Transaction fetch failed:', response.status, errorData);
      throw new Error(`Failed to fetch transactions: ${response.status}`);
    }

    const result = await response.json();
    console.log('Transactions API response:', result);
    
    // Handle different response formats - backend returns { success: true, data: { transactions: [] } }
    let transactions = [];
    if (result.data && result.data.transactions) {
      transactions = result.data.transactions;
    } else if (Array.isArray(result.data)) {
      transactions = result.data;
    } else if (Array.isArray(result)) {
      transactions = result;
    }

    if (!transactions || transactions.length === 0) {
      transactionsContainer.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            No recent transactions
          </td>
        </tr>
      `;
      return;
    }

    transactionsContainer.innerHTML = transactions.map(transaction => {
      const typeIcon = transaction.type === 'stock_in' 
        ? '<i class="bi bi-arrow-down-circle text-success"></i>' 
        : '<i class="bi bi-arrow-up-circle text-danger"></i>';
      
      const typeText = transaction.type === 'stock_in' ? 'Stock In' : 'Stock Out';
      const typeBadgeClass = transaction.type === 'stock_in' ? 'bg-success' : 'bg-danger';
      
      const productName = transaction.product?.name || 'N/A';
      const statusBadge = `<span class="badge ${typeBadgeClass} badge-status">${transaction.status || 'completed'}</span>`;
      
      return `
        <tr class="fade-in">
          <td>
            ${typeIcon}
            <span class="ms-2 small">${typeText}</span>
          </td>
          <td class="fw-medium">${productName}</td>
          <td><span class="badge bg-secondary">${transaction.quantity}</span></td>
          <td class="small text-muted">${formatDate(transaction.transactionDate || transaction.createdAt)}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading recent transactions:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    transactionsContainer.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-danger">
          <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
          Failed to load transactions
          <div class="small mt-2">${error.message}</div>
        </td>
      </tr>
    `;
  }
}

// Load low stock alerts
async function loadLowStockAlerts() {
  const lowStockContainer = document.getElementById('low-stock-list');
  if (!lowStockContainer) return;

  try {
    const response = await fetch(`${window.API_BASE_URL}/dashboard/alerts/low-stock`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Low stock fetch failed:', response.status, errorData);
      throw new Error(`Failed to fetch low stock: ${response.status}`);
    }

    const data = await response.json();
    console.log('Low stock API response:', data);
    
    const products = data.data?.products || data.products || [];
    const total = data.data?.total || products.length;

    if (!products || products.length === 0) {
      lowStockContainer.innerHTML = `
        <div class="list-group-item text-center py-4 text-success">
          <i class="bi bi-check-circle fs-1 d-block mb-2"></i>
          All products are well stocked!
        </div>
      `;
      return;
    }

    // Update the count in the card header if it exists
    const lowStockCountEl = document.querySelector('.low-stock-count');
    if (lowStockCountEl) {
      lowStockCountEl.textContent = total;
    }
    
    // Update notification badge count
    const lowStockNotifEl = document.querySelector('.low-stock-count-notif');
    if (lowStockNotifEl) {
      lowStockNotifEl.textContent = total;
    }

    lowStockContainer.innerHTML = products.map(product => {
      const reorderLevel = product.reorderLevel || product.minimumStock || 10;
      const stockPercentage = Math.round((product.quantity / reorderLevel) * 100);
      const progressClass = stockPercentage < 25 ? 'bg-danger' : (stockPercentage < 50 ? 'bg-warning' : 'bg-primary');
      
      return `
        <a href="products.html" class="list-group-item list-group-item-action">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="mb-1 fw-semibold">${product.name}</h6>
              <small class="text-muted">${product.sku}</small>
            </div>
            <span class="badge bg-danger">${product.quantity} left</span>
          </div>
          <div class="progress" style="height: 4px;">
            <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${Math.min(stockPercentage, 100)}%"></div>
          </div>
          <small class="text-muted">Min stock: ${reorderLevel}</small>
        </a>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading low stock alerts:', error);
    if (lowStockContainer) {
      lowStockContainer.innerHTML = `
        <div class="list-group-item text-center py-4 text-danger">
          <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
          Failed to load low stock alerts
        </div>
      `;
    }
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Load monthly transaction trends for chart
async function loadMonthlyTrends() {
  try {
    const response = await fetch(`${window.API_BASE_URL}/dashboard/trends/monthly`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      console.error('Failed to fetch monthly trends');
      return;
    }

    const result = await response.json();
    const data = result.data;
    
    // Update the chart with real data
    updateInventoryTrendsChart(data.labels, data.stockIn, data.stockOut);
  } catch (error) {
    console.error('Error loading monthly trends:', error);
  }
}

// Load trends by period (week, month, year)
async function loadTrendsByPeriod(period) {
  try {
    const response = await fetch(`${window.API_BASE_URL}/dashboard/trends/${period}ly`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${period}ly trends`);
      return;
    }

    const result = await response.json();
    const data = result.data;
    
    // Update the chart with real data
    updateInventoryTrendsChart(data.labels, data.stockIn, data.stockOut);
  } catch (error) {
    console.error(`Error loading ${period}ly trends:`, error);
  }
}

// Logout handler
async function handleLogout() {
  try {
    await fetch(`${window.API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders()
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.clear();
    window.location.href = 'login.html';
  }
}
