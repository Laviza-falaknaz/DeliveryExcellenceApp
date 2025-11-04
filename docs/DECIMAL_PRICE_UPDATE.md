# Decimal Price/Amount Fields Update

## Overview

All monetary fields in the orders and order items tables have been updated from **integer** (storing values in cents/pence) to **decimal(10,2)** (storing actual monetary values with two decimal places).

---

## What Changed

### Database Schema Changes

**Orders Table:**
- `total_amount`: Changed from `integer` to `numeric(10,2)`
- `saved_amount`: Changed from `integer` to `numeric(10,2)`

**Order Items Table:**
- `unit_price`: Changed from `integer` to `numeric(10,2)`
- `total_price`: Changed from `integer` to `numeric(10,2)`

### Value Format Change

**BEFORE (Integer - Minor Units):**
```json
{
  "totalAmount": 129999,     // Represents £1,299.99 (stored as pence)
  "savedAmount": 30050,      // Represents £300.50
  "unitPrice": 64999,        // Represents £649.99
  "totalPrice": 129998       // Represents £1,299.98
}
```

**AFTER (Decimal - Actual Values):**
```json
{
  "totalAmount": 1299.99,    // Actual amount £1,299.99
  "savedAmount": 300.50,     // Actual amount £300.50
  "unitPrice": 649.99,       // Actual price £649.99
  "totalPrice": 1299.98      // Actual total £1,299.98
}
```

---

## Impact

### ✅ Benefits

1. **More Intuitive**: Values now represent actual monetary amounts instead of minor units
2. **Clearer API**: No need to multiply/divide by 100 when sending data
3. **Better Precision**: Native decimal support prevents rounding errors
4. **Industry Standard**: Aligns with how most systems handle monetary values

### ⚠️ Breaking Changes

**If you have existing integrations:**

1. **Stop sending integer values** (e.g., 129999)
2. **Start sending decimal values** (e.g., 1299.99)
3. **Update your data mapping logic** to remove the "multiply by 100" conversion

---

## Migration Guide for Integrations

### Power Automate / Zapier

**Old Logic (Remove This):**
```
totalAmount = price * 100    // ❌ NO LONGER NEEDED
```

**New Logic (Use This):**
```
totalAmount = price           // ✅ Just send the actual price
```

### Example Integration Update

**Before:**
```json
{
  "orderNumber": "ORD-123",
  "totalAmount": 1299,        // This was £12.99
  "savedAmount": 300          // This was £3.00
}
```

**After:**
```json
{
  "orderNumber": "ORD-123",
  "totalAmount": 12.99,       // This is £12.99
  "savedAmount": 3.00         // This is £3.00
}
```

---

## Validation

### Accepted Formats

✅ **Decimal with two places:** `1299.99`  
✅ **Decimal with one place:** `1299.9` (stored as 1299.90)  
✅ **Whole number:** `1299` (stored as 1299.00)  
✅ **Small values:** `0.99`, `5.50`  

❌ **Integers in minor units:** `129999` (will be interpreted as £129,999.00, not £1,299.99!)

### Precision

- **Maximum value:** 99,999,999.99 (8 digits before decimal + 2 after)
- **Decimal places:** Exactly 2 (automatically rounded if more provided)

---

## Documentation Updates

All API documentation has been updated to reflect decimal values:

### Updated Sections:
- ✅ Orders Upsert API field requirements
- ✅ Order items examples
- ✅ Best practices section
- ✅ Troubleshooting guide
- ✅ Changelog (Version 2.3)

### Key Documentation Changes:

**Field Descriptions:**
```
OLD: totalAmount (required): Integer (in minor units - pence/cents/fils, e.g., 1299 = £12.99)
NEW: totalAmount (required): Decimal number (e.g., 1299.99 for £1,299.99)
```

**Best Practices:**
```
OLD: 7. Monetary Values: Use integers in pence/cents (multiply by 100)
NEW: 7. Monetary Values: Use decimal numbers (e.g., 1299.99 for £1,299.99)
```

---

## Testing Your Integration

### Step 1: Create a Test Order

```bash
curl -X POST https://your-portal.replit.app/api/data/orders/upsert \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "orders": [{
      "orderNumber": "TEST-001",
      "email": "test@example.com",
      "orderDate": "2024-11-04T12:00:00.000Z",
      "currency": "GBP",
      "totalAmount": 99.99,
      "savedAmount": 10.50,
      "items": [{
        "productName": "Test Product",
        "productDescription": "Test",
        "quantity": 1,
        "unitPrice": 99.99,
        "totalPrice": 99.99
      }]
    }]
  }'
```

### Step 2: Verify Display

Log into the customer portal and verify:
- Total shows as £99.99 (not £0.99 or £9,999.00)
- Savings shows as £10.50
- All currency symbols display correctly

---

## Rollback Plan

If you need to revert to integer values:

1. The old schema used `integer` for all monetary fields
2. Values were stored in minor units (pence/cents/fils)
3. Frontend divided by 100 for display

**Note:** This would require a database migration and breaking changes for all integrations.

---

## Support

If you experience issues after this update:

1. **Check your API calls** - Ensure you're sending decimals, not integers
2. **Verify examples** - Compare your requests to the updated API documentation
3. **Test with small values** - Try 0.99 or 1.50 to confirm correct handling
4. **Review logs** - Check for validation errors in the API response

---

## Changelog Reference

This change is documented in **API Documentation Version 2.3 (November 2025)** under the Changelog section.
