import { getConnection, sql } from './db';
import bcrypt from 'bcryptjs';

export async function initializeDatabase() {
  try {
    const pool = await getConnection();
    console.log('📦 Initializing database schema...');

    // Create tables in order (respecting foreign key dependencies)
    
    // 1. Users table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        company NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        phone_number NVARCHAR(50),
        notification_preferences NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 2. Orders table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
      CREATE TABLE orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_number NVARCHAR(100) NOT NULL UNIQUE,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
        status NVARCHAR(50) NOT NULL DEFAULT 'placed',
        total_amount INT NOT NULL,
        saved_amount INT NOT NULL,
        order_date DATETIME2 DEFAULT GETDATE(),
        estimated_delivery DATETIME2,
        tracking_number NVARCHAR(255),
        shipping_address NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT chk_order_status CHECK (status IN ('placed', 'processing', 'in_production', 'quality_check', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'))
      );
    `);

    // 3. Order Items table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
      CREATE TABLE order_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id),
        product_name NVARCHAR(255) NOT NULL,
        product_description NVARCHAR(MAX) NOT NULL,
        quantity INT NOT NULL,
        unit_price INT NOT NULL,
        total_price INT NOT NULL,
        image_url NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 4. Order Updates table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_updates' AND xtype='U')
      CREATE TABLE order_updates (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id),
        status NVARCHAR(50) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        timestamp DATETIME2 DEFAULT GETDATE(),
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 5. Environmental Impact table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='environmental_impact' AND xtype='U')
      CREATE TABLE environmental_impact (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
        order_id INT FOREIGN KEY REFERENCES orders(id),
        carbon_saved INT NOT NULL,
        water_provided INT NOT NULL,
        minerals_saved INT NOT NULL,
        trees_equivalent INT NOT NULL,
        families_helped INT NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 6. RMAs table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='rmas' AND xtype='U')
      CREATE TABLE rmas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        rma_number NVARCHAR(100) NOT NULL UNIQUE,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
        order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id),
        status NVARCHAR(50) NOT NULL DEFAULT 'requested',
        reason NVARCHAR(MAX) NOT NULL,
        notes NVARCHAR(MAX),
        request_date DATETIME2 DEFAULT GETDATE(),
        resolution_date DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT chk_rma_status CHECK (status IN ('requested', 'approved', 'in_transit', 'received', 'processing', 'completed', 'rejected'))
      );
    `);

    // 7. Water Projects table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='water_projects' AND xtype='U')
      CREATE TABLE water_projects (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        location NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        people_impacted INT NOT NULL,
        water_provided INT NOT NULL,
        image_url NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 8. Support Tickets table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='support_tickets' AND xtype='U')
      CREATE TABLE support_tickets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ticket_number NVARCHAR(100) NOT NULL UNIQUE,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
        order_id INT FOREIGN KEY REFERENCES orders(id),
        subject NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'open',
        priority NVARCHAR(50) NOT NULL DEFAULT 'medium',
        category NVARCHAR(100) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT chk_ticket_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        CONSTRAINT chk_ticket_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
      );
    `);

    // 9. Case Studies table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='case_studies' AND xtype='U')
      CREATE TABLE case_studies (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
        organisation_name NVARCHAR(255) NOT NULL,
        contact_name NVARCHAR(255) NOT NULL,
        contact_email NVARCHAR(255) NOT NULL,
        industry NVARCHAR(100) NOT NULL,
        devices_purchased INT NOT NULL,
        story NVARCHAR(MAX) NOT NULL,
        impact_achieved NVARCHAR(MAX),
        approved BIT DEFAULT 0,
        featured BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 10. Delivery Timelines table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='delivery_timelines' AND xtype='U')
      CREATE TABLE delivery_timelines (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id),
        order_placed BIT DEFAULT 0,
        customer_success_call_booked BIT DEFAULT 0,
        rate_your_experience BIT DEFAULT 0,
        customer_success_intro_call BIT DEFAULT 0,
        order_in_progress BIT DEFAULT 0,
        order_being_built BIT DEFAULT 0,
        quality_checks BIT DEFAULT 0,
        ready_for_delivery BIT DEFAULT 0,
        order_delivered BIT DEFAULT 0,
        rate_your_product BIT DEFAULT 0,
        customer_success_call_booked_post BIT DEFAULT 0,
        customer_success_check_in BIT DEFAULT 0,
        order_completed BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 11. System Settings table (for dynamic theming)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_settings' AND xtype='U')
      CREATE TABLE system_settings (
        id INT IDENTITY(1,1) PRIMARY KEY,
        setting_key NVARCHAR(100) NOT NULL UNIQUE,
        setting_value NVARCHAR(MAX),
        setting_type NVARCHAR(50) NOT NULL,
        description NVARCHAR(MAX),
        updated_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 12. Error Logs table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='error_logs' AND xtype='U')
      CREATE TABLE error_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT FOREIGN KEY REFERENCES users(id),
        error_type NVARCHAR(100) NOT NULL,
        error_message NVARCHAR(MAX) NOT NULL,
        stack_trace NVARCHAR(MAX),
        request_url NVARCHAR(MAX),
        request_method NVARCHAR(10),
        ip_address NVARCHAR(50),
        user_agent NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `);

    // 13. System Logs table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_logs' AND xtype='U')
      CREATE TABLE system_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        log_level NVARCHAR(20) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        metadata NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT chk_log_level CHECK (log_level IN ('info', 'warn', 'error', 'debug'))
      );
    `);

    console.log('✅ Database schema initialized successfully');

    // Seed initial data
    await seedInitialData(pool);
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

async function seedInitialData(pool: sql.ConnectionPool) {
  console.log('🌱 Seeding initial data...');

  // Check if initial user exists
  const userCheck = await pool.request()
    .input('email', sql.NVarChar, 'lavizaniazi2001@gmail.com')
    .query('SELECT id FROM users WHERE email = @email');

  if (userCheck.recordset.length === 0) {
    // Create initial admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.request()
      .input('username', sql.NVarChar, 'lavizaniazi2001@gmail.com')
      .input('password', sql.NVarChar, hashedPassword)
      .input('name', sql.NVarChar, 'Admin User')
      .input('company', sql.NVarChar, 'A2C')
      .input('email', sql.NVarChar, 'lavizaniazi2001@gmail.com')
      .input('notificationPreferences', sql.NVarChar, JSON.stringify({
        orderUpdates: true,
        environmentalImpact: true,
        charityUpdates: true,
        serviceReminders: true
      }))
      .query(`
        INSERT INTO users (username, password, name, company, email, notification_preferences)
        VALUES (@username, @password, @name, @company, @email, @notificationPreferences)
      `);
    
    console.log('✅ Initial admin user created');
  }

  // Seed water projects if they don't exist
  const projectCheck = await pool.request()
    .query('SELECT COUNT(*) as count FROM water_projects');

  if (projectCheck.recordset[0].count === 0) {
    const projects = [
      {
        name: 'Ethiopia Clean Water Initiative',
        location: 'Ethiopia',
        description: 'This project is providing clean water access to rural communities in Ethiopia, focusing on sustainable well construction and community education on water management.',
        peopleImpacted: 1200,
        waterProvided: 3000000,
        imageUrl: '/attached_assets/Ethiopia.png'
      },
      {
        name: 'Rwanda Clean Water Project',
        location: 'Rwanda',
        description: 'Building sustainable water infrastructure in rural Rwanda to provide clean drinking water and improve sanitation facilities.',
        peopleImpacted: 850,
        waterProvided: 1850000,
        imageUrl: '/attached_assets/Rwanda.png'
      },
      {
        name: 'Uganda Rainwater Harvesting',
        location: 'Uganda',
        description: 'Implementing rainwater harvesting systems to collect and store clean water for communities in drought-prone regions of Uganda.',
        peopleImpacted: 730,
        waterProvided: 1450000,
        imageUrl: '/attached_assets/Uganda.png'
      }
    ];

    for (const project of projects) {
      await pool.request()
        .input('name', sql.NVarChar, project.name)
        .input('location', sql.NVarChar, project.location)
        .input('description', sql.NVarChar, project.description)
        .input('peopleImpacted', sql.Int, project.peopleImpacted)
        .input('waterProvided', sql.Int, project.waterProvided)
        .input('imageUrl', sql.NVarChar, project.imageUrl)
        .query(`
          INSERT INTO water_projects (name, location, description, people_impacted, water_provided, image_url)
          VALUES (@name, @location, @description, @peopleImpacted, @waterProvided, @imageUrl)
        `);
    }

    console.log('✅ Water projects seeded');
  }

  // Seed default system settings
  const settingsCheck = await pool.request()
    .query('SELECT COUNT(*) as count FROM system_settings');

  if (settingsCheck.recordset[0].count === 0) {
    const settings = [
      { key: 'primary_color', value: '#08ABAB', type: 'color', description: 'Primary brand color' },
      { key: 'secondary_color', value: '#FF9E1C', type: 'color', description: 'Secondary brand color' },
      { key: 'font_family', value: 'Inter, sans-serif', type: 'text', description: 'Main font family' },
      { key: 'logo_url', value: '/logo.png', type: 'url', description: 'Company logo URL' },
      { key: 'company_name', value: 'A2C', type: 'text', description: 'Company name' }
    ];

    for (const setting of settings) {
      await pool.request()
        .input('key', sql.NVarChar, setting.key)
        .input('value', sql.NVarChar, setting.value)
        .input('type', sql.NVarChar, setting.type)
        .input('description', sql.NVarChar, setting.description)
        .query(`
          INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
          VALUES (@key, @value, @type, @description)
        `);
    }

    console.log('✅ System settings seeded');
  }

  console.log('✅ Initial data seeding completed');
}
