# How to Use Stock-In and Stock-Out Pages

## Stock-In Page (Receiving Inventory)

### When to Use
- Receiving new shipment from supplier
- Adding inventory to warehouse
- Restocking products

### Step-by-Step Instructions

1. **Login**
   - Must be logged in as Admin, Manager, or Staff
   - Navigate to Stock-In page from sidebar

2. **Select Product**
   - Choose product from dropdown
   - Current stock level will be displayed below

3. **Select Supplier (Optional)**
   - Choose the supplier who provided the stock
   - Can be left empty if not applicable

4. **Enter Quantity**
   - Enter the number of units received
   - Must be at least 1

5. **Enter Unit Price**
   - Enter the price per unit
   - Supports decimal values (e.g., 25.50)
   - Must be 0 or greater

6. **Add Notes (Optional)**
   - Add any additional information
   - Maximum 500 characters
   - Examples: "Invoice #12345", "Batch #ABC123"

7. **Submit**
   - Click Submit button
   - Success message will show new stock level
   - Form will reset for next entry
   - Recent transactions table will update

### Example Scenario
```
Product: Laptop - Dell XPS 13
Supplier: Tech Solutions Inc.
Quantity: 10
Unit Price: 1299.99
Notes: Invoice #INV-2024-001, Batch #JAN2024
```

**Result**: Stock increases by 10 units, total value calculated automatically (10 × $1299.99 = $12,999.90)

---

## Stock-Out Page (Removing Inventory)

### When to Use
- Selling products to customers
- Removing damaged/expired items
- Returning products to supplier
- Internal transfers (until transfer feature is added)

### Step-by-Step Instructions

1. **Login**
   - Must be logged in as Admin, Manager, or Staff
   - Navigate to Stock-Out page from sidebar

2. **Select Product**
   - Choose product from dropdown
   - Available stock level will be displayed

3. **Enter Quantity**
   - Enter the number of units to remove
   - Cannot exceed available stock
   - System will show error if quantity too high

4. **Enter Unit Price**
   - Enter the price per unit for this transaction
   - For sales: selling price
   - For damage/expired: original cost
   - Supports decimal values

5. **Select Reason (Optional)**
   - Choose why stock is being removed:
     - **Sale**: Product sold to customer
     - **Damage**: Product damaged and unusable
     - **Expired**: Product past expiration date
     - **Return**: Returned to supplier
     - **Other**: Other reasons

6. **Add Notes (Optional)**
   - Add any additional information
   - Maximum 500 characters
   - Examples: "Customer order #123", "Water damage"

7. **Submit**
   - Click Submit button
   - Success message will show remaining stock
   - Form will reset for next entry
   - Recent transactions table will update

### Example Scenarios

#### Scenario 1: Customer Sale
```
Product: Laptop - Dell XPS 13
Quantity: 2
Unit Price: 1599.99
Reason: Sale
Notes: Customer Order #ORD-2024-055
```
**Result**: Stock decreases by 2 units, revenue recorded as $3,199.98

#### Scenario 2: Damaged Goods
```
Product: Wireless Mouse
Quantity: 5
Unit Price: 29.99
Reason: Damage
Notes: Water damage from warehouse leak
```
**Result**: Stock decreases by 5 units, loss recorded as $149.95

#### Scenario 3: Expired Items
```
Product: Batteries AA (Pack of 10)
Quantity: 20
Unit Price: 12.50
Reason: Expired
Notes: Expiry date: 12/2024
```
**Result**: Stock decreases by 20 units, loss recorded as $250.00

---

## Validation Rules

### Stock-In Validation
- ✅ Product is required
- ✅ Quantity must be ≥ 1
- ✅ Unit Price must be ≥ 0
- ✅ Supplier is optional
- ✅ Notes max 500 characters

### Stock-Out Validation
- ✅ Product is required
- ✅ Quantity must be ≥ 1
- ✅ Quantity cannot exceed available stock
- ✅ Unit Price must be ≥ 0
- ✅ Reason is optional
- ✅ Notes max 500 characters

---

## Common Error Messages

### "Please select a product"
**Cause**: No product selected from dropdown
**Solution**: Choose a product before submitting

### "Please enter a valid quantity"
**Cause**: Quantity is 0, negative, or empty
**Solution**: Enter a positive number

### "Please enter a valid unit price"
**Cause**: Price is negative or empty
**Solution**: Enter 0 or a positive number

### "Insufficient stock! Available: X, Requested: Y"
**Cause**: Trying to remove more stock than available (Stock-Out only)
**Solution**: Reduce quantity to available amount or less

### "Failed to record transaction"
**Cause**: Server error or validation failed
**Solution**: Check internet connection, verify all fields are correct, contact admin if persists

---

## Recent Transactions Table

Both pages show a table of the 10 most recent transactions:

### Columns Displayed
- **Transaction #**: Unique transaction number (e.g., TXN-20240101-001)
- **Product**: Product name
- **Quantity**: Units added or removed
- **Date**: When transaction was created
- **Notes**: Any notes added to transaction

### Features
- Auto-updates after each successful transaction
- Shows "No recent transactions" if empty
- Transactions are sorted by date (newest first)

---

## Tips and Best Practices

### For Stock-In
1. **Always include supplier** for purchased inventory
2. **Add invoice number** in notes for tracking
3. **Verify quantity** matches delivery note
4. **Check unit price** matches purchase order

### For Stock-Out
1. **Select appropriate reason** for accurate reporting
2. **Add customer order number** for sales in notes
3. **Document damage details** for insurance claims
4. **Double-check quantity** before submitting

### General
1. **Review recent transactions** to verify entry
2. **Check stock levels** after submission
3. **Contact admin** if you notice discrepancies
4. **Keep notes concise** but informative

---

## Permissions Required

| Action | Admin | Manager | Staff | Viewer |
|--------|-------|---------|-------|--------|
| View Stock-In Page | ✅ | ✅ | ✅ | ❌ |
| Create Stock-In | ✅ | ✅ | ✅ | ❌ |
| View Stock-Out Page | ✅ | ✅ | ✅ | ❌ |
| Create Stock-Out | ✅ | ✅ | ✅ | ❌ |
| View Transactions | ✅ | ✅ | ✅ | ❌ |

**Note**: Viewer role cannot access these pages or create transactions.

---

## Troubleshooting

### Products not loading
- Check internet connection
- Verify you're logged in
- Refresh the page
- Contact admin if issue persists

### Suppliers not loading (Stock-In)
- Only active suppliers are shown
- If no suppliers appear, contact admin to add suppliers

### Form not submitting
- Check all required fields are filled
- Verify unit price is not negative
- For Stock-Out: ensure quantity doesn't exceed available stock
- Check browser console for errors

### Stock level not updating
- Wait a few seconds and refresh the page
- Check recent transactions table to verify transaction was created
- If transaction appears but stock didn't update, contact admin

---

## Need Help?

Contact your system administrator or refer to:
- `/docs/STOCK_TRANSACTIONS_FIXED.md` - Technical documentation
- `/BackEnd/API_DOCUMENTATION.md` - API reference
- `/docs/USER_MANAGEMENT_GUIDE.md` - User permissions guide
