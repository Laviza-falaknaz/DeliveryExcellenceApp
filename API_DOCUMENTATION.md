# Circular Computing Customer Portal - API Documentation

## Quick Start

**Production API Key:** Use the API key provided by your administrator. Create new API keys through the Admin Panel → API Keys section.

API keys are required for all Data Push APIs and never expire unless revoked.

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
X-API-Key: YOUR_API_KEY_HERE
```

**Option 2: Authorization Bearer Token**
```bash
Authorization: Bearer YOUR_API_KEY_HERE
```

## Power Automate Configuration

When setting up HTTP requests in Power Automate:

1. **Method**: `POST`
2. **URI**: `https://your-portal.replit.app/api/data/users/upsert`
3. **Headers**:
   - `Content-Type`: `application/json`
   - `X-API-Key`: `YOUR_API_KEY_HERE`
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
  -H "X-API-Key: YOUR_API_KEY_HERE" \
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

Create or update orders and automatically link them to users via email. Supports multi-currency and timestamp-based delivery timeline tracking.

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
      "currency": "GBP",
      "totalAmount": 1299.99,
      "savedAmount": 300.50,
      "estimatedDelivery": "2024-10-20T00:00:00.000Z",
      "trackingNumber": "1Z999AA10123456784",
      "shippingAddress": {
        "street": "123 Main Street",
        "city": "London",
        "state": "Greater London",
        "zipCode": "SW1A 1AA",
        "country": "United Kingdom"
      },
      "timeline": {
        "orderDate": "2024-10-15T10:30:00.000Z",
        "paymentDate": "2024-10-15T14:00:00.000Z",
        "invoiceMailed": "2024-10-15T15:00:00.000Z",
        "sentToWarehouse": "2024-10-16T09:00:00.000Z",
        "dateFulfilled": "2024-10-17T14:00:00.000Z",
        "dispatchDate": "2024-10-19T08:00:00.000Z",
        "orderCompleted": null
      },
      "items": [
        {
          "productName": "Dell Latitude 7420",
          "productDescription": "14-inch FHD, Intel i7, 16GB RAM, 512GB SSD",
          "quantity": 2,
          "unitPrice": 649.99,
          "totalPrice": 1299.98,
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
- `status` (optional): **Auto-determined from timeline** - Do not include this field. Status is automatically calculated based on timeline milestones
- `currency` (optional): One of: `USD`, `GBP`, `EUR`, `AED`. Defaults to `GBP`
- `totalAmount` (required): Decimal number (e.g., 1299.99 for £1,299.99 or $1,299.99)
- `savedAmount` (required): Decimal number (savings vs new price, e.g., 300.50)
- `estimatedDelivery` (optional): ISO 8601 date format
- `trackingNumber` (optional): Shipping tracking number
- `shippingAddress` (optional): Full address object
- `timeline` (optional): Delivery timeline object with timestamp milestones (see below). Status is automatically determined from these dates
- `items` (optional): Array of order items

**Timeline Object (Optional but Recommended):**
The timeline field tracks order progress with timestamps for each milestone based on your actual system dates. **The order status is automatically determined from these dates** - the system checks the timeline in reverse order and sets the status based on the most recent completed milestone.

All fields are optional and use ISO 8601 date format. **Map your system dates to these fields:**

| Timeline Field | Your System Date | Description | Status Triggered |
|----------------|------------------|-------------|------------------|
| `orderDate` | **Order Date** | When the order was placed | `placed` |
| `paymentDate` | **Payment Date** | When payment was received | `processing` |
| `invoiceMailed` | **Date Invoice Mailed** | When invoice was sent to customer | - |
| `sentToWarehouse` | **Sent to Warehouse Date** | When order was sent to warehouse for processing | `in_production` |
| `dateFulfilled` | **Date Fulfilled** | When warehouse completed order preparation | `in_production` |
| `dispatchDate` | **Dispatch Date** | When order was dispatched from warehouse | `shipped` |
| `orderCompleted` | - | When order process was fully completed | `completed` |

**Future Dates (Not Used in Timeline):**
These are planning dates and should NOT be included in the timeline object:
- Expected Shipping Date
- Agreed Delivery Date  
- Payment Due Date

**Status Determination Logic:**
The system automatically determines status by checking timeline milestones in this priority order:
1. If `orderCompleted` has a date → Status is `completed`
2. If `dispatchDate` has a date → Status is `shipped`
3. If `dateFulfilled` has a date → Status is `in_production`
4. If `sentToWarehouse` has a date → Status is `in_production`
5. If `paymentDate` has a date → Status is `processing`
6. If `orderDate` has a date → Status is `placed`
7. If no timeline provided → Status defaults to `placed`

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
- All monetary amounts are decimal numbers (e.g., 1299.99 for £1,299.99 or $1,299.99)
- Currency field determines how amounts are displayed in the portal
- **Status is automatically determined from timeline** - Do not include a `status` field in your request
- Timeline milestones enable gamified delivery tracking visualization
- Dates must be in ISO 8601 format with timezone
- Timeline milestones can be null or omitted for future milestones
- Only include timeline dates for milestones that have actually occurred - the system will determine the current status automatically

---

## 3. Warranties Bulk Upload API

**⚠️ TRUNCATE AND REPLACE:** This endpoint completely replaces the entire warranties table with your data. It truncates all existing records before inserting new ones. This is designed for complete database synchronization from your authoritative warranty system.

**Use Case:** Designed for bulk warranty data synchronization from your main system (150K+ records supported). Ideal for scheduled daily/weekly syncs from your ERP or warranty management system.

**Endpoint:** `POST /api/data/warranties/upsert`

**Authentication:** Required - Use API key in `X-API-Key` header or `Authorization: Bearer <key>`

**✨ NEW: Chunked Upload Support** - For datasets over 10K records, split your upload into multiple batches to avoid request size limits. The system automatically handles truncation on the first batch and appends subsequent batches.

---

### Request Format

**Request Body:**
```json
{
  "warranties": [
    {
      "serialNumber": "SN123456789",
      "manufacturerSerialNumber": "DELL-MFG-987654321",
      "areaId": "UK-SOUTH",
      "itemId": "ITEM-12345",
      "warrantyDescription": "3-Year Premium Warranty",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2027-01-01T00:00:00.000Z"
    },
    {
      "serialNumber": "SN987654321",
      "manufacturerSerialNumber": "HP-MFG-123456789",
      "areaId": "US-EAST",
      "itemId": "ITEM-67890",
      "warrantyDescription": "2-Year Standard Warranty",
      "startDate": "2023-06-15T00:00:00.000Z",
      "endDate": "2025-06-15T00:00:00.000Z"
    }
  ]
}
```

---

### Field Requirements

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `serialNumber` | String | ✅ Yes | Device serial number (searchable by customers) | `"SN123456789"` |
| `manufacturerSerialNumber` | String | ✅ Yes | Manufacturer's serial number (also searchable) | `"DELL-MFG-987654321"` |
| `areaId` | String | ✅ Yes | Geographic region or area identifier | `"UK-SOUTH"`, `"US-EAST"` |
| `itemId` | String | ✅ Yes | Internal item/SKU/product identifier | `"ITEM-12345"` |
| `warrantyDescription` | String | ✅ Yes | Human-readable warranty type/description | `"3-Year Premium Warranty"` |
| `startDate` | ISO 8601 | ✅ Yes | Warranty start date (with timezone) | `"2024-01-01T00:00:00.000Z"` |
| `endDate` | ISO 8601 | ✅ Yes | Warranty end date (with timezone) | `"2027-01-01T00:00:00.000Z"` |

**Date Format Requirements:**
- Must use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Include timezone (use `Z` for UTC or specific timezone like `+00:00`)
- Example: `"2024-01-01T00:00:00.000Z"` or `"2024-01-01T00:00:00+00:00"`

---

### Chunked Upload for Large Datasets (100K+ Records)

**When to Use Chunking:**
- Datasets over 10,000 records
- Getting 413 "Request Entity Too Large" errors
- Want to monitor progress of large uploads
- Need to upload 100K+ records reliably

**How Chunking Works:**
1. Split your data into smaller batches (recommended: 5,000-10,000 records per batch)
2. Send each batch with `batchNumber` and `totalBatches` parameters
3. System truncates table on batch 1, then appends subsequent batches
4. Track progress and handle errors per batch

**Chunked Request Format:**
```json
{
  "batchNumber": 1,
  "totalBatches": 20,
  "warranties": [
    /* 5000 records here */
  ]
}
```

**Batch Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `batchNumber` | Integer/String | Optional | Current batch number (1-indexed) - accepts both numbers and strings | `1` or `"1"` |
| `totalBatches` | Integer/String | Optional | Total number of batches in upload - accepts both numbers and strings | `20` or `"20"` |
| `warranties` | Array | Required | Warranty records for this batch | Array of warranty objects |

**Note**: The API automatically converts string inputs to integers, so Power Automate and similar tools can send these as strings without issues.

**Chunking Rules:**
- ✅ `batchNumber` must be between 1 and `totalBatches`
- ✅ Batch 1 triggers table truncation (deletes all existing data)
- ✅ Batches 2+ append data without truncation
- ✅ Send batches sequentially (1, 2, 3...) to avoid race conditions
- ⚠️ If any batch fails, you must restart from batch 1 (truncate + full upload)

**Example: Uploading 100,000 Records in 20 Batches**

```bash
# Batch 1 (truncates table + inserts first 5000)
curl -X POST https://your-portal.replit.app/api/data/warranties/upsert \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "batchNumber": 1,
    "totalBatches": 20,
    "warranties": [ /* records 1-5000 */ ]
  }'

# Batch 2 (appends next 5000 without truncating)
curl -X POST https://your-portal.replit.app/api/data/warranties/upsert \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "batchNumber": 2,
    "totalBatches": 20,
    "warranties": [ /* records 5001-10000 */ ]
  }'

# ... continue through batch 20
```

**Chunked Response:**
```json
{
  "success": true,
  "created": 4998,
  "updated": 0,
  "batchNumber": 1,
  "totalBatches": 20,
  "isLastBatch": false,
  "errors": [
    {
      "serialNumber": "BAD-123",
      "error": "Invalid date format"
    }
  ]
}
```

**Response Fields (Chunked Upload):**
- `batchNumber`: Confirms which batch was processed
- `totalBatches`: Total batches in the upload
- `isLastBatch`: `true` when `batchNumber === totalBatches`
- `created`: Number of records inserted in THIS batch
- `errors`: Validation errors for THIS batch only

**Power Automate Chunking Example:**

```
1. Get all warranty records from your system
2. Split into chunks of 5000 using array operations
3. Loop through chunks:
   - Set batchNumber = CurrentIndex + 1
   - Set totalBatches = Total chunk count
   - Send HTTP POST with batch data
   - Check response.success
   - If failed, log error and stop
4. After last batch (isLastBatch: true), confirm total count
```

---

### Performance Specifications

- **Single Request Capacity**: Up to 50MB request body (approximately 30K-50K records depending on data)
- **Chunked Upload Capacity**: Unlimited - tested with 150,000+ records
- **Recommended Batch Size**: 5,000-10,000 records per batch for chunked uploads
- **Processing**: Records processed in batches of 1,000 internally for optimal performance
- **Strategy**: Complete table replacement - truncate on batch 1, append on subsequent batches
- **Error Handling**: Individual record failures don't stop the batch upload
- **Validation**: Each record validated before insertion
- **Response Time**: ~5-10 seconds per 5,000 record batch

---

### Response Format

**Success Response:**
```json
{
  "success": true,
  "created": 150243,
  "updated": 0,
  "errors": [
    {
      "serialNumber": "BAD-SERIAL-123",
      "error": "serialNumber: String must contain at least 1 character(s)"
    },
    {
      "serialNumber": "INVALID-DATE-456",
      "error": "startDate: Invalid date format"
    }
  ]
}
```

**Response Fields:**
- `success`: Always `true` if request was processed (even with errors)
- `created`: Number of warranty records successfully inserted
- `updated`: Always `0` (truncate-replace strategy doesn't update)
- `errors`: Array of records that failed validation with error details

**Error Response (Authentication Failed):**
```json
{
  "success": false,
  "error": "API key required. Provide it in X-API-Key header or Authorization: Bearer <key>"
}
```

---

### Example: cURL Request

```bash
curl -X POST https://your-portal.replit.app/api/data/warranties/upsert \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "warranties": [
      {
        "serialNumber": "TEST-12345",
        "manufacturerSerialNumber": "DELL-TEST-67890",
        "areaId": "UK-LONDON",
        "itemId": "SKU-LAPTOP-001",
        "warrantyDescription": "3-Year Business Warranty",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2027-01-01T00:00:00.000Z"
      }
    ]
  }'
```

---

### Example: Power Automate HTTP Action

**HTTP Method:** `POST`

**URI:**
```
https://your-portal.replit.app/api/data/warranties/upsert
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "YOUR_API_KEY_HERE"
}
```

**Body:**
```json
{
  "warranties": @{body('Parse_Warranty_CSV')}
}
```

---

### Important Notes & Best Practices

⚠️ **Critical Behaviors:**
1. **Complete Table Replacement**: Every API call deletes ALL existing warranties before inserting new data
2. **Atomic Operation**: Either all valid records are inserted, or none (database transaction)
3. **No Partial Updates**: You cannot update individual records - you must send the complete dataset

✅ **Best Practices:**
1. **Schedule Regular Syncs**: Set up automated daily/weekly syncs from your source system
2. **Send Complete Dataset**: Always send your entire warranty database, not just changes
3. **Monitor Errors Array**: Check response for validation errors and fix source data
4. **Test with Small Batches First**: Test with 10-100 records before full 150K upload
5. **Use Consistent Date Format**: Ensure all dates are in ISO 8601 format with timezone
6. **Validate Before Upload**: Pre-validate your data to minimize errors

📊 **Auto-Determined Fields:**
The system automatically calculates these fields based on your data:
- **Status**: `active`, `upcoming`, or `expired` (based on current date vs. start/end dates)
- **Days Remaining**: Calculated from current date to end date
- **Never include these in your request** - they're computed in real-time when customers search

🔍 **Customer Search Capability:**
Customers can search warranties using either:
- Serial Number (`serialNumber` field)
- Manufacturer Serial Number (`manufacturerSerialNumber` field)

Both fields are indexed for fast searching even with 150K+ records.

---

### Common Integration Patterns

**1. Daily Full Sync (Recommended)**
```
Schedule: Every day at 2:00 AM
Process: Export all warranties from ERP → Send to API → Verify response
```

**2. Weekly Full Sync**
```
Schedule: Every Sunday at midnight
Process: Full database export → Bulk upload → Error report review
```

**3. On-Demand Sync**
```
Trigger: Manual button click in admin panel
Process: Immediate full sync for urgent updates
```

---

### Troubleshooting

**Issue: "Invalid date format" errors**
- **Cause**: Dates not in ISO 8601 format
- **Solution**: Convert dates to `YYYY-MM-DDTHH:mm:ss.sssZ` format
- **Example**: `"2024-01-01T00:00:00.000Z"` ✅ (not `"01/01/2024"` ❌)

**Issue: "413 Request Entity Too Large" error**
- **Cause**: Payload exceeds 50MB limit (typically 30K+ records)
- **Solution**: Use chunked upload - split data into batches of 5,000-10,000 records
- **Example**: For 100K records, use 20 batches of 5K each with `batchNumber` and `totalBatches` parameters

**Issue: Upload times out or fails**
- **Cause**: Too many records or network issues
- **Solution**: Use chunked upload to send data in smaller batches

**Issue: Some records missing after upload**
- **Cause**: Validation errors in source data OR incomplete chunked upload
- **Solution**: Check `errors` array in each batch response and fix source data. If using chunked upload, verify all batches completed successfully

**Issue: Old warranties still showing**
- **Cause**: Upload may have failed silently OR batch 1 didn't execute (truncation didn't happen)
- **Solution**: Check response status for all batches. If using chunked upload, confirm batch 1 completed successfully (it truncates the table)

---

### Testing Recommendations

1. **Start Small**: Test with 5-10 records first
2. **Verify Truncation**: Confirm old data is removed
3. **Check Errors**: Review `errors` array in response
4. **Test Search**: Verify customers can find warranties by both serial numbers
5. **Monitor Performance**: Time the upload and monitor server response

---

## 4. RMAs Upsert API

Create or update Return Merchandise Authorization (RMA) requests with multiple serial numbers per RMA.

**Endpoint:** `POST /api/data/rmas/upsert`

**Request Body:**
```json
{
  "rmas": [
    {
      "rmaNumber": "RMA-2024-001",
      "email": "john.doe@company.com",
      "status": "requested",
      "serials": [
        {
          "SerialNumber": "PF1Q4524",
          "ErrorDescription": "Battery died within 10 mins",
          "ReasonForReturn": "Battery",
          "ProductDetails": "LENOVO THINKPAD T480 CORE i5",
          "RelatedOrder": "ORD-2024-12345",
          "Solution": "Pending",
          "ReceivedAtWarehouseOn": "2024-10-29T14:30:00.000Z"
        },
        {
          "SerialNumber": "PF1Q4525",
          "ErrorDescription": "Screen flickering intermittently",
          "ReasonForReturn": "Display",
          "ProductDetails": "LENOVO THINKPAD T480 CORE i5",
          "RelatedOrder": "ORD-2024-12345",
          "Solution": "Pending",
          "ReceivedAtWarehouseOn": null
        }
      ]
    }
  ]
}
```

**RMA Field Requirements:**
- `rmaNumber` (required): Unique RMA identifier
- `email` (required): Customer email (must match existing user)
- `status` (required): One of: `requested`, `approved`, `in_transit`, `received`, `processing`, `completed`, `rejected`
- `serials` (required): Array of serial items (at least one required)

**Serial Item Field Requirements:**
- `SerialNumber` (required): Device serial number
- `ErrorDescription` (required): Detailed description of the fault/issue
- `ReasonForReturn` (required): Reason category (e.g., "Battery", "Display", "Performance")
- `ProductDetails` (required): Product make and model
- `RelatedOrder` (optional): Associated order number
- `Solution` (optional): Resolution status (defaults to "Pending")
- `ReceivedAtWarehouseOn` (optional): ISO 8601 date when item was received at warehouse

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
- Each RMA can contain multiple serial numbers/devices
- All serials in an RMA are tracked independently with their own status and solution
- RMAs are linked to users via the `email` field
- Field names for serials use PascalCase to match external system conventions

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
2. **Batch Size**: 
   - Users/Orders/RMAs: Keep batches under 500 records per request for optimal performance
   - Warranties: Supports 150K+ records in a single request with automatic batch processing
3. **Error Handling**: Always check the `errors` array and retry failed records
4. **Date Formats**: Use ISO 8601 format: `2024-10-29T10:30:00.000Z`
5. **Password Security**: Send passwords in plain text - the system automatically encrypts them with bcrypt before storage
6. **User Activation**: Use `isActive: false` to deactivate user accounts and prevent login
7. **Monetary Values**: Use decimal numbers (e.g., 1299.99 for £1,299.99 or $1,299.99)
8. **Idempotency**: Upsert operations are safe to retry - they won't create duplicates
9. **Warranty Sync**: The warranties endpoint uses truncate-and-replace strategy - send your complete dataset each time

---

# Warranty Lookup API

Public endpoint for warranty information lookup (no authentication required). Customers can search using either the serial number or manufacturer serial number.

**Endpoint:** `GET /api/warranties/search?q={serialNumber}`

**Parameters:**
- `q` (required): Serial number OR manufacturer serial number (searches both fields)

**Examples:**
```bash
# Search by serial number
curl "https://your-portal.replit.app/api/warranties/search?q=SN123456789"

# Search by manufacturer serial number
curl "https://your-portal.replit.app/api/warranties/search?q=DELL-MFG-987654321"
```

**Response (Found):**
```json
{
  "found": true,
  "warranty": {
    "serialNumber": "SN123456789",
    "manufacturerSerialNumber": "DELL-MFG-987654321",
    "areaId": "UK-SOUTH",
    "itemId": "ITEM-12345",
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

**Status Values:**
- `active`: Current date is between startDate and endDate
- `upcoming`: Current date is before startDate
- `expired`: Current date is after endDate

**Auto-Determined Fields:**
- `status`: Calculated automatically based on current date
- `daysRemaining`: Days until warranty expires (0 if expired)

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
  "apiKey": "cc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
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
- `GET /api/orders/:orderId/timeline` - Get delivery timeline with timestamp milestones

### RMA (Return Merchandise Authorization)
- `GET /api/rma` - List user's RMAs with serial items
- `GET /api/rma/:rmaNumber` - Get specific RMA details with all serial items
- `POST /api/rma` - Create new RMA request with multiple serials

**RMA Response Structure:**
Each RMA is returned with its associated items:
```json
{
  "rma": {
    "id": 1,
    "userId": 1,
    "rmaNumber": "RMA-12345",
    "email": "user@example.com",
    "status": "requested",
    "createdAt": "2024-10-31T00:00:00.000Z"
  },
  "items": [
    {
      "id": 1,
      "rmaId": 1,
      "serialNumber": "PF1Q4524",
      "errorDescription": "Battery died within 10 mins",
      "reasonForReturn": "Battery",
      "productDetails": "LENOVO THINKPAD T480 CORE i5",
      "relatedOrder": "ORD-2024-12345",
      "solution": "Pending",
      "receivedAtWarehouseOn": "2024-10-29T14:30:00.000Z",
      "createdAt": "2024-10-31T00:00:00.000Z"
    }
  ]
}
```

**POST /api/rma Request:**
```json
{
  "email": "user@example.com",
  "status": "requested",
  "serials": [
    {
      "SerialNumber": "PF1Q4524",
      "ErrorDescription": "Battery issue",
      "ReasonForReturn": "Battery",
      "ProductDetails": "LENOVO THINKPAD T480",
      "RelatedOrder": "ORD-2024-12345"
    }
  ]
}
```

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
- `GET /api/orders/:orderId/timeline` - Get gamified delivery timeline with timestamp milestones

**Timeline Response:**
```json
{
  "id": 1,
  "orderId": 123,
  "orderPlaced": "2024-10-15T10:30:00.000Z",
  "customerSuccessCallBooked": "2024-10-16T09:00:00.000Z",
  "orderInProgress": "2024-10-16T14:00:00.000Z",
  "orderBeingBuilt": "2024-10-17T10:00:00.000Z",
  "qualityChecks": "2024-10-18T11:00:00.000Z",
  "readyForDelivery": "2024-10-19T08:00:00.000Z",
  "orderDelivered": "2024-10-20T15:30:00.000Z",
  "orderCompleted": null,
  "rateYourExperience": null,
  "createdAt": "2024-10-15T10:30:00.000Z",
  "updatedAt": "2024-10-20T15:30:00.000Z"
}
```

The timeline enables visualization of order progress with animated milestone tracking in the customer portal.

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

**RMA with missing serials:**
- Each RMA must include at least one serial item in the `serials` array
- All required serial fields must be provided: SerialNumber, ErrorDescription, ReasonForReturn, ProductDetails

**Date parsing errors:**
- Use ISO 8601 format: `2024-10-29T10:30:00.000Z`
- Include the `T` separator and `Z` timezone

**Monetary value errors:**
- Use decimal numbers for prices and amounts (e.g., 1299.99, not 129999)
- Values represent the actual amount in the currency (£1,299.99 or $1,299.99)

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

### Version 2.3 (November 2025) - Current
- ✅ **Chunked warranty uploads**: Support for uploading 100K+ warranties in batches to avoid 413 errors
- ✅ Added `batchNumber` and `totalBatches` parameters to warranties upsert endpoint
- ✅ Increased request body size limit to 50MB
- ✅ **Decimal monetary values**: All price and amount fields now support decimals (e.g., 1299.99 instead of integer 129999)
- ✅ Changed `totalAmount`, `savedAmount`, `unitPrice`, `totalPrice` from integer to numeric(10,2)
- ✅ API documentation updated with comprehensive chunked upload examples and troubleshooting

### Version 2.2 (November 2025)
- ✅ Multi-currency support (USD, GBP, EUR, AED) for orders
- ✅ Timestamp-based delivery timeline tracking (replaces boolean flags)
- ✅ Gamified delivery timeline visualization with animated milestones
- ✅ New endpoint: `GET /api/orders/:orderId/timeline`
- ✅ Timeline field in Orders Upsert API for granular progress tracking

### Version 2.1 (October 2025)
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

**Note:** API keys are generated through the Admin Panel and should be stored securely. They provide full access to all Data Push APIs and do not expire unless revoked.
