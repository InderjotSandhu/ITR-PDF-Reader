# Design Document - Advanced Filtering and Search

## Overview

The Advanced Filtering and Search feature enhances the ITR Complete application by adding client-side data filtering and search capabilities. After PDF extraction, users can interactively filter and search through transactions before exporting, enabling focused analysis and reducing the need for post-processing in Excel.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│              React Frontend                         │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  PDF Upload & Extraction (Existing)          │ │
│  └──────────────┬───────────────────────────────┘ │
│                 │                                   │
│                 ▼                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │  Data Preview & Filter Component (NEW)       │ │
│  │  - Filter Controls                           │ │
│  │  - Search Bar                                │ │
│  │  - Results Table                             │ │
│  │  - Active Filter Tags                        │ │
│  └──────────────┬───────────────────────────────┘ │
│                 │                                   │
│                 ▼                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │  Export with Filters (Enhanced)              │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Component Flow

1. **Extraction Phase** (Existing)
   - User uploads PDF
   - Backend extracts data
   - Frontend receives JSON response

2. **Preview & Filter Phase** (NEW)
   - Display extracted data in table
   - Apply filters client-side
   - Update display in real-time
   - Show active filters

3. **Export Phase** (Enhanced)
   - Apply filters to export data
   - Generate filtered report
   - Include filter metadata

## Components and Interfaces

### 1. FilterPanel Component

**Purpose**: Container for all filter controls

**Props**:
```typescript
interface FilterPanelProps {
  transactions: Transaction[];
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}
```

**State**:
```typescript
interface FilterState {
  dateRange: { start: Date | null; end: Date | null };
  transactionTypes: string[];
  searchQuery: string;
  folioNumber: string | null;
  amountRange: { min: number | null; max: number | null };
}
```

### 2. TransactionTable Component

**Purpose**: Display filtered transaction data

**Props**:
```typescript
interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  totalCount: number;
  filteredCount: number;
}
```

### 3. ActiveFilters Component

**Purpose**: Display and manage active filter tags

**Props**:
```typescript
interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
}
```

### 4. SearchBar Component

**Purpose**: Text search input with debouncing

**Props**:
```typescript
interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder: string;
  debounceMs: number;
}
```

## Data Models

### Transaction (Existing, Extended)

```typescript
interface Transaction {
  // Existing fields
  date: string;
  amount: number;
  nav: number | null;
  units: number | null;
  transactionType: string;
  unitBalance: number | null;
  description: string;
  isAdministrative: boolean;
  
  // Extended for filtering
  folioNumber: string;
  schemeName: string;
  isin: string;
}
```

### FilterState

```typescript
interface FilterState {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  transactionTypes: string[];
  searchQuery: string;
  folioNumber: string | null;
  amountRange: {
    min: number | null;
    max: number | null;
  };
}
```

### FilterMetadata

```typescript
interface FilterMetadata {
  appliedAt: string;
  filters: {
    dateRange?: string;
    transactionTypes?: string[];
    searchQuery?: string;
    folioNumber?: string;
    amountRange?: string;
  };
  originalCount: number;
  filteredCount: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Date range filter completeness
*For any* set of transactions and any valid date range (start <= end), all filtered results should have transaction dates within the specified range (inclusive).
**Validates: Requirements 1.1**

### Property 2: Filter clearing returns to original state
*For any* set of transactions and any applied filters, clearing all filters should return exactly the original set of transactions.
**Validates: Requirements 1.2, 2.2, 3.2, 4.3, 5.4, 9.2**

### Property 3: Transaction type filter accuracy
*For any* set of transactions and any selected transaction types, all filtered results should have a transaction type matching one of the selected types.
**Validates: Requirements 2.1, 2.4**

### Property 4: Available filter options completeness
*For any* set of transactions, the available transaction type options should contain exactly the unique transaction types present in the data, and folio options should contain exactly the unique folio numbers.
**Validates: Requirements 2.3, 4.2**

### Property 5: Search case-insensitivity
*For any* search query, searching with different case variations (uppercase, lowercase, mixed case) should return the same set of transactions.
**Validates: Requirements 3.3**

### Property 6: Search query substring matching
*For any* search query and set of transactions, all filtered results should have scheme names containing the query as a substring (case-insensitive).
**Validates: Requirements 3.1**

### Property 7: Folio filter exactness
*For any* selected folio number and set of transactions, all filtered results should have exactly that folio number.
**Validates: Requirements 4.1**

### Property 8: Amount range filter boundaries
*For any* amount range (min, max) and set of transactions, all filtered results should have amounts where min <= amount <= max. When only min is specified, amount >= min. When only max is specified, amount <= max.
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 9: Multiple filter conjunction (AND logic)
*For any* combination of active filters and set of transactions, all filtered results should satisfy ALL filter conditions simultaneously.
**Validates: Requirements 6.1**

### Property 10: Filter addition narrows results
*For any* set of transactions with active filters, adding an additional filter should return a subset (or equal set) of the current results.
**Validates: Requirements 6.2**

### Property 11: Filter removal expands results
*For any* set of transactions with multiple active filters, removing one filter should return a superset (or equal set) of the current results.
**Validates: Requirements 6.3**

### Property 12: Result count accuracy
*For any* set of filters applied to transactions, the displayed count should equal the actual number of transactions in the filtered results.
**Validates: Requirements 4.4, 6.4**

### Property 13: Export data matches filtered view
*For any* set of active filters and transactions, the exported data should contain exactly the same transactions as displayed in the filtered view.
**Validates: Requirements 8.1**

### Property 14: Export format preservation
*For any* selected output format (Excel, JSON, Text), applying filters should not change the output format of the export.
**Validates: Requirements 8.2**

### Property 15: Export metadata includes filter criteria
*For any* filtered export, the metadata should contain all active filter information including filter types, values, and result counts.
**Validates: Requirements 8.4**

### Property 16: Clear all filters resets state
*For any* set of active filters, clicking "Clear All Filters" should result in an empty filter state with all filter fields at default values.
**Validates: Requirements 9.1, 9.3**

### Property 17: Active filter indicators match applied filters
*For any* set of applied filters, there should be exactly one active filter indicator for each non-empty filter, and each indicator should display the correct filter name and value.
**Validates: Requirements 10.1, 10.2, 10.4**

### Property 18: Individual filter removal precision
*For any* set of multiple active filters, removing one specific filter via its indicator should remove only that filter while preserving all other filters.
**Validates: Requirements 10.3**

## Error Handling

### Input Validation

1. **Date Range Validation**
   - Validate start date <= end date
   - Display error: "End date must be after start date"
   - Prevent filter application until corrected

2. **Amount Range Validation**
   - Validate numeric input only
   - Display error: "Please enter valid numbers"
   - Validate min <= max if both provided
   - Display error: "Maximum amount must be greater than minimum"

3. **Empty Results**
   - Display "No transactions match your filters" message
   - Show active filters for context
   - Provide "Clear Filters" button

### Error Recovery

1. **Invalid Filter State**
   - Reset to last valid state
   - Log error to console
   - Display user-friendly message

2. **Export Failures**
   - Retry with original (unfiltered) data
   - Display error message with option to retry
   - Log detailed error for debugging

## Testing Strategy

### Unit Testing

**Filter Logic Tests**:
- Test individual filter functions (date, type, search, folio, amount)
- Test filter combination logic (AND conditions)
- Test filter state management
- Test input validation
- Test error handling

**Component Tests**:
- Test FilterPanel renders correctly
- Test TransactionTable displays filtered data
- Test ActiveFilters shows correct tags
- Test SearchBar debouncing

### Property-Based Testing

**Framework**: fast-check (existing in project)

**Test Configuration**:
- Minimum 100 iterations per property
- Generate random transaction datasets
- Generate random filter combinations
- Test all 18 correctness properties

**Property Test Tags**:
Each property-based test will include a comment:
```javascript
// Feature: advanced-filtering-search, Property X: [property description]
// Validates: Requirements X.Y
```

**Generators**:
```javascript
// Generate random transactions
const transactionArbitrary = fc.record({
  date: fc.date(),
  amount: fc.float(),
  transactionType: fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out'),
  schemeName: fc.string(),
  folioNumber: fc.string(),
  // ... other fields
});

// Generate random filter states
const filterStateArbitrary = fc.record({
  dateRange: fc.record({
    start: fc.option(fc.date()),
    end: fc.option(fc.date())
  }),
  transactionTypes: fc.array(fc.string()),
  searchQuery: fc.string(),
  // ... other filters
});
```

### Integration Testing

**End-to-End Filter Flow**:
1. Extract data from PDF
2. Apply various filters
3. Verify filtered results
4. Export filtered data
5. Verify export contains only filtered data

**Multi-Filter Scenarios**:
- Test all filter combinations
- Test filter order independence
- Test filter persistence across UI interactions

## Performance Considerations

### Client-Side Filtering

**Optimization Strategies**:
1. **Memoization**: Cache filter results using React.useMemo
2. **Debouncing**: Debounce search input (300ms)
3. **Virtual Scrolling**: Use react-window for large datasets (>1000 transactions)
4. **Web Workers**: Move filtering logic to Web Worker for datasets >5000 transactions

**Performance Targets**:
- Filter application: <100ms for <1000 transactions
- Filter application: <500ms for <10000 transactions
- Search debounce: 300ms
- UI update: <50ms after filter computation

### Memory Management

- Limit displayed transactions to 1000 rows (with pagination)
- Use pagination for large result sets
- Clear unused filter state on component unmount

## UI/UX Design

### Filter Panel Layout

```
┌─────────────────────────────────────────────────────┐
│  Filters                                    [Clear] │
├─────────────────────────────────────────────────────┤
│  Search: [_____________________________]            │
│                                                     │
│  Date Range:  [Start Date] to [End Date]           │
│                                                     │
│  Transaction Type:                                  │
│  ☐ Purchase  ☐ Redemption  ☐ SIP                  │
│  ☐ Switch-In ☐ Switch-Out  ☐ Dividend             │
│                                                     │
│  Folio: [Select Folio ▼]                           │
│                                                     │
│  Amount Range: [Min] to [Max]                      │
│                                                     │
│  Active Filters: (3)                                │
│  [Date: Jan-Mar 2024 ×] [Type: Purchase ×]         │
│  [Amount: >10000 ×]                                 │
└─────────────────────────────────────────────────────┘
```

### Results Display

```
┌─────────────────────────────────────────────────────┐
│  Showing 45 of 1,234 transactions                   │
├─────────────────────────────────────────────────────┤
│  Date       │ Scheme      │ Type     │ Amount       │
│  ──────────────────────────────────────────────────│
│  15-Jan-24  │ HDFC Equity │ Purchase │ ₹15,000     │
│  22-Jan-24  │ ICICI Debt  │ Purchase │ ₹20,000     │
│  ...                                                 │
└─────────────────────────────────────────────────────┘
```

### Responsive Design

- **Desktop**: Side-by-side filter panel and results
- **Tablet**: Collapsible filter panel
- **Mobile**: Bottom sheet filter panel

## Implementation Notes

### State Management

Use React Context or Redux for filter state to share across components:

```typescript
interface FilterContext {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  filteredTransactions: Transaction[];
  clearFilters: () => void;
  removeFilter: (filterKey: string) => void;
}
```

### Filter Function Implementation

```typescript
function applyFilters(
  transactions: Transaction[],
  filters: FilterState
): Transaction[] {
  return transactions.filter(transaction => {
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const txDate = new Date(transaction.date);
      if (filters.dateRange.start && txDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && txDate > filters.dateRange.end) return false;
    }
    
    // Transaction type filter
    if (filters.transactionTypes.length > 0) {
      if (!filters.transactionTypes.includes(transaction.transactionType)) return false;
    }
    
    // Search query filter
    if (filters.searchQuery) {
      if (!transaction.schemeName.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    // Folio filter
    if (filters.folioNumber) {
      if (transaction.folioNumber !== filters.folioNumber) return false;
    }
    
    // Amount range filter
    if (filters.amountRange.min !== null && transaction.amount < filters.amountRange.min) {
      return false;
    }
    if (filters.amountRange.max !== null && transaction.amount > filters.amountRange.max) {
      return false;
    }
    
    return true;
  });
}
```

### Export Integration

Modify existing export functions to accept filtered data:

```typescript
async function exportFilteredData(
  filteredTransactions: Transaction[],
  filters: FilterState,
  format: 'excel' | 'json' | 'text'
): Promise<void> {
  const metadata: FilterMetadata = {
    appliedAt: new Date().toISOString(),
    filters: serializeFilters(filters),
    originalCount: allTransactions.length,
    filteredCount: filteredTransactions.length
  };
  
  // Pass filtered data to existing export functions
  await generateExport(filteredTransactions, metadata, format);
}
```

## Security Considerations

1. **Input Sanitization**: Sanitize search queries to prevent XSS
2. **Client-Side Only**: All filtering happens client-side (no server exposure)
3. **Data Validation**: Validate filter inputs before application
4. **Memory Limits**: Prevent excessive memory usage with large datasets

## Accessibility

1. **Keyboard Navigation**: All filters accessible via keyboard
2. **Screen Reader Support**: ARIA labels for all filter controls
3. **Focus Management**: Proper focus handling when filters change
4. **Color Contrast**: Ensure filter UI meets WCAG AA standards

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

**New Dependencies**:
- `date-fns` - Date manipulation and formatting
- `react-window` - Virtual scrolling for large datasets (optional)

**Existing Dependencies** (no changes):
- React 18
- Axios
- ExcelJS

## Migration Strategy

1. **Phase 1**: Add filter UI (non-functional)
2. **Phase 2**: Implement filter logic
3. **Phase 3**: Integrate with export
4. **Phase 4**: Add property-based tests
5. **Phase 5**: Performance optimization

## Future Enhancements

1. **Saved Filters**: Allow users to save and load filter presets
2. **Advanced Search**: Support for complex queries (AND/OR/NOT)
3. **Column Sorting**: Sort results by any column
4. **Filter History**: Undo/redo filter changes
5. **Export Filter Summary**: Include filter summary in exported reports
