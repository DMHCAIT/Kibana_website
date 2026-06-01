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
    console.error('❌ Missing SMTP credentials:', { smtpEmail: !!smtpEmail, smtpPassword: !!smtpPassword });
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
  const greeting = name ? `Hello ${name}!` : "Hello!";
  const title = type === "signup" 
    ? "Welcome to Kibana"
    : "Welcome Back to Kibana";
  const subtitle = type === "signup"
    ? "Complete your signup to explore our exclusive luxury collection"
    : "Verify your identity to access your account";

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Kibana</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
          padding: 20px;
        }
        .email-wrapper { max-width: 600px; margin: 0 auto; }
        
        /* Header Section */
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 40px 30px;
          text-align: center;
          border-radius: 12px 12px 0 0;
        }
        .logo {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #ffffff;
          margin-bottom: 15px;
        }
        .header-subtitle {
          font-size: 13px;
          color: #b0b0b0;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        /* Main Content */
        .main-content {
          background: #ffffff;
          padding: 50px 40px;
          text-align: center;
        }
        
        .greeting-section {
          margin-bottom: 20px;
        }
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        .subtitle-text {
          font-size: 14px;
          color: #666666;
          margin-bottom: 35px;
          line-height: 1.8;
        }
        
        /* OTP Section */
        .otp-section {
          margin: 40px 0;
        }
        .otp-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999999;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .otp-container {
          background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 35px 30px;
          margin: 25px 0;
        }
        .otp-code {
          font-size: 48px;
          font-weight: 700;
          color: #000000;
          letter-spacing: 8px;
          font-family: 'Monaco', 'Courier New', monospace;
          margin: 0;
          word-break: break-all;
        }
        
        /* Info Section */
        .info-section {
          background: #f9f9f9;
          border-left: 4px solid #1a1a1a;
          padding: 20px 25px;
          margin: 30px 0;
          text-align: left;
          border-radius: 6px;
        }
        .info-section .info-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .info-section .info-text {
          font-size: 13px;
          color: #666666;
          line-height: 1.8;
        }
        
        /* Security Notice */
        .security-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 25px 0;
          padding: 15px;
          background: #fff9e6;
          border: 1px solid #ffe6a3;
          border-radius: 6px;
        }
        .security-icon {
          font-size: 20px;
        }
        .security-text {
          font-size: 13px;
          color: #b8860b;
          text-align: left;
        }
        
        /* Footer */
        .footer-section {
          background: #f5f5f5;
          padding: 40px;
          text-align: center;
          border-radius: 0 0 12px 12px;
          border-top: 1px solid #e0e0e0;
        }
        .footer-brand {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        .footer-tagline {
          font-size: 12px;
          color: #999999;
          margin-bottom: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        .footer-links a {
          font-size: 12px;
          color: #666666;
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-links a:hover {
          color: #1a1a1a;
        }
        .footer-contact {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .footer-contact p {
          font-size: 12px;
          color: #999999;
          margin: 5px 0;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
          .main-content { padding: 30px 25px; }
          .otp-code { font-size: 36px; letter-spacing: 6px; }
          .header { padding: 30px 20px; }
          .logo { font-size: 26px; }
          .footer-links { gap: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="logo">KIBANA</div>
          <div class="header-subtitle">Pure. Minimal. Luxe.</div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
          <div class="greeting-section">
            <div class="greeting">${greeting}</div>
            <div class="subtitle-text">${subtitle}</div>
          </div>
          
          <!-- OTP Display -->
          <div class="otp-section">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-container">
              <p class="otp-code">${otp}</p>
            </div>
          </div>
          
          <!-- Important Info -->
          <div class="info-section">
            <div class="info-title">⏱️ Important</div>
            <div class="info-text">
              This code is valid for <strong>10 minutes only</strong>. Do not share this code with anyone for security reasons.
            </div>
          </div>
          
          <!-- Security Notice -->
          <div class="security-section">
            <div class="security-icon">🔒</div>
            <div class="security-text">
              Your account is protected with industry-leading encryption. Never share your verification code.
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer-section">
          <div class="footer-brand">KIBANA</div>
          <div class="footer-tagline">Premium Vegan Leather Handbags</div>
          
          <div class="footer-links">
            <a href="https://www.kibanalife.com">Shop</a>
            <a href="https://www.kibanalife.com/about">About</a>
            <a href="https://www.kibanalife.com/contact">Support</a>
            <a href="https://www.kibanalife.com/returns">Returns</a>
          </div>
          
          <div class="footer-contact">
            <p>Questions? Email us at <strong>support@kibanalife.com</strong></p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Kibana. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlTemplate;
}

export async function sendOtpEmail(options: OtpEmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const subjectText = options.type === "signup" 
      ? "Your Kibana Signup Verification Code"
      : "Your Kibana Login Verification Code";

    const mailOptions = {
      from: `"Kibana" <${process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: subjectText,
      html: getEmailTemplate(options.type, options.otp, options.name),
    };

    console.log(`📧 sendOtpEmail: Preparing to send to ${options.email}`);
    console.log(`📧 From: ${process.env.SMTP_EMAIL}, Type: ${options.type}`);
    
    // Create a promise with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Email send timeout after 10 seconds")), 10000)
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
