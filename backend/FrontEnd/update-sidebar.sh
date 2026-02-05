#!/bin/bash

# Script to update all HTML pages with the new sidebar system
# Run from FrontEnd directory

echo "Updating HTML pages with new sidebar system..."

# List of pages to update (excluding login.html, signup.html, index.html, dashboard.html)
pages=("warehouses.html" "warehouse-transfer.html" "stock-in.html" "stock-out.html" "reports.html" "users.html" "admin.html")

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "Processing $page..."
        
        # Check if page already has sidebar-container
        if grep -q "sidebar-container" "$page"; then
            echo "  ✓ $page already updated"
        else
            echo "  → Updating $page..."
            # This is a placeholder - manual updates needed
        fi
        
        # Check if sidebar.js is included
        if grep -q "sidebar.js" "$page"; then
            echo "  ✓ $page has sidebar.js"
        else
            echo "  ✗ $page needs sidebar.js added to scripts"
        fi
    fi
done

echo "Done! Please verify all pages."
