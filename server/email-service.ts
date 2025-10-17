interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Log email to console for now
    // In production, this would use a proper email service like SendGrid, AWS SES, or nodemailer
    console.log('📧 Email notification:');
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Body: ${options.html}`);
    
    // TODO: Implement actual email sending when email credentials are configured
    // For now, just log to console
  } catch (error) {
    console.error('❌ Email send error:', error);
    // Don't throw - we don't want email failures to crash the app
  }
}
