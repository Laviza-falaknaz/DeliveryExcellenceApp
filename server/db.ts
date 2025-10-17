import sql from 'mssql';
import { sendEmail } from './email-service';

const config: sql.config = {
  server: 'a2cwarehouse.database.windows.net',
  database: 'DeliveryExcellence',
  user: 'CbqvYOy5SKI47n1566hk',
  password: 'ZUXG+!^3pcsL)tY7PIqhuH',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await sql.connect(config);
    console.log('✅ Connected to Azure SQL Database');
    return pool;
  } catch (error: any) {
    console.error('❌ Database connection error:', error.message);
    
    // Check if it's an IP whitelist error
    if (error.message?.includes('firewall') || error.message?.includes('IP') || error.code === 'ELOGIN') {
      await sendEmail({
        to: 'laviza.falak@a2c.co.uk',
        subject: 'Database IP Whitelist Request - Urgent',
        html: `
          <h2>Database IP Whitelist Request</h2>
          <p>The application failed to connect to the Azure SQL Database due to IP restrictions.</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Action Required:</strong> Please whitelist the current server IP address in Azure SQL firewall rules.</p>
          <hr>
          <p>To get the current IP, you can check the Azure SQL connection logs or use an IP lookup service.</p>
        `,
      });
    }
    
    throw error;
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('🔌 Database connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

export { sql };
