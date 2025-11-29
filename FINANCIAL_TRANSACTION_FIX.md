# Financial Transaction Classification Fix

## Problem
Financial transactions were not being properly classified. The code was using the raw description text as the transaction type instead of calling the `classifyTransactionType()` function. This resulted in transaction types like "*Switch-Out - To ABSL Small Cap Fund Growth" instead of the correct "Switch-Out".

## Root Cause
In the `parseTransactions()` function, financial transactions were using:
```javascript
const finalTransactionType = cleanTransactionType(finalDescription);
```

This only removed asterisks but didn't classify the transaction. The `classifyTransactionType()` function existed but was never called for financial transactions.

## Solution
Changed the code to properly classify financial transactions:
```javascript
const { type: finalTransactionType } = classifyTransactionType(finalDescription);
```

Now financial transactions are passed through the classification logic that:
- Detects "systematic investment" or "sip" → "Systematic Investment"
- Detects "switch-out" → "Switch-Out"
- Detects "switch-in" → "Switch-In"
- Detects "redemption" → "Redemption"
- Detects "dividend" → "Dividend"
- Detects "purchase" → "Purchase"
- Defaults to "Purchase" for unrecognized patterns

## Changes Made

### Modified Files
1. **backend/src/extractors/transactionExtractor.js**
   - Line ~450: Changed financial transaction type assignment to use `classifyTransactionType()`

2. **backend/tests/test-description-extraction.js**
   - Fixed import path from `./src/` to `../src/`

3. **backend/tests/test-mixed-transactions.js**
   - Fixed import path from `./src/` to `../src/`

### New Files
1. **backend/tests/test-financial-classification.js**
   - Comprehensive test covering all transaction types
   - Verifies Purchase, Systematic Investment, Redemption, Switch-Out, Switch-In, and Dividend classifications

## Test Results
All tests pass successfully:
- ✓ Purchase transactions classified correctly
- ✓ Systematic Investment transactions classified correctly
- ✓ Redemption transactions classified correctly
- ✓ Switch-Out transactions classified correctly
- ✓ Switch-In transactions classified correctly
- ✓ Dividend transactions classified correctly
- ✓ Administrative transactions remain unaffected

## Impact
- **Transaction Type Filter**: Now works correctly for all financial transaction types
- **Data Accuracy**: Transaction types are standardized and consistent
- **Backward Compatibility**: Administrative transaction handling remains unchanged
- **Description Preservation**: Original CAS description text is still preserved in the description field

## Example
**Before:**
- Description: `*Switch-Out - To ABSL Small Cap Fund Growth , less STT`
- Transaction Type: `Switch-Out - To ABSL Small Cap Fund Growth , less STT` ❌

**After:**
- Description: `*Switch-Out - To ABSL Small Cap Fund Growth , less STT`
- Transaction Type: `Switch-Out` ✓
