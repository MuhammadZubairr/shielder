/**
 * Sidebar Auto-Scroll to Active Item
 * Automatically scrolls the sidebar to show the active menu item when page loads
 */

document.addEventListener('DOMContentLoaded', function() {
  const sidebarNav = document.querySelector('aside nav.flex-grow-1');
  const activeLink = document.querySelector('.nav-link.active');
  
  if (sidebarNav && activeLink) {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      const navRect = sidebarNav.getBoundingClientRect();
      const activeLinkRect = activeLink.getBoundingClientRect();
      
      // Calculate if the active link is visible in the nav viewport
      const isVisible = (
        activeLinkRect.top >= navRect.top &&
        activeLinkRect.bottom <= navRect.bottom
      );
      
      // If the active link is not visible, scroll it into view within the nav container
      if (!isVisible) {
        // Calculate the scroll position needed to center the active link
        const navScrollTop = sidebarNav.scrollTop;
        const activeLinkOffsetTop = activeLink.offsetTop;
        const navHeight = sidebarNav.clientHeight;
        const activeLinkHeight = activeLink.clientHeight;
        
        // Center the active link in the nav viewport
        const targetScrollTop = activeLinkOffsetTop - (navHeight / 2) + (activeLinkHeight / 2);
        
        // Smooth scroll to the target position
        sidebarNav.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  }
});
