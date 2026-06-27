import nodemailer from "nodemailer";

type EmailType = "signup" | "login";

interface OtpEmailOptions {
  email: string;
  otp: string;
  type: EmailType;
  name?: string;
}

let transporter: nodemailer.Transporter;

function initializeTransporter() {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    console.error("❌ Missing SMTP credentials:", {
      smtpEmail: !!smtpEmail,
      smtpPassword: !!smtpPassword,
    });
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });
}

function getTransporter() {
  if (!transporter) {
    initializeTransporter();
  }
  return transporter;
}

function getEmailTemplate(type: EmailType, otp: string, name?: string) {
  const safeName = name?.trim() || "there";
  const subjectLine = type === "signup" ? "verify your new account" : "verify your login";
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kibana OTP</title>
      </head>
      <body style="margin:0;padding:24px;background:#f6f6f6;font-family:Arial,sans-serif;color:#111;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e6e6;padding:24px;">
          <p style="margin:0 0 14px 0;">Hi ${safeName},</p>
          <p style="margin:0 0 14px 0;">
            You're just one step away from exploring stylish bags at Kibana.
          </p>
          <p style="margin:0 0 10px 0;">Please use this OTP to ${subjectLine}:</p>
          <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;letter-spacing:4px;">
            ${otp}
          </p>
          <p style="margin:0 0 16px 0;">
            For your security, this code will expire in <strong>10 minutes</strong>.
          </p>
          <p style="margin:0;">Happy shopping,<br />Team Kibana</p>
        </div>
      </body>
    </html>
  `;
}

export async function sendOtpEmail(options: OtpEmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const subjectText =
      options.type === "signup"
        ? "Your Kibana Signup Verification Code"
        : "Your Kibana Login Verification Code";

    const fromEmail = process.env.SMTP_FROM_EMAIL || "info@kibanalife.com";
    const mailOptions = {
      from: `"Kibana" <${fromEmail}>`,
      to: options.email,
      subject: subjectText,
      html: getEmailTemplate(options.type, options.otp, options.name),
    };

    console.log(`📧 sendOtpEmail: Preparing to send to ${options.email}`);
    console.log(`📧 From: ${process.env.SMTP_EMAIL}, Type: ${options.type}`);

    // Create a promise with timeout (30 seconds for slower connections)
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email send timeout after 30 seconds")), 30000),
    );

    console.log(`📧 Awaiting transporter.sendMail...`);
    await Promise.race([sendPromise, timeoutPromise]);

    console.log(`✓ Email successfully sent to ${options.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Exception while sending email to ${options.email}:`, error);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("✓ Gmail SMTP connection verified");
    return true;
  } catch (error) {
    console.error("✗ Gmail SMTP connection failed:", error);
    return false;
  }
}
