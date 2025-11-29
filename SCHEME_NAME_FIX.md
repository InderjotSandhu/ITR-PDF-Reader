# Scheme Name Display Fix

## Problem
The transaction table in the frontend was not displaying scheme names. The "Scheme" column existed in the UI but showed empty values or dashes.

## Root Cause
In the `/api/extract-cas-data` endpoint in `backend/src/routes/casRoutes.js`, when flattening transactions for the frontend, the code was trying to access `fund.schemeName` which doesn't exist in the data structure. The scheme name is actually stored at the folio level as `folio.schemeName`.

**Incorrect code:**
```javascript
allTransactions.push({
  ...transaction,
  schemeName: fund.schemeName,  // ❌ fund doesn't have schemeName
  folioNumber: folio.folioNumber,
  isin: fund.isin || ''
});
```

## Solution
Changed the code to correctly access the scheme name from the folio object:

```javascript
allTransactions.push({
  ...transaction,
  schemeName: folio.schemeName || '',  // ✓ Correct: folio has schemeName
  folioNumber: folio.folioNumber || '',
  isin: folio.isin || ''
});
```

## Changes Made

### Modified Files
1. **backend/src/routes/casRoutes.js**
   - Line ~197-203: Fixed scheme name access in transaction flattening logic
   - Changed from `fund.schemeName` to `folio.schemeName`
   - Also fixed `isin` to use `folio.isin` instead of `fund.isin` for consistency

## Impact
- **Transaction Table**: Now displays the correct scheme name for each transaction
- **Filtering**: Scheme-based filtering will work correctly
- **Export**: Exported files will include proper scheme names
- **Data Accuracy**: Transaction data now includes all necessary context

## Data Structure
The correct data hierarchy is:
```
transactionData
  └── funds[]
      └── folios[]
          ├── schemeName  ✓ (scheme name is here)
          ├── isin        ✓ (ISIN is here)
          ├── folioNumber ✓
          └── transactions[]
              ├── date
              ├── amount
              ├── transactionType
              └── ...
```

## Testing
After this fix:
1. Upload a CAS PDF
2. View the transaction table
3. Verify that the "Scheme" column now shows the actual scheme names (e.g., "HDFC Balanced Advantage Fund", "ICICI Prudential Equity Fund", etc.)
