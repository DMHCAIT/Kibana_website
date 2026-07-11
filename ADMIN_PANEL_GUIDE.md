# Admin Panel - Product Management Guide

## ✅ What I've Added

I've enhanced your admin panel with the following improvements:

### 1. **Product Title Field for Each Variant** ✨ NEW
- Added a "Product Title (Display Name)" field for each color variant
- This allows you to set custom display names for each variant (e.g., "Lekha Envelope Vegan Leather Zip Around Women's Wallet - [Wine]")
- The title will appear on the website instead of the generic product name

### 2. **Stock Management** (Already Existed - Now Confirmed)
- Toggle button to mark variants as "In Stock" or "Out of Stock"
- Stock Quantity field to specify how many items are available
- When a variant is marked "Out of Stock", it will display correctly on the website

### 3. **Automatic Display Updates**
- All changes made in the admin panel are automatically saved to the database
- Website updates reflect these changes immediately (no manual sync needed)
- Out of stock products show an overlay on product images with "OUT OF STOCK" text

---

## 📋 How to Use

### **Step 1: Log in to Admin Panel**
- Go to: `http://localhost:3001/admin/products`
- Login with your admin credentials (password: `Kibana@2026`)

### **Step 2: Edit Product Titles**

**For the main product name:**
1. Click on the product you want to edit
2. In the "Basic Information" section, update the "Product Name" field
3. Click "Save Product"

**For variant-specific titles:**
1. Click on a product to edit
2. Scroll down to the "Color Variants" section
3. Click on the color variant you want to edit (e.g., "wine", "milky blue")
4. The variant details panel will expand showing:
   - **Product Title (Display Name)** - NEW FIELD! Enter the custom title here
   - **Variant Image** - Change the image for this color
   - **Stock Quantity** - Set how many are available
   - **Stock Status** - Toggle between "In Stock" / "Out of Stock"
5. Make your changes
6. Scroll back to the top and click "Save Product"

### **Step 3: Manage Stock Status**

For each color variant:
1. Click on the variant to expand its details
2. Look for the stock toggle button showing either:
   - 🟢 **In Stock** (green) - Product is available
   - 🔴 **Out of Stock** (red) - Product is not available
3. Click the toggle to change the status
4. Set the "Stock Quantity" number
5. Save the product

### **Step 4: Verify Changes on Website**

After saving in the admin panel:

1. **Check product title:**
   - Go to `http://localhost:3001/shop/product-slug?color=wine`
   - The custom title should appear at the top of the product page
   - It also appears in the "You may also like" section

2. **Check out of stock display:**
   - If you marked a variant as out of stock
   - You'll see: ❌ "OUT OF STOCK" overlay on product image
   - The "Add to Cart" button will be disabled and show "Out of Stock"
   - The quantity selector will be hidden

3. **Check related products:**
   - Scroll to "You may also like" section
   - All variant names should show the custom titles you set

---

## 🔄 Current Status

**All 14 products have been synced to the Supabase database with:**
- ✅ Updated product names for wine variant and others
- ✅ Color variant metadata
- ✅ Stock quantity and status
- ✅ Product images and gallery

**Website is reading from:** 🗄️ Supabase PostgreSQL Database
**Not from:** 📄 JSON files (these are fallback only)

---

## ⚙️ Technical Details

### Fields Now Editable in Admin:
```
Product Level:
- Product Name
- Description
- Price & Compare At Price
- Category, Gender, Tags
- Features & Specifications

Variant Level (Per Color):
- Color/Variant Name
- Product Title (Display Name) ← NEW!
- Variant Image
- Gallery Images
- Stock Quantity
- In Stock Status (Toggle)
```

### How Changes Are Saved:
1. Admin makes change → Form validates → Auto-saves to database
2. Database updates → Website reads latest data
3. Website displays updated info immediately

### Database Table:
- Table: `products`
- Column: `color_variants` (JSON array)
- Each variant in the array includes:
  - `color` - Color name
  - `slug` - Color slug
  - `productTitle` - Display name (NEW!)
  - `stockQty` - Number in stock
  - `inStock` - Boolean (true/false)
  - `image` - Variant main image
  - `gallery` - Array of gallery images

---

## 🐛 Troubleshooting

### "Changes not showing on website?"
1. Check if you clicked "Save Product" (button at top right)
2. Wait 2-3 seconds for database to process
3. Refresh website page (Ctrl+Shift+R for hard refresh)
4. Check browser console for errors (F12)

### "Stock status toggle not working?"
1. Make sure you're clicking the toggle button (green/red)
2. Verify the product saved successfully (look for green checkmark)
3. Check the stock quantity field is set to a number > 0

### "Custom titles not appearing in related products?"
1. Verify you saved the product
2. Check that the variant's color slug matches the URL parameter
3. Clear browser cache and refresh (Ctrl+Shift+R)

---

## 📝 Example: Update Wine Variant

**Task:** Change Lekha Wallet wine variant to show as "Sold Out"

**Steps:**
1. Go to Admin → Products
2. Click on "Lekha Wallet" product
3. Scroll to "Color Variants" section
4. Click on "wine" variant
5. In expanded panel:
   - See the red toggle showing "Out of Stock"
   - Click it to toggle (if it says "In Stock", click to change to "Out of Stock")
   - Verify Stock Quantity is set
6. Scroll to top → Click "Save Product"
7. Go to website `localhost:3001/shop/lekha-wallet?color=wine`
8. You should see "OUT OF STOCK" overlay on the product image

---

## ✨ Best Practices

1. **Always fill in Product Titles** for each variant so customers see meaningful names
2. **Keep Stock Quantities Updated** - Update regularly as inventory changes
3. **Use meaningful color names** - "Wine", "Milky Blue" instead of "color-1", "color-2"
4. **Test on website** - After changes, check the website to confirm they appear
5. **Monitor "Out of Stock"** - Review regularly and update when items are back in stock

---

## 📞 Need Help?

If something isn't working:
1. Check the browser console (F12 → Console tab) for error messages
2. Check that database connection is working (should see products list)
3. Ensure you're logged in (admin_token cookie is set)
4. Try refreshing the admin page and making changes again
