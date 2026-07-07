# Razorpay Payment Integration - Complete Setup Guide

## 🎯 Overview

Your Kibana website is fully integrated with **Razorpay Payment Gateway**. Users can pay with:
- ✅ Credit Cards (Visa, Mastercard, RuPay)
- ✅ Debit Cards
- ✅ UPI (Google Pay, PhonePe, Paytm, etc.)
- ✅ Net Banking
- ✅ Digital Wallets
- ✅ EMI Options

All payments are **100% secure** with:
- End-to-end encryption
- PCI-DSS compliance
- Fraud detection
- Signature verification

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Node.js and npm installed
- ✅ Git configured
- ✅ Database running (PostgreSQL)
- ✅ Email configured (SMTP)
- ✅ Razorpay account (free)

---

## 🚀 Step 1: Create Razorpay Account

### Option A: New Account

1. Go to **[https://razorpay.com](https://razorpay.com)**
2. Click **"Sign Up"** button
3. Choose **"I want to create a business account"**
4. Fill in business details:
   - **Business Name**: Kibana
   - **Email**: your@email.com
   - **Phone**: +91XXXXXXXXXX
   - **Type of Business**: E-commerce / Retail
5. Set a secure password (min 8 characters)
6. Click **"Sign Up"**

### Option B: Existing Account

If you already have a Razorpay account, just skip to Step 2.

---

## 🔑 Step 2: Get Your API Keys

### Finding Your API Keys

1. Log in to **[Razorpay Dashboard](https://dashboard.razorpay.com)**
2. Click **Settings** (⚙️ icon) → **API Keys**
3. You'll see two tabs:
   - **Test** (for development/testing)
   - **Live** (for real payments)

### For Development (Test Keys)

1. Click the **Test** tab
2. You'll see:
   - **Key ID**: `rzp_test_XXXXXXXXXXXXX`
   - **Key Secret**: `XXXXXXXXXXXXXXXX` (click eye icon to reveal)
3. Copy both values

### For Production (Live Keys)

⚠️ **Only do this when ready for real payments**

1. Click the **Live** tab
2. You may need to complete KYC verification
3. Copy:
   - **Key ID**: `rzp_live_XXXXXXXXXXXXX`
   - **Key Secret**: `XXXXXXXXXXXXXXXX`

---

## 📝 Step 3: Add Keys to Environment Variables

### Update .env.local

Edit your `.env.local` file in the project root:

```env
# Razorpay Payment Gateway - TEST (Development)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=your_key_secret_here

# Example with real test keys:
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890ABCD
# RAZORPAY_KEY_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

### For Production

When going live, update to live keys:

```env
# Razorpay Payment Gateway - LIVE (Production)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### ⚠️ Important Security Notes

- ✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID` is safe to expose (client-side)
- ❌ `RAZORPAY_KEY_SECRET` is SECRET (server-side only)
- ❌ NEVER commit `.env.local` to Git
- ❌ NEVER share `RAZORPAY_KEY_SECRET`
- ✅ Use different keys for test and production
- ✅ Rotate keys periodically for security

---

## ✅ Step 4: Start and Test

### Restart Your Development Server

```bash
npm run dev
```

### Verify Configuration

Watch the console for startup message:

```
✅ Razorpay configuration detected
💳 Payment gateway ready for test payments
```

### Check the Payment Flow

1. Open http://localhost:3000
2. Add products to cart
3. Go to checkout
4. Fill delivery address
5. Select **"Debit / Credit Card"** payment method
6. Click **"Pay ₹XXXX"**

---

## 🧪 Step 5: Test with Test Cards

### Test Card Numbers

Use these test cards in the Razorpay checkout modal:

**✅ Successful Payment (Visa)**
```
Card Number: 4111 1111 1111 1111
Expiry: 12/30 (or any future date)
CVV: 123
Name: Test User
```

**❌ Failed Payment (Visa)**
```
Card Number: 4000 0000 0000 0002
Expiry: 12/30
CVV: 123
Name: Test User
```

**✅ Successful Payment (Mastercard)**
```
Card Number: 5555 5555 5555 4444
Expiry: 12/30
CVV: 123
Name: Test User
```

**✅ Successful Payment (RuPay)**
```
Card Number: 6073 7600 0000 0001
Expiry: 12/30
CVV: 123
Name: Test User
```

### Complete Test Flow

1. Fill in all checkout details
2. Select "Card" payment method
3. Click "Pay" button
4. Enter test card details above
5. OTP: Enter any 6-digit number
6. Should see: **"Order Placed Successfully!"**

### What Gets Logged

When payment succeeds, check server logs:

```
💰 Creating Razorpay order: ₹999 (99900 paise)
✅ Order created: order_ABC123XYZ
🎯 Opening Razorpay checkout...
💰 Payment successful, verifying...
🔐 Verifying payment: Order=...
✅ Signature verified successfully
✅ Payment verified: Status=captured, Amount=99900
```

---

## 🔐 Implementation Details

### Payment Architecture

```
User Interface (React)
        ↓
Cart + Checkout Page
        ↓
User selects Card payment
        ↓
Frontend calls /api/payments/create-order
        ↓
Backend creates Razorpay Order
        ↓
Razorpay Modal Opens (encrypted)
        ↓
User enters card details
        ↓
Razorpay processes payment
        ↓
Frontend receives: order_id, payment_id, signature
        ↓
Frontend calls /api/payments/verify-payment
        ↓
Backend verifies HMAC-SHA256 signature
        ↓
Backend confirms with Razorpay
        ↓
Order saved to database ✅
        ↓
User sees "Order Confirmed"
```

### API Endpoints

**Create Order** (`POST /api/payments/create-order`)
```json
Request: {
  "amount": 999,
  "currency": "INR",
  "receipt": "order_1234567890",
  "notes": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com"
  }
}

Response: {
  "success": true,
  "orderId": "order_ABC123XYZ",
  "amount": 99900,
  "currency": "INR"
}
```

**Verify Payment** (`POST /api/payments/verify-payment`)
```json
Request: {
  "razorpay_order_id": "order_ABC123XYZ",
  "razorpay_payment_id": "pay_ABC123XYZ",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}

Response: {
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_ABC123XYZ",
  "orderId": "order_ABC123XYZ",
  "amount": 99900,
  "currency": "INR",
  "status": "captured",
  "method": "card"
}
```

---

## 🐛 Troubleshooting

### Issue: "Payment gateway not configured"

**Cause**: Missing or incorrect API keys  
**Solution**:
1. Check `.env.local` has both keys
2. Restart server: `npm run dev`
3. Clear browser cache
4. Reload page

### Issue: "Authentication failed"

**Cause**: Invalid API secret key  
**Solution**:
1. Double-check key from Razorpay dashboard
2. Ensure no extra spaces
3. Use TEST keys for development
4. Restart server

### Issue: "Signature verification failed"

**Cause**: Secret key mismatch  
**Solution**:
1. Verify `RAZORPAY_KEY_SECRET` is exactly correct
2. Don't mix test and live keys
3. Check for typos
4. Check key is from correct environment (test/live)

### Issue: Order created but payment not verified

**Cause**: Network timeout or payment rejected  
**Solution**:
1. Check network connection
2. Verify with Razorpay Dashboard
3. Try again with test card
4. Check server logs for error details

### Issue: "Order saved but could not record in system"

**Cause**: Database connection issue  
**Solution**:
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env.local`
3. Test database connection: `npm run db:push`
4. Contact support with Payment ID

---

## 📊 Monitoring Payments

3. Save the file
4. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 4: Test Payment Integration

1. Visit your checkout page: `http://localhost:3003/checkout`
2. Add items to cart and proceed to checkout
3. Select **"Debit / Credit Card"** as payment method
4. Click **"Pay ₹[amount]"** button
5. Razorpay modal will appear
6. For testing, use these test card details:

### Test Card Details:
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3-4 digits (e.g., 123)
- **Name:** Any name

7. Complete the payment
8. You should see "Order Placed!" confirmation

## Step 5: Verify Payments in Razorpay Dashboard

1. Go to Razorpay Dashboard
2. Click **Payments** in the left sidebar
3. You'll see all payments (test and live)
4. Check payment status, amount, and details

## Important Security Notes

1. **Never commit `.env.local` to git** - It contains secrets
2. **Use Test Keys first** - Always test before going live
3. **Key Secret is sensitive** - Only use on backend (server-side)
4. **NEXT_PUBLIC_ prefix** - Key ID needs this because it's public (used in browser)

## Payment Methods Supported

With Razorpay, your customers can pay with:
- ✅ Credit Cards (Visa, Mastercard, RuPay)
- ✅ Debit Cards
- ✅ UPI (Google Pay, PhonePe, Paytm, etc.)
- ✅ Net Banking (All major Indian banks)
- ✅ Digital Wallets (Paytm, Amazon Pay, etc.)
- ✅ EMI Options

## Payment Flow

1. Customer selects "Debit / Credit Card" payment method
2. Clicks "Pay ₹[amount]" button
3. Razorpay secure checkout modal opens
4. Customer completes payment
5. Payment verified on backend
6. Order created in database
7. Order confirmation page shown

## Current Implementation Status

✅ **Completed:**
- Razorpay SDK integrated
- Payment creation API (`/api/payments/create-order`)
- Payment verification API (`/api/payments/verify-payment`)
- Checkout component with Razorpay modal
- Order database integration
- Success/error handling

✅ **Supported Payment Methods:**
- Credit Cards
- Debit Cards
- UPI
- And all other Razorpay payment methods

## Troubleshooting

### "Payment gateway not configured" error
- Check that `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`
- Restart dev server after updating `.env.local`

### Payment modal doesn't open
- Ensure Razorpay script loaded correctly
- Check browser console for errors (F12 → Console)
- Verify your API key is correct

### Payment fails with "Invalid signature"
- Check `RAZORPAY_KEY_SECRET` matches your account
- Ensure no extra spaces in `.env.local`
- Restart server after updating keys

### Test payments not appearing in dashboard
- Make sure you're using **Test Mode** keys
- Check Razorpay dashboard is in **Test Mode** (toggle in top right)

## Production Deployment

When ready to go live:

1. Get **Live Mode** API keys from Razorpay
2. Update `.env.local` with live keys (or better: use environment variables on your hosting platform)
3. Test a small payment with live keys
4. Update frontend to show live branding/messaging
5. Monitor payments in Razorpay dashboard

## Need Help?

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/contact-us
- API Status: https://status.razorpay.com/

---

**Next Steps:**
1. Get your API keys from Razorpay
2. Add them to `.env.local`
3. Restart dev server
4. Test payment with sample card details
5. Orders will be saved to your Supabase database on successful payment
