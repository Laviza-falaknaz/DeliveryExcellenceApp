# Circular Computing Customer Portal - API Documentation

## Quick Start

**Your Production API Key:** `cc_7101cbf99d27c5a98e3cefc80f79fb28b94e194a289c139b179655d8f565cb28`

Use this key in all your Power Automate flows and external integrations. This key never expires unless you revoke it.

---

## Table of Contents

1. [Data Push APIs](#data-push-apis) - **Primary Integration Method** ⭐
2. [Warranty Lookup API](#warranty-lookup-api) - Public endpoint
3. [API Key Management](#api-key-management) - Admin only
4. [Portal APIs](#portal-apis) - Internal use
5. [Legacy CRUD APIs](#legacy-crud-apis) - Deprecated

---

# Data Push APIs

The Data Push APIs are the **recommended method** for integrating external systems like Power Automate, Zapier, or custom applications with the Customer Portal. These APIs allow you to synchronize data using upsert operations (create if new, update if exists).

## Authentication

All Data Push APIs require API key authentication. Include your API key in one of two ways:

**Option 1: X-API-Key Header (Recommended)**
```bash
X-API-Key: cc_7101cbf99d27c5a98e3cefc80f79fb28b94e194a289c139b179655d8f565cb28
```

**Option 2: Authorization Bearer Token**
```bash
Authorization: Bearer cc_7101cbf99d27c5a98e3cefc80f79fb28b94e194a289c139b179655d8f565cb28
```

## Power Automate Configuration

When setting up HTTP requests in Power Automate:

1. **Method**: `POST`
2. **URI**: `https://your-portal.replit.app/api/data/users/upsert`
3. **Headers**:
   - `Content-Type`: `application/json`
   - `X-API-Key`: `cc_7101cbf99d27c5a98e3cefc80f79fb28b94e194a289c139b179655d8f565cb28`
4. **Body**: Your JSON payload (see examples below)

---

## 1. Users Upsert API

Create or update users in bulk.

**Endpoint:** `POST /api/data/users/upsert`

**Request Body:**
```json
{
  "users": [
    {
      "username": "john.doe@company.com",
      "password": "PlainTextPassword123",
      "name": "John Doe",
      "company": "ABC Corporation",
      "email": "john.doe@company.com",
      "phoneNumber": "+44 7700 900123",
      "isAdmin": false,
      "isActive": true
    }
  ]
}
```

**Field Requirements:**
- `username` (required): Unique username, typically email
- `password` (required): Can be **plain text** or bcrypt hashed. System automatically detects and hashes plain text passwords before storage
- `name` (required): Full name
- `company` (required): Company name
- `email` (required): Email address (used for linking orders and RMAs)
- `phoneNumber` (optional): Phone number with country code
- `isAdmin` (optional): Boolean, defaults to false
- `isActive` (optional): Boolean, defaults to true. Set to false to deactivate user account (prevents login)

**Response:**
```json
{
  "success": true,
  "created": 1,
  "updated": 0,
  "errors": []
}
```

**Example cURL:**
```bash
curl -X POST https://your-portal.replit.app/api/data/users/upsert \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cc_7101cbf99d27c5a98e3cefc80f79fb28b94e194a289c139b179655d8f565cb28" \
  -d '{
    "users": [
      {
        "username": "jane.smith@company.com",
        "password": "SecurePassword123!",
        "name": "Jane Smith",
        "company": "Tech Corp",
        "email": "jane.smith@company.com",
        "phoneNumber": "+44 7700 900456",
        "isAdmin": false,
        "isActive": true
      }
    ]
  }'
```

**User Activation/Deactivation:**
- Set `isActive: false` to deactivate a user account
- Deactivated users cannot login and will receive the message: "Your account has been deactivated. Please contact your administrator for assistance."
- Set `isActive: true` to reactivate a user account

**Password Handling:**
- Send passwords in **plain text** - the system automatically encrypts them with bcrypt before storage
- The system detects if a password is already hashed (starts with `$2a$` or `$2b$`) and skips re-hashing
- This allows your external system to send plain text passwords without needing bcrypt encryption capability

---

## 2. Orders Upsert API

Create or update orders and automatically link them to users via email.

**Endpoint:** `POST /api/data/orders/upsert`

**Request Body:**
```json
{
  "orders": [
    {
      "orderNumber": "ORD-2024-12345",
      "email": "john.doe@company.com",
      "customerName": "John Doe",
      "orderDate": "2024-10-15T10:30:00.000Z",
      "status": "shipped",
      "totalAmount": 1299,
      "savedAmount": 300,
      "estimatedDelivery": "2024-10-20T00:00:00.000Z",
      "trackingNumber": "1Z999AA10123456784",
      "shippingAddress": {
        "street": "123 Main Street",
        "city": "London",
        "state": "Greater London",
        "zipCode": "SW1A 1AA",
        "country": "United Kingdom"
      },
      "items": [
        {
          "productName": "Dell Latitude 7420",
          "productDescription": "14-inch FHD, Intel i7, 16GB RAM, 512GB SSD",
          "quantity": 2,
          "unitPrice": 649,
          "totalPrice": 1298,
          "imageUrl": "https://example.com/laptop.jpg"
        }
      ]
    }
  ]
}
```

**Field Requirements:**
- `orderNumber` (required): Unique order identifier
- `email` (required): Customer email (must match a user in the system)
- `customerName` (optional): Customer display name
- `orderDate` (required): ISO 8601 date format
- `status` (required): One of: `placed`, `processing`, `in_production`, `quality_check`, `shipped`, `delivered`, `completed`, `cancelled`, `returned`
- `totalAmount` (required): Integer (in pence/cents, e.g., 1299 = £12.99)
- `savedAmount` (required): Integer (savings vs new price)
- `estimatedDelivery` (optional): ISO 8601 date format
- `trackingNumber` (optional): Shipping tracking number
- `shippingAddress` (optional): Full address object
- `items` (optional): Array of order items

**Response:**
```json
{
  "success": true,
  "created": 1,
  "updated": 0,
  "errors": []
}
```

**Important Notes:**
- Users must exist before creating orders (upsert users first)
- Orders are linked to users via the `email` field
- All monetary amounts are in pence/cents (multiply by 100)
- Dates must be in ISO 8601 format with timezone

---

## 3. Warranties Upsert API

Create or update warranty records for devices.

**Endpoint:** `POST /api/data/warranties/upsert`

**Request Body:**
```json
{
  "warranties": [
    {
      "serialNumber": "SN123456789",
      "manufacturerSerialNumber": "DELL-MFG-987654321",
      "warrantyDescription": "3-Year Premium Warranty",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2027-01-01T00:00:00.000Z"
    }
  ]
}
```

**Field Requirements:**
- `serialNumber` (required): Unique device serial number
- `manufacturerSerialNumber` (optional): Manufacturer's serial number
- `warrantyDescription` (required): Warranty description
- `startDate` (required): Warranty start date (ISO 8601)
- `endDate` (required): Warranty end date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "created": 1,
  "updated": 0,
  "errors": []
}
```

---

## 4. RMAs Upsert API

Create or update Return Merchandise Authorization (RMA) requests.

**Endpoint:** `POST /api/data/rmas/upsert`

**Request Body:**
```json
{
  "rmas": [
    {
      "rmaNumber": "RMA-2024-001",
      "email": "john.doe@company.com",
      "orderNumber": "ORD-2024-12345",
      "status": "pending",
      "issueDescription": "Laptop not powering on",
      "resolution": null,
      "createdAt": "2024-10-29T10:00:00.000Z",
      "resolvedAt": null
    }
  ]
}
```

**Field Requirements:**
- `rmaNumber` (required): Unique RMA identifier
- `email` (required): Customer email (must match existing user)
- `orderNumber` (optional): Associated order number (must exist if provided)
- `status` (required): One of: `pending`, `approved`, `in_transit`, `received`, `completed`, `rejected`
- `issueDescription` (required): Description of the issue
- `resolution` (optional): Resolution details
- `createdAt` (required): ISO 8601 date format
- `resolvedAt` (optional): ISO 8601 date format

**Response:**
```json
{
  "success": true,
  "created": 1,
  "updated": 0,
  "errors": []
}
```

**Important Notes:**
- Users must exist before creating RMAs
- If `orderNumber` is provided, the order must exist in the system
- RMAs are linked to users via the `email` field

---

## Error Handling

All Data Push APIs return detailed error information:

**Partial Success Example:**
```json
{
  "success": true,
  "created": 2,
  "updated": 1,
  "errors": [
    {
      "orderNumber": "ORD-FAIL-001",
      "error": "User with email customer@example.com not found"
    }
  ]
}
```

**Complete Failure Example:**
```json
{
  "success": false,
  "error": "Request must include 'users' array"
}
```

**Authentication Failure:**
```json
{
  "success": false,
  "error": "API key required. Provide it in X-API-Key header or Authorization: Bearer <key>"
}
```

---

## Best Practices

1. **User Creation First**: Always upsert users before orders/RMAs to ensure email linking works
2. **Batch Size**: Keep batches under 500 records per request for optimal performance
3. **Error Handling**: Always check the `errors` array and retry failed records
4. **Date Formats**: Use ISO 8601 format: `2024-10-29T10:30:00.000Z`
5. **Password Security**: Send passwords in plain text - the system automatically encrypts them with bcrypt before storage
6. **User Activation**: Use `isActive: false` to deactivate user accounts and prevent login
7. **Monetary Values**: Use integers in pence/cents (multiply by 100)
8. **Idempotency**: Upsert operations are safe to retry - they won't create duplicates

---

# Warranty Lookup API

Public endpoint for warranty information lookup (no authentication required).

**Endpoint:** `GET /api/warranties/search?q={serialNumber}`

**Parameters:**
- `q` (required): Serial number or manufacturer serial number

**Example:**
```bash
curl "https://your-portal.replit.app/api/warranties/search?q=SN123456789"
```

**Response (Found):**
```json
{
  "found": true,
  "warranty": {
    "serialNumber": "SN123456789",
    "manufacturerSerialNumber": "DELL-MFG-987654321",
    "warrantyDescription": "3-Year Premium Warranty",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2027-01-01T00:00:00.000Z",
    "status": "active",
    "daysRemaining": 730
  }
}
```

**Response (Not Found):**
```json
{
  "found": false,
  "message": "No warranty found for this serial number"
}
```

---

# API Key Management

Administrators can create and manage API keys through these endpoints (requires session authentication).

## Create API Key

**Endpoint:** `POST /api/admin/api-keys`

**Request:**
```json
{
  "name": "My Integration Name"
}
```

**Response:**
```json
{
  "success": true,
  "apiKey": "cc_7101cbf99d27c5a98e3cefc80f79fb28b94e194a289c139b179655d8f565cb28",
  "metadata": {
    "id": 4,
    "name": "My Integration Name",
    "keyPrefix": "cc_7101cbf9",
    "createdAt": "2025-10-29T12:02:39.783Z",
    "isActive": true
  },
  "message": "Save this API key securely. It won't be shown again."
}
```

**Important:** The full API key is only shown once. Store it securely.

## List API Keys

**Endpoint:** `GET /api/admin/api-keys`

**Response:**
```json
{
  "success": true,
  "apiKeys": [
    {
      "id": 4,
      "name": "Production API Key - Power Automate",
      "keyPrefix": "cc_7101cbf9",
      "isActive": true,
      "lastUsedAt": "2025-10-29T12:15:00.000Z",
      "createdAt": "2025-10-29T12:02:39.783Z"
    }
  ]
}
```

## Revoke API Key

**Endpoint:** `PATCH /api/admin/api-keys/:id/revoke`

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

## Delete API Key

**Endpoint:** `DELETE /api/admin/api-keys/:id`

**Response:**
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

**Note:** All API key management endpoints require admin session authentication (login via web portal).

---

# Portal APIs

These APIs are used by the customer portal frontend and require user session authentication. They are documented here for reference but are primarily for internal use.

## Authentication APIs

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

### Logout
```bash
POST /api/auth/logout
```

### Get Current User
```bash
GET /api/auth/me
```

## Customer-Facing APIs

All require session authentication (logged-in user).

### Orders
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get specific order details
- `GET /api/orders/:orderId/items` - Get order items
- `GET /api/orders/:orderId/updates` - Get order status updates

### RMA (Return Merchandise Authorization)
- `GET /api/rma` - List user's RMAs
- `GET /api/rma/:id` - Get specific RMA details
- `POST /api/rma` - Create new RMA request

### Environmental Impact
- `GET /api/impact` - Get user's total environmental impact
- `GET /api/impact/order/:orderId` - Get impact for specific order

### Water Projects
- `GET /api/water-projects` - List charity water projects (public)
- `GET /api/water-projects/:id` - Get specific project details

### Support Tickets
- `GET /api/support-tickets` - List user's support tickets
- `GET /api/support-tickets/:id` - Get specific ticket details
- `POST /api/support-tickets` - Create new support ticket

### Case Studies
- `GET /api/case-studies` - List environmental case studies

### Delivery Timeline
- `GET /api/delivery-timeline/:orderId` - Get delivery timeline for order

---

# Legacy CRUD APIs

⚠️ **DEPRECATED:** These APIs are maintained for backward compatibility but should not be used for new integrations. Use [Data Push APIs](#data-push-apis) instead.

All CRUD endpoints require admin session authentication and are prefixed with `/api/crud/`.

## Supported Entities

- `/api/crud/users`
- `/api/crud/orders`
- `/api/crud/order-items`
- `/api/crud/rmas`
- `/api/crud/support-tickets`
- `/api/crud/environmental-impact`
- `/api/crud/water-projects`
- `/api/crud/case-studies`

## Standard Operations

- `GET /api/crud/{entity}` - List all (with optional filters)
- `GET /api/crud/{entity}/:id` - Get by ID
- `POST /api/crud/{entity}` - Create new
- `PATCH /api/crud/{entity}/:id` - Update
- `DELETE /api/crud/{entity}/:id` - Delete

**Example:**
```bash
# Login first
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@example.com", "password": "password"}'

# Use CRUD endpoint
curl -b cookies.txt "http://localhost:5000/api/crud/users"
```

---

## Support & Troubleshooting

### Common Issues

**"API key required" error:**
- Ensure you're including the API key in the `X-API-Key` header or `Authorization: Bearer` header
- Verify the key hasn't been revoked

**"User with email X not found" error:**
- Create users first before creating orders or RMAs
- Ensure the email matches exactly (case-sensitive)

**"Order with number X not found" error:**
- Create the order before referencing it in RMAs
- Verify the order number matches exactly

**Date parsing errors:**
- Use ISO 8601 format: `2024-10-29T10:30:00.000Z`
- Include the `T` separator and `Z` timezone

**Monetary value errors:**
- Use integers only (no decimals)
- Values are in pence/cents (multiply pounds/dollars by 100)

### Rate Limiting

Currently no rate limits are enforced, but we recommend:
- Maximum 100 requests per minute
- Implement exponential backoff for failed requests
- Use batch operations where possible

### Getting Help

For API support or to report issues:
1. Check the troubleshooting guide above
2. Review the error message in the response
3. Contact your system administrator
4. Create a support ticket through the portal

---

## Changelog

### Version 2.1 (October 2025) - Current
- ✅ API Key authentication for data push APIs
- ✅ Support for both X-API-Key and Authorization Bearer headers
- ✅ Admin API key management endpoints
- ✅ Automatic API key usage tracking
- ✅ Secure bcrypt hashing of API keys

### Version 2.0 (October 2025)
- Data Push APIs with upsert functionality
- Warranty lookup API with serial number search
- Bulk upsert support for users, orders, RMAs, and warranties
- Email-based user lookup and linking

### Version 1.0 (October 2024)
- Initial CRUD APIs
- Session-based authentication
- Basic filtering and search capabilities

---

## API Reference Summary

| API Category | Authentication | Use Case |
|-------------|----------------|----------|
| **Data Push APIs** | API Key | External integrations (Power Automate, Zapier) |
| **Warranty Lookup** | None (Public) | Public warranty verification |
| **API Key Management** | Session (Admin) | Managing API keys |
| **Portal APIs** | Session (User) | Customer portal frontend |
| **Legacy CRUD APIs** | Session (Admin) | Deprecated - use Data Push instead |

---

**Production API Key (Save This):**
```
cc_7101cbf99d27c5a98e3cefc80f79fb28b94e194a289c139b179655d8f565cb28
```

Store this key securely. It provides full access to all Data Push APIs and does not expire unless revoked.
