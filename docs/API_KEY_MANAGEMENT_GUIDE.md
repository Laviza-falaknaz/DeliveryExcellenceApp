# API Key Management Guide

## Overview

The Circular Computing Customer Portal now includes a comprehensive API Key Management interface in the Admin Panel. This allows administrators to easily create, manage, and revoke API keys without needing command-line access.

---

## Accessing the API Key Management Interface

1. **Log in as Administrator**
   - Navigate to your portal: `https://your-portal.replit.app`
   - Log in with your admin credentials

2. **Navigate to Admin Panel**
   - Click on "Admin Dashboard" in the sidebar (only visible to admins)
   - Or go directly to: `https://your-portal.replit.app/admin`

3. **Open API Keys Tab**
   - Click on the **"API Keys"** tab in the admin dashboard
   - This is located between "Gamification" and "Theme" tabs

---

## Creating a New API Key

### Step-by-Step Process:

1. **Click "Create API Key" Button**
   - Located in the top-right corner of the API Keys page

2. **Enter Key Name**
   - Provide a descriptive name (e.g., "Production Power Automate", "Zapier Integration")
   - This helps you identify the purpose of each key later

3. **Generate the Key**
   - Click "Create API Key" button
   - The system generates a secure, cryptographically random key

4. **IMPORTANT: Copy and Save the Key**
   - **The full API key is shown only once** - you cannot retrieve it later
   - Click the "Copy" button to copy the key to your clipboard
   - Store it securely in your password manager or secure notes
   - Example API key format: `cc_2a09824936d31f92259d142bd2b6ce31d10138b591d3042c894fef9006c91d80`

5. **How to Use the Key**
   - The dialog shows you two authentication methods:
   
   **Option 1: X-API-Key Header (Recommended)**
   ```bash
   X-API-Key: cc_YOUR_KEY_HERE
   ```
   
   **Option 2: Authorization Bearer Token**
   ```bash
   Authorization: Bearer cc_YOUR_KEY_HERE
   ```

6. **Confirm You've Saved It**
   - Click "I've Saved My Key" to close the dialog

---

## Managing Existing API Keys

The API Keys table shows all your keys with the following information:

### Table Columns:

| Column | Description |
|--------|-------------|
| **Name** | Descriptive name you provided |
| **Key Prefix** | First 11 characters of the key (e.g., `cc_2a098249•••`) |
| **Status** | Active (green badge) or Revoked (gray badge) |
| **Last Used** | Timestamp of last API call using this key |
| **Created** | Date when the key was generated |
| **Actions** | Revoke or Delete buttons |

### Actions Available:

#### 1. **Revoke a Key**
- **Purpose**: Temporarily disable a key without deleting it
- **How**: Click "Revoke" button next to an active key
- **Effect**: Key immediately stops working for API calls
- **Use Case**: Suspect a key may be compromised or want to disable temporarily

#### 2. **Delete a Key**
- **Purpose**: Permanently remove a key from the system
- **How**: Click the trash icon, then confirm deletion
- **Effect**: Key is permanently deleted and cannot be recovered
- **Use Case**: Key is no longer needed (e.g., integration retired)

---

## Security Features

### 🔒 Secure Key Generation
- Keys are generated using cryptographically secure random bytes (256-bit)
- Prefix format: `cc_` followed by 64 hexadecimal characters

### 🔒 Secure Storage
- Full keys are **never** stored in the database
- Only bcrypt hashes are stored (same security as passwords)
- Only the key prefix (first 11 chars) is stored for identification

### 🔒 One-Time Display
- Full keys are shown only once upon creation
- Cannot be retrieved later for security reasons
- If lost, you must create a new key

### 🔒 Usage Tracking
- Every API call updates the `Last Used` timestamp
- Helps identify inactive keys that can be deleted

### 🔒 Never Expire
- API keys don't expire by default
- They remain active until manually revoked or deleted
- Good for long-term integrations like Power Automate

---

## Common Use Cases

### Power Automate Integration
1. Create key named "Production Power Automate"
2. Copy the key
3. In Power Automate HTTP action, add header:
   ```
   X-API-Key: cc_YOUR_KEY_HERE
   ```

### Zapier Integration
1. Create key named "Zapier Workflow"
2. Copy the key
3. In Zapier Webhooks, add to headers or use Bearer token

### Custom Application
1. Create key named "Custom App - Development"
2. Store key in environment variables
3. Include in all API requests to Data Push endpoints

### Testing
1. Create key named "Testing - Development"
2. Use for testing API integrations
3. Delete when done to keep production keys secure

---

## Alternative: Command-Line Key Generation

If you prefer command-line access, you can still use:

```bash
npx tsx scripts/generate-api-key.ts "Key Name Here"
```

This generates the same secure keys and stores them in the database.

---

## Troubleshooting

### "API key required" Error
- **Cause**: Missing API key in request
- **Solution**: Add `X-API-Key` header or `Authorization: Bearer` header

### "Unauthorized" or "Invalid API key" Error
- **Cause**: Wrong key or revoked key
- **Solutions**:
  - Verify you copied the entire key (starts with `cc_`)
  - Check if key was revoked in admin panel
  - Create a new key if original was lost

### Key Not Working After Creation
- **Cause**: Key not properly copied
- **Solution**: Double-check the key matches exactly (case-sensitive)

### Need to Regenerate Lost Key
- **Not Possible**: Keys cannot be retrieved once the dialog is closed
- **Solution**: Create a new key and update your integrations

---

## Best Practices

✅ **DO:**
- Use descriptive names for keys (identify purpose and environment)
- Create separate keys for different integrations
- Store keys securely (password manager, environment variables)
- Delete unused keys regularly
- Monitor "Last Used" to identify inactive keys

❌ **DON'T:**
- Share keys between multiple services
- Commit keys to version control (Git, GitHub, etc.)
- Store keys in plain text files
- Use production keys for testing
- Leave inactive keys active indefinitely

---

## Support

For issues with API key management or integrations, contact your system administrator or refer to the main [API Documentation](../API_DOCUMENTATION.md).
