# Circular Computing Customer Portal API Documentation

## Overview
This document provides comprehensive documentation for the external CRUD APIs. These APIs allow you to perform Create, Read, Update, and Delete operations on all database entities with advanced filtering capabilities.

## Authentication
All API endpoints require admin authentication. You must first authenticate using the login endpoint and maintain the session cookie in subsequent requests.

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "your-email@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "user@example.com",
  "name": "User Name",
  "email": "user@example.com",
  "isAdmin": true,
  ...
}
```

## API Base URL
All CRUD endpoints are prefixed with `/api/crud/`

## Common Patterns

### Standard CRUD Operations
- **GET** `/api/crud/{entity}` - List all entities (with optional filtering)
- **GET** `/api/crud/{entity}/:id` - Get a specific entity by ID
- **POST** `/api/crud/{entity}` - Create a new entity
- **PATCH** `/api/crud/{entity}/:id` - Update an entity
- **DELETE** `/api/crud/{entity}/:id` - Delete an entity

### Response Formats
- **Success (200/201):** Returns the requested data as JSON
- **Not Found (404):** `{"message": "Entity not found"}`
- **Bad Request (400):** `{"message": "Invalid data", "errors": [...]}`
- **Server Error (500):** `{"message": "Internal server error"}`

---

## 1. Users API

### List/Search Users
```bash
GET /api/crud/users
GET /api/crud/users?email=john@example.com
GET /api/crud/users?name=John
GET /api/crud/users?company=TechCorp
```

**Query Parameters:**
- `email` (string, optional): Search users by email (partial match)
- `name` (string, optional): Search users by name (partial match)
- `company` (string, optional): Search users by company (partial match)

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/users?email=john"
```

### Get User by ID
```bash
GET /api/crud/users/:id
```

### Create User
```bash
POST /api/crud/users
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "hashed-password",
  "name": "User Name",
  "company": "Company Name",
  "email": "user@example.com",
  "phoneNumber": "+1234567890",
  "isAdmin": false,
  "notificationPreferences": {
    "orderUpdates": true,
    "environmentalImpact": true,
    "charityUpdates": true,
    "serviceReminders": true
  }
}
```

### Update User
```bash
PATCH /api/crud/users/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "phoneNumber": "+9876543210"
}
```

### Delete User
```bash
DELETE /api/crud/users/:id
```

---

## 2. Orders API

### List/Search Orders
```bash
GET /api/crud/orders
GET /api/crud/orders?orderNumber=ORD-2024-001
GET /api/crud/orders?userId=1
GET /api/crud/orders?status=shipped
```

**Query Parameters:**
- `orderNumber` (string, optional): Search orders by order number (partial match)
- `userId` (integer, optional): Filter orders by user ID
- `status` (string, optional): Filter orders by status (placed, processing, shipped, etc.)

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/orders?userId=1&status=shipped"
```

### Get Order by ID
```bash
GET /api/crud/orders/:id
```

### Create Order
```bash
POST /api/crud/orders
Content-Type: application/json

{
  "orderNumber": "ORD-2024-001",
  "userId": 1,
  "status": "placed",
  "totalAmount": 50000,
  "savedAmount": 10000,
  "estimatedDelivery": "2024-12-31T00:00:00Z",
  "trackingNumber": "TRACK123",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "London",
    "state": "England",
    "zipCode": "SW1A 1AA",
    "country": "UK"
  }
}
```

### Update Order
```bash
PATCH /api/crud/orders/:id
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK456"
}
```

### Delete Order
```bash
DELETE /api/crud/orders/:id
```

---

## 3. Order Items API

### List Order Items
```bash
GET /api/crud/order-items?orderId=1
```

**Query Parameters:**
- `orderId` (integer, required): Filter order items by order ID

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/order-items?orderId=1"
```

### Create Order Item
```bash
POST /api/crud/order-items
Content-Type: application/json

{
  "orderId": 1,
  "productName": "Remanufactured Laptop",
  "productDescription": "Dell Latitude 7490",
  "quantity": 5,
  "unitPrice": 10000,
  "totalPrice": 50000,
  "imageUrl": "https://example.com/image.jpg"
}
```

---

## 4. RMAs API

### List/Search RMAs
```bash
GET /api/crud/rmas
GET /api/crud/rmas?rmaNumber=RMA-2024-001
GET /api/crud/rmas?userId=1
GET /api/crud/rmas?status=approved
```

**Query Parameters:**
- `rmaNumber` (string, optional): Search RMAs by RMA number (partial match)
- `userId` (integer, optional): Filter RMAs by user ID
- `status` (string, optional): Filter RMAs by status (requested, approved, completed, etc.)

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/rmas?rmaNumber=RMA-2024"
```

### Get RMA by ID
```bash
GET /api/crud/rmas/:id
```

### Create RMA
```bash
POST /api/crud/rmas
Content-Type: application/json

{
  "userId": 1,
  "orderId": 1,
  "rmaNumber": "RMA-2024-001",
  "reason": "Defective screen",
  "status": "requested",
  "notes": "Customer reported flickering display"
}
```

### Update RMA
```bash
PATCH /api/crud/rmas/:id
Content-Type: application/json

{
  "status": "approved",
  "notes": "Approved for return"
}
```

### Delete RMA
```bash
DELETE /api/crud/rmas/:id
```

---

## 5. Support Tickets API

### List/Search Support Tickets
```bash
GET /api/crud/support-tickets
GET /api/crud/support-tickets?ticketNumber=TICKET-2024-001
GET /api/crud/support-tickets?userId=1
GET /api/crud/support-tickets?status=open
```

**Query Parameters:**
- `ticketNumber` (string, optional): Search tickets by ticket number (partial match)
- `userId` (integer, optional): Filter tickets by user ID
- `status` (string, optional): Filter tickets by status (open, in_progress, resolved, closed)

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/support-tickets?status=open"
```

### Get Support Ticket by ID
```bash
GET /api/crud/support-tickets/:id
```

### Create Support Ticket
```bash
POST /api/crud/support-tickets
Content-Type: application/json

{
  "userId": 1,
  "orderId": 1,
  "ticketNumber": "TICKET-2024-001",
  "subject": "Need help with setup",
  "description": "Unable to configure network settings",
  "status": "open"
}
```

### Update Support Ticket
```bash
PATCH /api/crud/support-tickets/:id
Content-Type: application/json

{
  "status": "resolved",
  "updatedAt": "2024-10-22T10:00:00Z"
}
```

### Delete Support Ticket
```bash
DELETE /api/crud/support-tickets/:id
```

---

## 6. Environmental Impact API

### List Environmental Impact
```bash
GET /api/crud/environmental-impact?userId=1
```

**Query Parameters:**
- `userId` (integer, required): Filter environmental impact records by user ID

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/environmental-impact?userId=1"
```

### Create Environmental Impact Record
```bash
POST /api/crud/environmental-impact
Content-Type: application/json

{
  "userId": 1,
  "orderId": 1,
  "carbonSaved": 15000,
  "waterProvided": 5000,
  "mineralsSaved": 3000,
  "treesEquivalent": 2,
  "familiesHelped": 1
}
```

---

## 7. Water Projects API

### List Water Projects
```bash
GET /api/crud/water-projects
```

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/water-projects"
```

### Get Water Project by ID
```bash
GET /api/crud/water-projects/:id
```

### Create Water Project
```bash
POST /api/crud/water-projects
Content-Type: application/json

{
  "name": "Ethiopia Clean Water Initiative",
  "location": "Ethiopia",
  "description": "Providing clean water access to rural communities",
  "peopleImpacted": 5000,
  "waterProvided": 100000,
  "imageUrl": "https://example.com/project.jpg"
}
```

### Update Water Project
```bash
PATCH /api/crud/water-projects/:id
Content-Type: application/json

{
  "peopleImpacted": 6000,
  "waterProvided": 120000
}
```

### Delete Water Project
```bash
DELETE /api/crud/water-projects/:id
```

---

## 8. Delivery Timelines API

### Get Delivery Timeline
```bash
GET /api/crud/delivery-timelines?orderId=1
```

**Query Parameters:**
- `orderId` (integer, required): Get delivery timeline by order ID

**Example:**
```bash
curl -b cookies.txt "http://localhost:5000/api/crud/delivery-timelines?orderId=1"
```

### Create Delivery Timeline
```bash
POST /api/crud/delivery-timelines
Content-Type: application/json

{
  "orderId": 1,
  "orderPlaced": true,
  "orderInProgress": true,
  "orderBeingBuilt": false,
  "qualityChecks": false,
  "readyForDelivery": false,
  "orderDelivered": false,
  "orderCompleted": false
}
```

### Update Delivery Timeline
```bash
PATCH /api/crud/delivery-timelines/:orderId
Content-Type: application/json

{
  "orderBeingBuilt": true,
  "qualityChecks": true
}
```

---

## Complete Usage Example

Here's a complete example workflow using the APIs:

```bash
# 1. Login to get session cookie
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"admin123"}'

# 2. Search for users by email
curl -b cookies.txt "http://localhost:5000/api/crud/users?email=john"

# 3. Get all orders for a specific user
curl -b cookies.txt "http://localhost:5000/api/crud/orders?userId=1"

# 4. Search for RMAs by number
curl -b cookies.txt "http://localhost:5000/api/crud/rmas?rmaNumber=RMA-2024"

# 5. Create a new support ticket
curl -b cookies.txt -X POST http://localhost:5000/api/crud/support-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "ticketNumber": "TICKET-2024-001",
    "subject": "Setup assistance needed",
    "description": "Need help configuring the laptop",
    "status": "open"
  }'

# 6. Update an order status
curl -b cookies.txt -X PATCH http://localhost:5000/api/crud/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped", "trackingNumber": "TRACK789"}'

# 7. Get environmental impact for a user
curl -b cookies.txt "http://localhost:5000/api/crud/environmental-impact?userId=1"
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- **200 OK** - Successful GET/PATCH request
- **201 Created** - Successful POST request
- **204 No Content** - Successful DELETE request
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Not authenticated or not an admin
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

Error responses include a message:
```json
{
  "message": "Error description"
}
```

For validation errors (400), additional error details are provided:
```json
{
  "message": "Invalid data",
  "errors": [
    {
      "path": ["fieldName"],
      "message": "Field is required"
    }
  ]
}
```

---

## Best Practices

1. **Always use HTTPS in production** - Never send credentials over unencrypted connections
2. **Maintain session cookies** - Store the session cookie from login and include it in all subsequent requests
3. **Use filtering to reduce data transfer** - Apply query parameters to get only the data you need
4. **Handle errors gracefully** - Check response status codes and handle error cases
5. **Validate data before sending** - Ensure your data matches the schema before POST/PATCH requests
6. **Use pagination if needed** - For large datasets, consider implementing pagination on your end

---

## Rate Limiting

Currently, there are no rate limits on these APIs. However, we recommend:
- Maximum 100 requests per minute per IP address
- Implement exponential backoff for failed requests
- Cache responses when appropriate to reduce server load

---

## Support

For API support or to report issues, please contact the development team or create a support ticket through the portal.

---

## Changelog

### Version 1.0 (October 2024)
- Initial release of CRUD APIs
- Full filtering support for users, orders, RMAs, and support tickets
- Admin authentication requirement
- Comprehensive error handling and validation
