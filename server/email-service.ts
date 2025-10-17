import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Configure nodemailer transporter
// Note: For production, use environment variables for email credentials
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com', // or your SMTP server
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'noreply@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: options.from || 'A2C Delivery Portal <noreply@a2c.co.uk>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email send error:', error);
    // Don't throw - we don't want email failures to crash the app
  }
}
