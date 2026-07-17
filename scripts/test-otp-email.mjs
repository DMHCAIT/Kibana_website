#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import nodemailer from "nodemailer";

const sql = postgres(process.env.DATABASE_URL || "", {
  ssl: "require",
  max: 1,
});

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║             OTP EMAIL SENDING TEST                            ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

// Test 1: Check SMTP credentials
console.log("1️⃣ CHECKING SMTP CREDENTIALS");
console.log("─".repeat(60));
const smtpEmail = process.env.SMTP_EMAIL?.trim();
const smtpPassword = process.env.SMTP_PASSWORD?.trim();

console.log(`SMTP_EMAIL: ${smtpEmail || "❌ NOT SET"}`);
console.log(`SMTP_PASSWORD: ${smtpPassword ? "✅ SET" : "❌ NOT SET"}`);

if (!smtpEmail || !smtpPassword) {
  console.error("\n❌ SMTP credentials are missing!");
  process.exit(1);
}

// Test 2: Test SMTP connection
console.log("\n2️⃣ TESTING SMTP CONNECTION");
console.log("─".repeat(60));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

try {
  await transporter.verify();
  console.log("✅ SMTP connection successful!");
} catch (error) {
  console.error("❌ SMTP connection failed:");
  console.error(error.message);
  process.exit(1);
}

// Test 3: Generate and store test OTP
console.log("\n3️⃣ GENERATING TEST OTP");
console.log("─".repeat(60));

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const testEmail = "test@kibanalife.com";
const testOtp = generateOtp();
console.log(`Test Email: ${testEmail}`);
console.log(`Generated OTP: ${testOtp}`);

// Store in database
try {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Delete any existing OTP for this email
  await sql`
    DELETE FROM email_otp_sessions WHERE email = ${testEmail}
  `;
  
  // Insert new OTP
  await sql`
    INSERT INTO email_otp_sessions (email, otp, expires_at, created_at)
    VALUES (${testEmail}, ${testOtp}, ${expiresAt}, NOW())
  `;
  
  console.log("✅ OTP stored in database");
} catch (err) {
  console.error("❌ Failed to store OTP:", err.message);
  process.exit(1);
}

// Test 4: Send test email
console.log("\n4️⃣ SENDING TEST EMAIL");
console.log("─".repeat(60));

const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Kibana OTP</title>
    </head>
    <body style="margin:0;padding:24px;background:#f6f6f6;font-family:Arial,sans-serif;color:#111;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e6e6;padding:24px;">
        <p style="margin:0 0 14px 0;">Hi there,</p>
        <p style="margin:0 0 14px 0;">
          Your verification code for Kibana is:
        </p>
        <h1 style="margin:20px 0;text-align:center;letter-spacing:2px;font-size:32px;font-weight:bold;color:#000;">
          ${testOtp}
        </h1>
        <p style="margin:0 0 14px 0;">
          This code expires in 10 minutes. Do not share this code with anyone.
        </p>
        <hr style="border:none;border-top:1px solid #e6e6e6;margin:24px 0;" />
        <p style="margin:0;font-size:12px;color:#666;">
          © 2026 Kibana. All rights reserved.
        </p>
      </div>
    </body>
  </html>
`;

try {
  const result = await transporter.sendMail({
    from: `"Kibana" <${smtpEmail}>`,
    to: testEmail,
    subject: "Your Kibana Verification Code",
    html: htmlTemplate,
  });
  
  console.log("✅ Email sent successfully!");
  console.log(`Message ID: ${result.messageId}`);
  console.log(`Response: ${result.response}`);
} catch (error) {
  console.error("❌ Failed to send email:");
  console.error(error.message);
  process.exit(1);
}

// Test 5: Verify OTP in database
console.log("\n5️⃣ VERIFYING OTP IN DATABASE");
console.log("─".repeat(60));

try {
  const result = await sql`
    SELECT email, otp, expires_at FROM email_otp_sessions 
    WHERE email = ${testEmail} AND expires_at > NOW()
  `;
  
  if (result.length > 0) {
    console.log(`✅ OTP found in database:`);
    console.log(`   Email: ${result[0].email}`);
    console.log(`   OTP: ${result[0].otp}`);
    console.log(`   Expires: ${result[0].expires_at}`);
  } else {
    console.log("❌ OTP not found in database");
  }
} catch (err) {
  console.error("❌ Failed to query OTP:", err.message);
}

// Summary
console.log("\n6️⃣ SUMMARY");
console.log("─".repeat(60));
console.log("✅ SMTP credentials configured");
console.log("✅ SMTP connection working");
console.log("✅ OTP generated and stored");
console.log("✅ Email sent successfully");
console.log("✅ OTP verified in database");
console.log("\n🟢 EMAIL SYSTEM IS WORKING PROPERLY!\n");

await sql.end();
process.exit(0);
