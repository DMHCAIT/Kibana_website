import nodemailer from "nodemailer";

type EmailType = "signup" | "login";

interface OtpEmailOptions {
  email: string;
  otp: string;
  type: EmailType;
  name?: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderConfirmationOptions {
  email: string;
  name: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  placedAt: string;
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
    const smtpEmail = process.env.SMTP_EMAIL?.trim();
    const smtpPassword = process.env.SMTP_PASSWORD?.trim();
    const configuredFromEmail = process.env.SMTP_FROM_EMAIL?.trim();

    if (!smtpEmail || !smtpPassword) {
      console.error("❌ Missing SMTP credentials for OTP email", {
        hasSmtpEmail: !!smtpEmail,
        hasSmtpPassword: !!smtpPassword,
      });
      return false;
    }

    const transporter = getTransporter();

    const subjectText =
      options.type === "signup"
        ? "Your Kibana Signup Verification Code"
        : "Your Kibana Login Verification Code";

    // Gmail SMTP usually rejects arbitrary "from" addresses unless configured as aliases.
    // Always default to the authenticated mailbox to maximize delivery reliability.
    const effectiveFromEmail = smtpEmail || configuredFromEmail || "info@kibanalife.com";
    const mailOptions = {
      from: `"Kibana" <${effectiveFromEmail}>`,
      to: options.email,
      subject: subjectText,
      html: getEmailTemplate(options.type, options.otp, options.name),
      ...(configuredFromEmail ? { replyTo: configuredFromEmail } : {}),
    };

    console.log(`📧 sendOtpEmail: Preparing to send to ${options.email}`);
    console.log(`📧 Sender: ${effectiveFromEmail}, Type: ${options.type}`);

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

function getOrderConfirmationTemplate(options: OrderConfirmationOptions) {
  const safeName = options.name?.trim() || "there";
  const itemsHtml = options.items
    .map(
      (item) => `
        <tr style="border-bottom:1px solid #e6e6e6;">
          <td style="padding:12px 0;text-align:left;">${item.name}</td>
          <td style="padding:12px 0;text-align:center;">x${item.quantity}</td>
          <td style="padding:12px 0;text-align:right;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
        </tr>
      `,
    )
    .join("");

  const formattedDate = new Date(options.placedAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
      </head>
      <body style="margin:0;padding:24px;background:#f6f6f6;font-family:Arial,sans-serif;color:#333;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e6e6;padding:32px;">
          <!-- Header -->
          <div style="border-bottom:2px solid #f0f0f0;padding-bottom:24px;margin-bottom:24px;">
            <h1 style="margin:0;font-size:28px;color:#111;">Order Confirmed! ✓</h1>
            <p style="margin:8px 0 0 0;color:#666;font-size:14px;">Thank you for your purchase</p>
          </div>

          <!-- Greeting -->
          <p style="margin:0 0 24px 0;font-size:16px;">Hi ${safeName},</p>
          <p style="margin:0 0 24px 0;color:#666;line-height:1.6;">
            Your order has been successfully placed! We're thrilled to ship your stylish items. Below are your order details.
          </p>

          <!-- Order Details -->
          <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin-bottom:24px;">
            <p style="margin:0 0 12px 0;font-size:14px;color:#666;"><strong>Order ID:</strong> ${options.orderId}</p>
            <p style="margin:0 0 12px 0;font-size:14px;color:#666;"><strong>Order Date:</strong> ${formattedDate}</p>
            <p style="margin:0;font-size:14px;color:#666;"><strong>Payment Method:</strong> ${options.paymentMethod}</p>
          </div>

          <!-- Items Table -->
          <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 16px 0;font-size:16px;color:#111;">Order Items</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:2px solid #e6e6e6;background:#f9f9f9;">
                  <th style="padding:12px 0;text-align:left;font-weight:600;color:#333;">Product</th>
                  <th style="padding:12px 0;text-align:center;font-weight:600;color:#333;">Quantity</th>
                  <th style="padding:12px 0;text-align:right;font-weight:600;color:#333;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div style="text-align:right;padding:16px 0;border-top:2px solid #e6e6e6;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#111;">
              Total: ₹${options.total.toLocaleString("en-IN")}
            </p>
          </div>

          <!-- Shipping Address -->
          <div style="background:#f0f8ff;padding:16px;border-radius:8px;margin:24px 0;">
            <h4 style="margin:0 0 12px 0;color:#333;">Shipping Address</h4>
            <p style="margin:0;color:#666;font-size:14px;line-height:1.6;white-space:pre-wrap;">${options.shippingAddress}</p>
          </div>

          <!-- Call to Action -->
          <p style="margin:24px 0;text-align:center;">
            <a href="https://www.kibanalife.com/orders" style="background:#111;color:#fff;padding:12px 32px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:600;">
              Track Your Order
            </a>
          </p>

          <!-- Footer -->
          <div style="border-top:1px solid #e6e6e6;padding-top:24px;text-align:center;color:#999;font-size:12px;">
            <p style="margin:0 0 8px 0;">If you have any questions, please contact us at <strong>info@kibanalife.com</strong></p>
            <p style="margin:0;">Happy shopping,<br />Team Kibana</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendOrderConfirmationEmail(
  options: OrderConfirmationOptions,
): Promise<boolean> {
  try {
    const smtpEmail = process.env.SMTP_EMAIL?.trim();
    const smtpPassword = process.env.SMTP_PASSWORD?.trim();
    const configuredFromEmail = process.env.SMTP_FROM_EMAIL?.trim();

    if (!smtpEmail || !smtpPassword) {
      console.error("❌ Missing SMTP credentials for order confirmation email", {
        hasSmtpEmail: !!smtpEmail,
        hasSmtpPassword: !!smtpPassword,
      });
      return false;
    }

    const transporter = getTransporter();
    const effectiveFromEmail = smtpEmail || configuredFromEmail || "info@kibanalife.com";

    const mailOptions = {
      from: `"Kibana" <${effectiveFromEmail}>`,
      to: options.email,
      subject: `Order Confirmation - ${options.orderId} | Kibana`,
      html: getOrderConfirmationTemplate(options),
      ...(configuredFromEmail ? { replyTo: configuredFromEmail } : {}),
    };

    console.log(
      `📧 sendOrderConfirmationEmail: Preparing to send to ${options.email} for order ${options.orderId}`,
    );

    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Email send timeout after 30 seconds")),
        30000,
      ),
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log(`✓ Order confirmation email successfully sent to ${options.email}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Exception while sending order confirmation email to ${options.email}:`,
      error,
    );
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
