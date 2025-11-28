# Filter Components

This directory contains all filter-related UI components for the advanced filtering feature.

## Components

### FilterPanel
**Purpose**: Main container component that composes all filter controls together.

**Features**:
- Integrates all individual filter components (Search, DateRange, TransactionType, Folio, AmountRange)
- Displays active filters with ActiveFilters component
- Shows "Clear All Filters" button when filters are active
- Displays filter count badge
- Responsive design with collapsible panel on mobile
- Dark mode support

**Props**:
- `darkMode` (boolean, optional): Enable dark mode styling
- `collapsible` (boolean, optional, default: true): Enable collapse functionality on mobile

**Usage**:
```jsx
import FilterPanel from './components/filters/FilterPanel';
import { FilterProvider } from './context/FilterContext';

<FilterProvider transactions={transactions}>
  <FilterPanel darkMode={isDarkMode} />
</FilterProvider>
```

**Requirements**: 9.1, 9.3, 9.4

---

### SearchBar
Text search input with debouncing for scheme name filtering.

**Props**:
- `value` (string): Current search query
- `onChange` (function): Callback when search query changes
- `placeholder` (string, optional): Input placeholder text
- `debounceMs` (number, optional, default: 300): Debounce delay in milliseconds
- `darkMode` (boolean, optional): Enable dark mode styling

---

### DateRangeFilter
Date range selection component with validation.

**Props**:
- `value` (object): Current date range `{ start: Date|null, end: Date|null }`
- `onChange` (function): Callback when date range changes
- `darkMode` (boolean, optional): Enable dark mode styling

---

### TransactionTypeFilter
Multi-select checkbox filter for transaction types.

**Props**:
- `value` (array): Selected transaction types
- `onChange` (function): Callback when selection changes
- `availableTypes` (array): List of available transaction types
- `darkMode` (boolean, optional): Enable dark mode styling

---

### FolioFilter
Dropdown filter for folio number selection.

**Props**:
- `value` (string|null): Selected folio number
- `onChange` (function): Callback when selection changes
- `availableFolios` (array): List of available folio numbers
- `darkMode` (boolean, optional): Enable dark mode styling

---

### AmountRangeFilter
Amount range input filter with validation.

**Props**:
- `value` (object): Current amount range `{ min: number|null, max: number|null }`
- `onChange` (function): Callback when amount range changes
- `darkMode` (boolean, optional): Enable dark mode styling

---

### ActiveFilters
Display and manage active filter tags with remove buttons.

**Props**:
- `filters` (FilterState): Current filter state
- `onRemoveFilter` (function): Callback to remove a specific filter
- `onClearAll` (function): Callback to clear all filters
- `darkMode` (boolean, optional): Enable dark mode styling

---

## Testing

All components have comprehensive unit tests and property-based tests. Run tests with:

```bash
npm test -- filters --watchAll=false
```

## Styling

All components follow the existing app design patterns with:
- Consistent color scheme (primary: #4472C4)
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Smooth transitions and animations
- Accessibility features (ARIA labels, keyboard navigation)
