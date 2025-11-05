import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

interface RmaNotificationData {
  rmaNumber: string;
  customerName: string;
  customerEmail: string;
  productDetails: string;
  serialNumber: string;
  faultDescription: string;
}

interface NewUserNotificationData {
  userName: string;
  userEmail: string;
  userCompany: string;
  rmaNumber?: string;
}

export async function sendRmaNotification(
  recipients: string[],
  rmaData: RmaNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!recipients || recipients.length === 0) {
      console.log('No RMA notification recipients configured, skipping email');
      return { success: true };
    }

    const { client, fromEmail } = await getUncachableResendClient();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #08ABAB; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-top: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New RMA Request Received</h1>
            </div>
            <div class="content">
              <p>A new RMA (Return Merchandise Authorization) request has been submitted.</p>
              
              <div class="field">
                <div class="label">RMA Number:</div>
                <div class="value">${rmaData.rmaNumber}</div>
              </div>
              
              <div class="field">
                <div class="label">Customer Name:</div>
                <div class="value">${rmaData.customerName}</div>
              </div>
              
              <div class="field">
                <div class="label">Customer Email:</div>
                <div class="value">${rmaData.customerEmail}</div>
              </div>
              
              <div class="field">
                <div class="label">Product Details:</div>
                <div class="value">${rmaData.productDetails}</div>
              </div>
              
              <div class="field">
                <div class="label">Serial Number:</div>
                <div class="value">${rmaData.serialNumber}</div>
              </div>
              
              <div class="field">
                <div class="label">Fault Description:</div>
                <div class="value">${rmaData.faultDescription}</div>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from Circular Computing Customer Portal</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await client.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `New RMA Request: ${rmaData.rmaNumber}`,
      html: htmlContent,
    });

    console.log(`RMA notification sent successfully to ${recipients.join(', ')}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send RMA notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function sendNewUserNotification(
  recipients: string[],
  userData: NewUserNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!recipients || recipients.length === 0) {
      console.log('No new user notification recipients configured, skipping email');
      return { success: true };
    }

    const { client, fromEmail } = await getUncachableResendClient();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9E1C; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-top: 5px; }
            .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New User Approval Required</h1>
            </div>
            <div class="content">
              <div class="alert">
                <strong>Action Required:</strong> A new user account has been created and requires admin approval.
              </div>
              
              <div class="field">
                <div class="label">User Name:</div>
                <div class="value">${userData.userName}</div>
              </div>
              
              <div class="field">
                <div class="label">Email Address:</div>
                <div class="value">${userData.userEmail}</div>
              </div>
              
              <div class="field">
                <div class="label">Company:</div>
                <div class="value">${userData.userCompany}</div>
              </div>
              
              ${userData.rmaNumber ? `
              <div class="field">
                <div class="label">Related RMA:</div>
                <div class="value">${userData.rmaNumber}</div>
              </div>
              ` : ''}
              
              <p style="margin-top: 20px;">
                Please log in to the admin portal to review and approve this user account.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from Circular Computing Customer Portal</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await client.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `New User Approval Required: ${userData.userName}`,
      html: htmlContent,
    });

    console.log(`New user notification sent successfully to ${recipients.join(', ')}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send new user notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
