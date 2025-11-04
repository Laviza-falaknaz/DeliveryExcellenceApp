# Warranty Chunked Upload Guide

## Problem Solved

When uploading 100,000+ warranty records, you may encounter:
- **413 Request Entity Too Large** errors
- Request timeouts
- Network failures with large payloads

Chunked upload solves this by allowing you to split large datasets into smaller, manageable batches.

---

## Quick Start

### For 100K Records

Split your data into 20 batches of 5,000 records each:

```javascript
// Pseudo-code for chunking
const allWarranties = getWarrantiesFromYourSystem(); // 100,000 records
const batchSize = 5000;
const totalBatches = Math.ceil(allWarranties.length / batchSize);

for (let i = 0; i < allWarranties.length; i += batchSize) {
  const batch = allWarranties.slice(i, i + batchSize);
  const batchNumber = Math.floor(i / batchSize) + 1;
  
  await uploadBatch(batch, batchNumber, totalBatches);
}
```

---

## How It Works

### 1. Split Your Data
Break your warranty records into chunks of 5,000-10,000 records.

### 2. Send Batches Sequentially
Send each batch with:
- `batchNumber`: 1, 2, 3, etc.
- `totalBatches`: Total number of batches (e.g., 20)
- `warranties`: Array of records for this batch

### 3. Automatic Truncation
- **Batch 1**: Deletes all existing warranties, then inserts first 5,000
- **Batch 2-20**: Appends records without deleting

### 4. Track Progress
Each response includes:
- `batchNumber`: Confirms which batch was processed
- `isLastBatch`: `true` when complete
- `created`: Number of records inserted in this batch
- `errors`: Any validation errors for this batch

---

## API Request Format

```json
{
  "batchNumber": 1,
  "totalBatches": 20,
  "warranties": [
    {
      "serialNumber": "SN123456789",
      "manufacturerSerialNumber": "DELL-MFG-987654321",
      "areaId": "UK-SOUTH",
      "itemId": "ITEM-12345",
      "warrantyDescription": "3-Year Premium Warranty",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2027-01-01T00:00:00.000Z"
    }
    // ... 4,999 more records
  ]
}
```

---

## Response Format

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
      "serialNumber": "BAD-SERIAL",
      "error": "Invalid date format for startDate"
    }
  ]
}
```

---

## Example: Power Automate

```
┌─────────────────────────────────────────────┐
│ 1. Get Warranties from Source System       │
│    Output: allWarranties (array)           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ 2. Initialize Variables                    │
│    - batchSize = 5000                      │
│    - totalBatches = ceiling(length /       │
│                              batchSize)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ 3. Apply to Each (Loop)                    │
│    Input: range(0, totalBatches)           │
│    ┌────────────────────────────────────┐  │
│    │ a. Set currentBatch = index + 1   │  │
│    │ b. Set startIdx = index * 5000    │  │
│    │ c. Set endIdx = startIdx + 5000   │  │
│    │ d. Set batchData = slice array    │  │
│    │ e. HTTP POST to API:              │  │
│    │    {                               │  │
│    │      "batchNumber": currentBatch, │  │
│    │      "totalBatches": total,       │  │
│    │      "warranties": batchData      │  │
│    │    }                               │  │
│    │ f. Check response.success         │  │
│    │ g. Log response.created           │  │
│    └────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ 4. Verify Completion                       │
│    - Check isLastBatch = true              │
│    - Sum all batch.created counts          │
│    - Compare to expected total             │
└─────────────────────────────────────────────┘
```

---

## Best Practices

### ✅ DO

1. **Send batches sequentially** (1, 2, 3, ..., 20)
   - Prevents race conditions
   - Ensures truncation happens before appends

2. **Check response for each batch**
   - Verify `success: true`
   - Log `created` count
   - Review `errors` array

3. **Use 5,000-10,000 records per batch**
   - Optimal balance between speed and reliability
   - Stays well under 50MB limit

4. **Restart from batch 1 if any batch fails**
   - Ensures data consistency
   - Complete truncate-and-replace

### ❌ DON'T

1. **Don't send batches in parallel**
   - May cause race conditions
   - Batch 2 might arrive before batch 1

2. **Don't skip error handling**
   - Always check `response.success`
   - Review `errors` array in each response

3. **Don't send batches out of order**
   - Must be sequential: 1, 2, 3, ..., N

4. **Don't use tiny batches (<1000 records)**
   - Slows down the upload unnecessarily
   - Too many HTTP requests

---

## Error Handling

### Batch Failure Scenarios

**Scenario 1: Batch 5 fails (network error)**
```
✅ Batch 1: 5000 inserted (table truncated)
✅ Batch 2: 5000 inserted
✅ Batch 3: 5000 inserted
✅ Batch 4: 5000 inserted
❌ Batch 5: FAILED (network timeout)

Action: Restart from batch 1
Reason: Ensures complete dataset (0-25,000 now missing batches 5-20)
```

**Scenario 2: Batch 3 has validation errors**
```
✅ Batch 1: 5000 inserted (table truncated)
✅ Batch 2: 5000 inserted
⚠️  Batch 3: 4998 inserted, 2 errors
✅ Batch 4: 5000 inserted

Action: 
1. Fix the 2 errors in source data
2. Continue with remaining batches
3. After completion, re-upload corrected full dataset

Reason: Individual record failures don't stop the batch
```

---

## Monitoring Progress

### Track Total Created Count

```javascript
let totalCreated = 0;
const responses = [];

for (let batch = 1; batch <= totalBatches; batch++) {
  const response = await uploadBatch(batch);
  
  totalCreated += response.created;
  responses.push(response);
  
  console.log(`Batch ${batch}/${totalBatches}: ${response.created} records`);
  console.log(`Running total: ${totalCreated} / ${allWarranties.length}`);
  
  if (response.isLastBatch) {
    console.log(`✅ Upload complete: ${totalCreated} total records`);
  }
}
```

---

## Performance

### Upload Times

| Records | Strategy | Batches | Time |
|---------|----------|---------|------|
| 5,000 | Single request | 1 | ~5 seconds |
| 10,000 | Single request | 1 | ~10 seconds |
| 50,000 | Chunked (10K each) | 5 | ~50 seconds |
| 100,000 | Chunked (5K each) | 20 | ~2 minutes |
| 150,000 | Chunked (5K each) | 30 | ~3 minutes |

*Times are approximate and vary based on network speed and server load*

---

## Testing Recommendations

1. **Start with small test**
   - Upload 100 records first (batch size = 100, total = 1)
   - Verify truncation works

2. **Test 2-batch upload**
   - Split 200 records into 2 batches of 100
   - Confirm batch 1 truncates, batch 2 appends

3. **Test error handling**
   - Include 1 intentionally invalid record
   - Verify it appears in `errors` array
   - Confirm other records still insert

4. **Full production test**
   - Upload complete dataset in batches
   - Monitor progress logs
   - Verify final count matches expected

---

## Comparison: Single vs Chunked

### Single Request (Old Way)
```
✅ Simple - one API call
❌ Fails with 100K+ records (413 error)
❌ No progress tracking
❌ All-or-nothing (one failure = complete failure)
```

### Chunked Upload (New Way)
```
✅ Handles unlimited records
✅ Progress tracking per batch
✅ Partial failure recovery (fix errors and continue)
✅ Better performance with large datasets
⚠️  Requires loop/iteration logic in client
```

---

## Support

If you encounter issues:

1. **Check batch sequence**: Ensure batches sent as 1, 2, 3, etc.
2. **Verify response**: Each batch should return `success: true`
3. **Review errors array**: Fix validation errors in source data
4. **Check total created**: Sum all `created` counts from responses
5. **Contact support**: If issues persist after troubleshooting

---

## Quick Reference

**Endpoint**: `POST /api/data/warranties/upsert`

**Headers**:
```
Content-Type: application/json
X-API-Key: YOUR_API_KEY_HERE
```

**Body**:
```json
{
  "batchNumber": 1,
  "totalBatches": 20,
  "warranties": [ /* array of records */ ]
}
```

**Recommended Batch Size**: 5,000-10,000 records

**Max Single Request**: ~30,000-50,000 records (50MB limit)

**Tested Capacity**: 150,000+ records via chunking
