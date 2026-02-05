/**
 * Sidebar Component Loader
 * Loads the sidebar HTML and sets the active navigation item
 */

// Load sidebar HTML
async function loadSidebar() {
  try {
    // Use relative path for better compatibility
    const response = await fetch('../components/sidebar.html');
    const sidebarHTML = await response.text();
    
    // Find the sidebar container and inject the HTML
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = sidebarHTML;
      
      // Set active navigation item based on current page
      setActiveNavItem();
      
      // Attach logout event listener
      attachLogoutListener();
    }
  } catch (error) {
    console.error('Error loading sidebar:', error);
    console.log('Sidebar fetch failed, this may happen when opening HTML files directly.');
    console.log('Please access via http://localhost:3001 instead of file://');
  }
}

// Set active navigation item based on current page
function setActiveNavItem() {
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'admin';
  
  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current page link
  const activeLink = document.querySelector(`.nav-link[data-page="${currentPage}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Attach logout listener to sidebar logout button
function attachLogoutListener() {
  const logoutBtn = document.querySelector('aside .logout-btn');
  if (logoutBtn && typeof handleLogout === 'function') {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// Load sidebar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
  loadSidebar();
}
