# 🚀 Razorpay Integration - Quick Reference

## 3-Step Setup

### Step 1️⃣ Get API Keys from Razorpay

```
1. Go to https://razorpay.com/dashboard
2. Click Settings → API Keys
3. Click on "Test" tab
4. Copy Key ID (starts with rzp_test_)
5. Copy Key Secret
```

### Step 2️⃣ Update .env.local

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=your_secret_here
```

### Step 3️⃣ Restart Server

```bash
npm run dev
```

---

## 🧪 Test Immediately

| Card | Number | Result |
|------|--------|--------|
| Visa (✅) | 4111 1111 1111 1111 | Success |
| Visa (❌) | 4000 0000 0000 0002 | Fails |
| Mastercard | 5555 5555 5555 4444 | Success |
| RuPay | 6073 7600 0000 0001 | Success |

**Expiry:** 12/30 | **CVV:** 123

---

## 💡 Key Points

✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID` → Safe to expose (client)  
❌ `RAZORPAY_KEY_SECRET` → Keep secret (server only)  
✅ Never commit `.env.local` to git  
✅ Use test keys for development  
✅ Use live keys for production  

---

## 📊 Flow Diagram

```
User Checkout
     ↓
Select "Card"
     ↓
Click "Pay ₹XXXX"
     ↓
Backend creates order
     ↓
Razorpay modal opens
     ↓
User enters card details
     ↓
Backend verifies payment
     ↓
Order saved ✅
     ↓
"Order Placed Successfully"
```

---

## 🔍 Debugging

### Check Logs

**Terminal** (where npm run dev is running):
```
💰 Creating Razorpay order: ₹999
✅ Order created: order_ABC123
🔐 Verifying payment...
✅ Payment verified successfully
```

### Check Payment in Dashboard

1. Go to https://dashboard.razorpay.com
2. Transactions → Payments
3. Find your test payment
4. Click to see details

---

## ❌ Troubleshooting

| Error | Fix |
|-------|-----|
| "Not configured" | Add keys, restart server |
| "Auth failed" | Copy secret exactly from dashboard |
| "Sig failed" | Don't mix test/live keys |
| Order not saved | Check database is running |

---

## 📞 Need Help?

- 📖 Full Guide: See `RAZORPAY_SETUP.md`
- 🎯 Status: See `RAZORPAY_IMPLEMENTATION_STATUS.md`
- 🌐 Razorpay Docs: https://razorpay.com/docs
- 💬 Support: https://razorpay.com/contact-us

---

## ✨ What's Ready

✅ Create order endpoint  
✅ Verify payment endpoint  
✅ Razorpay checkout component  
✅ Checkout page integration  
✅ Error handling  
✅ Security & validation  
✅ Comprehensive logging  
✅ Order database saving  

**Everything is done. Just add your keys! 🎉**
