# SMTP Email Configuration Guide

The SMTP email system for signup/login verification has been fully implemented. To make it work, you need to configure Gmail SMTP credentials.

## Steps to Configure

### 1. Generate Gmail App Password

1. Go to [Google Account](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", make sure **2-Step Verification** is enabled
4. Scroll down to **App passwords** (only appears if 2FA is on)
5. Select **Mail** and **Windows Computer** (or your device)
6. Google will generate a **16-character password**
7. Copy this password (without spaces)

### 2. Update Environment Variables

Edit `.env.local` and update these lines:

```env
SMTP_EMAIL=info@kibanalife.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace:
- `SMTP_EMAIL` with the Gmail account email sending the emails (e.g., `info@kibanalife.com`)
- `SMTP_PASSWORD` with the 16-character app password (without spaces)

**Example:**
```env
SMTP_EMAIL=info@kibanalife.com
SMTP_PASSWORD=abcdefghijklmnop
```

### 3. Restart Dev Server

After updating `.env.local`, restart the development server:

```bash
npm run dev
```

## How It Works

### Signup Flow
1. User enters **Full Name**, **Phone Number**, and **Email**
2. System checks if email already exists
3. If new: generates 6-digit OTP and sends verification email
4. Email format: `"Hello [Name], your signup verification code for kibana: [OTP]"`
5. User receives email from: `kibana <info@kibanalife.com>`
6. After OTP verification: user account created with name, phone, email saved

### Login Flow
1. User enters **Email**
2. System checks if email exists
3. If found: generates 6-digit OTP and sends verification email
4. Email format: `"Hello, your login verification code for kibana: [OTP]"`
5. After OTP verification: user logged in with cart/order history displayed

### Existing Account Detection
- **Signup with existing email**: Shows "An account with this email already exists. Please sign in instead."
- **Login with non-existent email**: Shows "No account found with this email. Please sign up first."

## Current Status

✅ **Completed:**
- Email service (SMTP via nodemailer)
- OTP generation and storage
- Send OTP API route (`/api/auth/send-otp`)
- Verify OTP API route (`/api/auth/verify-otp`)
- Auth store updated for SMTP flow
- Auth modal updated with phone field
- Database integration ready
- Supabase user creation on verification
- User metadata stored (name, phone)

## Testing the System

1. **With Gmail configured:**
   ```bash
   npm run dev
   ```
   - Navigate to home page
   - Click "Sign Up"
   - Fill form with name, phone, email
   - Click "Send Verification Code"
   - Check Gmail inbox for OTP email
   - Enter OTP to complete signup

2. **Without Gmail configured:**
   - You'll see "Failed to send email. Please try again."
   - Follow steps above to configure SMTP

## Environment Variables

All SMTP variables are in `.env.local`:

```env
# SMTP Configuration for Email OTP
SMTP_EMAIL=info@kibanalife.com           # Sender email
SMTP_PASSWORD=your-16-char-gmail-app-password  # Gmail app password
```

No other configuration needed - the system uses Gmail's SMTP service automatically.

## Troubleshooting

### "Failed to send email" Error
- Check that Gmail app password is correct in `.env.local`
- Verify 2-Step Verification is enabled on Gmail account
- Ensure app password is copied without spaces
- Restart dev server after updating `.env.local`

### OTP Not Received
- Check spam/promotions folder in Gmail
- Verify sender email is correct
- Check OTP expiry (10 minutes)
- Try resending OTP

### "You already have an account" Message
- Email already exists in system
- Click "Log in" instead
- Use same email for login

## Email Templates

### Signup Email
```
Subject: Your Kibana Signup Verification Code
From: Kibana <info@kibanalife.com>

Hello [Name],
your signup verification code for kibana

[OTP - Large Text]

This code expires in 10 minutes
If you didn't request this code, you can safely ignore this email.

© 2026 Kibana. All rights reserved.
Premium Vegan Leather Handbags
```

### Login Email  
```
Subject: Your Kibana Login Verification Code
From: Kibana <info@kibanalife.com>

Hello,
your login verification code for kibana

[OTP - Large Text]

This code expires in 10 minutes
If you didn't request this code, you can safely ignore this email.

© 2026 Kibana. All rights reserved.
Premium Vegan Leather Handbags
```

## Production Deployment

For production, use environment variables through your hosting platform:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `SMTP_EMAIL` and `SMTP_PASSWORD`
3. Deploy normally

**Other Platforms:**
- Set environment variables through your hosting dashboard
- Ensure variables are set for production environment

---

**Need Help?** Check console logs in dev server for error details.
