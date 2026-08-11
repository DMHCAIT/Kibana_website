import nodemailer from "nodemailer";

const smtpEmail = "info@kibanalife.com";
const smtpPassword = "alahvvfkhtrqqazt";

console.log("🔍 Testing SMTP Configuration and Email Sending...\n");
console.log(`SMTP Email: ${smtpEmail}`);
console.log(`SMTP Password: ${smtpPassword ? "✓ Set" : "✗ Not set"}`);

try {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  console.log("\n⏳ Testing SMTP connection...");
  await transporter.verify();
  console.log("✅ SMTP Connection Verified!");

  console.log("\n📧 Sending test OTP email...");
  const testOtp = "123456";
  const testEmail = "test@kibanalife.com";

  const mailOptions = {
    from: `"Kibana" <${smtpEmail}>`,
    to: testEmail,
    subject: "Your Kibana Login Verification Code",
    html: `
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
              You're just one step away from exploring stylish bags at Kibana.
            </p>
            <p style="margin:0 0 10px 0;">Please use this OTP to verify your login:</p>
            <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;letter-spacing:4px;">
              ${testOtp}
            </p>
            <p style="margin:0 0 16px 0;">
              For your security, this code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="margin:0;">Happy shopping,<br />Team Kibana</p>
          </div>
        </body>
      </html>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log("✅ Email sent successfully!");
  console.log(`   Response ID: ${result.response}`);

  await transporter.close();
  console.log("\n✅ All tests passed!");
} catch (error) {
  console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
