const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
  console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '****' : 'NOT SET');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    console.log('\n🔍 Testing Gmail SMTP connection...');
    await transporter.verify();
    console.log('✓ Gmail SMTP connection verified!');

    console.log('\n📧 Sending test email...');
    await transporter.sendMail({
      from: `"Kibana" <${process.env.SMTP_EMAIL}>`,
      to: 'testsignup@gmail.com',
      subject: 'Test Email from Kibana',
      html: '<p>This is a test email. If you received this, the email service is working!</p>',
    });
    console.log('✓ Test email sent successfully!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testEmail();
