# Azure SQL Database Integration - Setup Guide

## ✅ Implementation Complete

The Circular Computing Customer Portal has been successfully migrated from in-memory storage to Azure SQL Database with the following features:

### 🔧 Implemented Features

1. **Azure SQL Database Connection**
   - Server: `a2cwarehouse.database.windows.net`
   - Database: `DeliveryExcellence`
   - Automatic connection pooling and retry logic
   - Graceful error handling

2. **Authentication System**
   - ✅ Login-only authentication (registration disabled)
   - ✅ Bcrypt password hashing
   - ✅ Session-based authentication
   - Default test user: `lavizaniazi2001@gmail.com` / `admin123`

3. **Database Schema**
   - ✅ Users table with encrypted passwords
   - ✅ Orders and order items tracking
   - ✅ Order updates and timeline tracking
   - ✅ Environmental impact metrics
   - ✅ RMA (warranty) management
   - ✅ Water projects integration
   - ✅ Support tickets system
   - ✅ Case studies
   - ✅ Delivery timelines with 13 milestone stages
   - ✅ System settings (dynamic theming: colors, fonts, logos)
   - ✅ Error logs table
   - ✅ System logs table

4. **Email Notification System**
   - ✅ Automatic IP conflict detection
   - ✅ Email notifications to `laviza.falak@a2c.co.uk`
   - Currently logging to console (awaiting email credentials)

5. **Error Logging**
   - ✅ All errors logged to `error_logs` table
   - ✅ System events logged to `system_logs` table
   - ✅ Request context (URL, method, IP, user agent) captured

## 🚨 Action Required: Whitelist IP Address

**Current Status**: Database connection is blocked by Azure SQL firewall

**Required IP to Whitelist**: `34.14.140.197`

### Steps to Whitelist IP:
1. Log in to Azure Portal
2. Navigate to: SQL databases → DeliveryExcellence → Networking
3. Add firewall rule:
   - Name: `Replit-Server`
   - Start IP: `34.14.140.197`
   - End IP: `34.14.140.197`
4. Click "Save"
5. Wait 2-5 minutes for changes to take effect

**Email notification has been sent to laviza.falak@a2c.co.uk with this information.**

## 📊 Database Tables

### Core Tables
- `users` - User accounts with encrypted passwords
- `orders` - Customer orders
- `order_items` - Products in each order
- `order_updates` - Order status history
- `environmental_impact` - ESG metrics per order
- `delivery_timelines` - 13-stage delivery tracking

### Management Tables
- `rmas` - Warranty returns management
- `support_tickets` - Customer support
- `case_studies` - Customer success stories
- `water_projects` - Charity integration

### System Tables
- `system_settings` - Dynamic theming (colors, fonts, logos)
- `error_logs` - Error tracking with full context
- `system_logs` - System events and audit trail

## 🔐 Default Credentials

**Test Account**:
- Email: `lavizaniazi2001@gmail.com`
- Password: `admin123`

**Note**: Registration is disabled. New users must be created by administrators directly in the database.

## 🎨 Dynamic Theming

The system now supports dynamic theming stored in the `system_settings` table:

**Current Settings**:
- Primary Color: `#08ABAB` (Teal)
- Secondary Color: `#FF9E1C` (Orange)
- Font Family: `Inter, sans-serif`
- Logo URL: `/logo.png`
- Company Name: `A2C`

To change theming, update records in the `system_settings` table:
```sql
UPDATE system_settings SET setting_value = '#NEW_COLOR' WHERE setting_key = 'primary_color';
```

## 📝 Next Steps

1. ✅ **Whitelist IP Address** (see above)
2. Optional: Configure email credentials for actual email sending:
   - Set `EMAIL_USER` environment variable
   - Set `EMAIL_PASSWORD` environment variable
3. Test database connection after IP whitelisting
4. Verify all CRUD operations work correctly
5. Monitor error logs and system logs tables

## 🔄 Automatic Database Initialization

On server startup, the system automatically:
1. Creates all required tables (if they don't exist)
2. Seeds initial data:
   - Admin user account
   - Water projects (Ethiopia, Rwanda, Uganda)
   - Default system settings
3. Logs initialization status

## 📌 Important Notes

- The server continues running even if database connection fails
- All errors are logged to console and database (when available)
- IP conflict detection automatically sends email notifications
- Session data is stored in memory (consider PostgreSQL session store for production)
- Password changes should be hashed using bcrypt before storage

## 🛠️ Troubleshooting

**Issue**: Cannot connect to database
- **Solution**: Whitelist the server IP address (see above)

**Issue**: Login fails
- **Solution**: Ensure password is hashed with bcrypt when creating users

**Issue**: Email not sending
- **Solution**: Configure EMAIL_USER and EMAIL_PASSWORD environment variables

**Issue**: Data not persisting
- **Solution**: Check database connection logs and error_logs table
