# Design Document - Data Visualization Dashboard

## Overview

The Data Visualization Dashboard feature adds interactive charts and graphs to visualize extracted mutual fund data. This feature will be implemented as a new view mode alongside the existing transaction table view, maintaining all current functionality while providing visual insights into portfolio performance, transaction patterns, and investment distribution.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Upload     │  │   Filter     │  │   View       │     │
│  │   Component  │  │   Panel      │  │   Toggle     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Dashboard View (NEW)                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │ Metrics    │  │ Portfolio  │  │ Timeline   │   │  │
│  │  │ Cards      │  │ Allocation │  │ Chart      │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘   │  │
│  │  ┌────────────┐  ┌────────────┐                   │  │
│  │  │ Type Dist  │  │ Monthly    │                   │  │
│  │  │ Chart      │  │ Trend      │                   │  │
│  │  └────────────┘  └────────────┘                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Transaction Table View (Existing)           │  │
│  │  - Maintains all current functionality               │  │
│  │  - Filtering, sorting, export                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js/Express)                │
│  - No changes required                                       │
│  - Existing extraction and export APIs remain unchanged      │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Header (existing)
├── PDFUploader (existing)
└── FilterView (existing, enhanced)
    ├── FilterPanel (existing)
    ├── ViewToggle (NEW)
    ├── Dashboard (NEW)
    │   ├── MetricsPanel
    │   │   ├── MetricCard (Total Investment)
    │   │   ├── MetricCard (Current Value)
    │   │   ├── MetricCard (Gains/Losses)
    │   │   └── MetricCard (Percentage Return)
    │   ├── PortfolioAllocationChart
    │   ├── TransactionTimelineChart
    │   ├── TransactionTypeChart
    │   └── MonthlyTrendChart
    └── TransactionTable (existing)
```

## Components and Interfaces

### 1. Dashboard Component

**Purpose:** Container component that orchestrates all visualization components

**Props:**
```typescript
interface DashboardProps {
  transactions: Transaction[];
  portfolioData: PortfolioData;
  darkMode: boolean;
  onFilterApply: (filter: FilterCriteria) => void;
}
```

**Responsibilities:**
- Calculate aggregated data for all charts
- Pass data to child chart components
- Handle chart interactions (click-to-filter)
- Manage chart export functionality

### 2. MetricsPanel Component

**Purpose:** Display key performance indicators

**Props:**
```typescript
interface MetricsPanelProps {
  transactions: Transaction[];
  portfolioData: PortfolioData;
  darkMode: boolean;
}
```

**Calculated Metrics:**
- Total Investment: Sum of (purchases + SIPs) - redemptions
- Current Value: Latest market value from portfolio data
- Absolute Gains/Losses: Current Value - Total Investment
- Percentage Return: ((Current Value - Total Investment) / Total Investment) × 100

### 3. PortfolioAllocationChart Component

**Purpose:** Visualize investment distribution across schemes

**Chart Type:** Pie Chart or Donut Chart

**Props:**
```typescript
interface PortfolioAllocationChartProps {
  portfolioData: PortfolioData;
  darkMode: boolean;
  onSegmentClick: (schemeName: string) => void;
  onExport: () => void;
}
```

**Data Processing:**
- Group schemes by market value
- Calculate percentage for each scheme
- If > 10 schemes, group smallest into "Others"
- Sort by market value (descending)

### 4. TransactionTimelineChart Component

**Purpose:** Show transaction history over time

**Chart Type:** Line Chart or Area Chart

**Props:**
```typescript
interface TransactionTimelineChartProps {
  transactions: Transaction[];
  darkMode: boolean;
  onDataPointClick: (dateRange: DateRange) => void;
  onExport: () => void;
}
```

**Data Processing:**
- Aggregate transactions by month or quarter
- Separate purchases and redemptions
- Calculate cumulative amounts
- Handle different time granularities based on data density

### 5. TransactionTypeChart Component

**Purpose:** Show distribution of transaction types

**Chart Type:** Bar Chart or Pie Chart

**Props:**
```typescript
interface TransactionTypeChartProps {
  transactions: Transaction[];
  darkMode: boolean;
  onTypeClick: (transactionType: string) => void;
  onExport: () => void;
}
```

**Data Processing:**
- Count transactions by type
- Calculate total amount per type
- Exclude or separate administrative transactions
- Sort by count or amount

### 6. MonthlyTrendChart Component

**Purpose:** Display monthly investment patterns

**Chart Type:** Bar Chart

**Props:**
```typescript
interface MonthlyTrendChartProps {
  transactions: Transaction[];
  darkMode: boolean;
  selectedYear?: number;
  onMonthClick: (month: string) => void;
  onExport: () => void;
}
```

**Data Processing:**
- Group transactions by month
- Calculate purchases, redemptions, and net investment per month
- Support year selection for multi-year data
- Handle missing months (show as zero)

### 7. ViewToggle Component

**Purpose:** Switch between dashboard and table views

**Props:**
```typescript
interface ViewToggleProps {
  currentView: 'dashboard' | 'table';
  onViewChange: (view: 'dashboard' | 'table') => void;
}
```

## Data Models

### Chart Data Structures

```typescript
// Portfolio Allocation Data
interface AllocationData {
  scheme: string;
  value: number;
  percentage: number;
  color: string;
}

// Timeline Data Point
interface TimelineDataPoint {
  date: string;
  purchases: number;
  redemptions: number;
  net: number;
  count: number;
}

// Transaction Type Data
interface TypeDistributionData {
  type: string;
  count: number;
  amount: number;
  percentage: number;
}

// Monthly Trend Data
interface MonthlyTrendData {
  month: string;
  year: number;
  purchases: number;
  redemptions: number;
  net: number;
}

// Performance Metrics
interface PerformanceMetrics {
  totalInvestment: number;
  currentValue: number;
  absoluteGains: number;
  percentageReturn: number;
}
```

### Chart Configuration

```typescript
interface ChartConfig {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: LegendConfig;
    tooltip: TooltipConfig;
    title: TitleConfig;
  };
  onClick?: (event: ChartEvent) => void;
  onHover?: (event: ChartEvent) => void;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Metric Calculation Accuracy
*For any* set of transactions, the total investment calculated should equal the sum of all purchase and SIP amounts minus all redemption amounts.
**Validates: Requirements 6.2**

### Property 2: Percentage Sum Invariant
*For any* portfolio allocation chart, the sum of all scheme percentages should equal 100% (within floating-point tolerance).
**Validates: Requirements 2.2**

### Property 3: Timeline Aggregation Preservation
*For any* set of transactions aggregated by time period, the sum of aggregated amounts should equal the sum of original transaction amounts.
**Validates: Requirements 3.2**

### Property 4: Transaction Count Accuracy
*For any* transaction type distribution, the sum of counts across all types should equal the total number of transactions.
**Validates: Requirements 4.2**

### Property 5: Net Investment Calculation
*For any* monthly trend data, the net investment for each month should equal purchases minus redemptions for that month.
**Validates: Requirements 5.2**

### Property 6: Gains/Losses Formula
*For any* current value and total investment, the absolute gains/losses should equal (current value - total investment).
**Validates: Requirements 6.4**

### Property 7: Percentage Return Formula
*For any* current value and total investment where total investment > 0, the percentage return should equal ((current value - total investment) / total investment) × 100.
**Validates: Requirements 6.5**

### Property 8: Color Coding Consistency
*For any* metric value, if the value is positive it should use green color, if negative it should use red color, and if zero it should use blue color.
**Validates: Requirements 6.6**

### Property 9: Filter State Preservation
*For any* filter state, switching between dashboard and table views and back should preserve the exact same filter state.
**Validates: Requirements 1.5, 12.3**

### Property 10: Chart Data Filtering
*For any* applied filter, all charts should display only transactions that match the filter criteria.
**Validates: Requirements 9.1**

### Property 11: Filter Clear Round-Trip
*For any* filtered state, clearing all filters should restore charts to show the complete original dataset.
**Validates: Requirements 9.3**

### Property 12: Metric Recalculation with Filters
*For any* applied filter, performance metrics should be recalculated using only the filtered transactions.
**Validates: Requirements 9.5**

### Property 13: Responsive Chart Resizing
*For any* viewport width, charts should resize to fit within the available space while maintaining readability.
**Validates: Requirements 10.1**

### Property 14: Dark Mode Contrast
*For any* chart in dark mode, the contrast ratio between text/lines and background should meet WCAG AA standards (minimum 4.5:1).
**Validates: Requirements 11.4**

### Property 15: Render Performance - Small Dataset
*For any* dataset with fewer than 1000 transactions, all charts should render within 2 seconds.
**Validates: Requirements 13.1**

### Property 16: Render Performance - Medium Dataset
*For any* dataset with 1000-5000 transactions, all charts should render within 5 seconds.
**Validates: Requirements 13.2**

### Property 17: Update Performance
*For any* filter change, charts should re-render within 500 milliseconds.
**Validates: Requirements 13.4**

### Property 18: Interaction Performance
*For any* user interaction (hover, click), the system should respond within 100 milliseconds.
**Validates: Requirements 13.5**

## Error Handling

### Empty Data States
- **No Transactions:** Display empty state with message "No transaction data available. Upload a CAS PDF to get started."
- **Single Transaction:** Display charts with warning "Limited data available. Charts may not be representative."
- **Filtered to Empty:** Display message "No transactions match the current filters. Try adjusting your filter criteria."

### Edge Cases
- **All Same Type:** Display single-category charts with appropriate labels
- **Very Short Date Range:** Adjust timeline to daily granularity
- **Very Long Date Range:** Aggregate by year instead of month
- **Missing Market Values:** Use last known value or display warning
- **Division by Zero:** Handle percentage calculations when total investment is zero

### Chart Rendering Errors
- **Library Load Failure:** Display fallback message with option to reload
- **Data Processing Error:** Log error and display error boundary
- **Export Failure:** Show error toast with retry option

## Testing Strategy

### Unit Tests
- Test metric calculation functions with known inputs
- Test data aggregation functions (monthly, quarterly, yearly)
- Test percentage calculation functions
- Test color coding logic
- Test filter application to chart data
- Test responsive breakpoint logic
- Test dark mode color transformations

### Property-Based Tests
- Generate random transaction datasets and verify all 18 properties
- Test with edge cases (empty, single transaction, all same type)
- Test with various date ranges (short, long, gaps)
- Test with different portfolio sizes (1 scheme, 10 schemes, 100 schemes)
- Test performance properties with datasets of varying sizes

### Integration Tests
- Test view switching preserves state
- Test chart interactions trigger correct filters
- Test export functionality for all chart types
- Test responsive behavior at different breakpoints
- Test dark mode toggle updates all charts

### Visual Regression Tests
- Capture screenshots of charts in different states
- Compare against baseline images
- Detect unintended visual changes

## Technology Choices

### Chart Library: Recharts
**Rationale:**
- React-native, built specifically for React
- Composable chart components
- Responsive by default
- Good TypeScript support
- Active maintenance and community
- Supports all required chart types
- Built-in animations and interactions

**Alternatives Considered:**
- Chart.js: More mature but not React-native
- Victory: Good but heavier bundle size
- Nivo: Beautiful but complex API

### State Management
- Use existing React Context (FilterContext)
- Add new DashboardContext for view state
- No additional state management library needed

### Export Library: html2canvas
**Rationale:**
- Converts DOM elements to canvas
- Works well with Recharts
- Simple API
- Good browser support

## Performance Optimizations

### Data Processing
- Memoize calculated metrics using `useMemo`
- Memoize aggregated chart data using `useMemo`
- Debounce filter updates to charts (300ms)
- Use Web Workers for large dataset processing (>5000 transactions)

### Rendering
- Lazy load chart components
- Use React.memo for chart components
- Implement virtual scrolling for large legends
- Aggregate data points for very large datasets

### Bundle Size
- Code split dashboard components
- Lazy load Recharts library
- Tree-shake unused chart types

## Accessibility

### Keyboard Navigation
- All chart interactions accessible via keyboard
- Tab order follows logical flow
- Focus indicators visible on all interactive elements

### Screen Readers
- ARIA labels for all charts
- Alt text for exported images
- Descriptive tooltips
- Data tables as fallback for charts

### Color Accessibility
- Sufficient contrast ratios (WCAG AA)
- Don't rely solely on color for information
- Patterns/textures in addition to colors
- Colorblind-friendly palette

## Migration Strategy

### Phase 1: Core Dashboard (Week 1-2)
- Implement Dashboard container component
- Add MetricsPanel with 4 metric cards
- Add ViewToggle component
- Integrate with existing FilterView

### Phase 2: Primary Charts (Week 3-4)
- Implement PortfolioAllocationChart
- Implement TransactionTimelineChart
- Add click-to-filter functionality
- Add chart export functionality

### Phase 3: Secondary Charts (Week 5)
- Implement TransactionTypeChart
- Implement MonthlyTrendChart
- Add year selection for monthly trends
- Refine interactions and animations

### Phase 4: Polish & Testing (Week 6)
- Responsive design refinement
- Dark mode optimization
- Performance testing and optimization
- Accessibility audit and fixes
- Documentation updates

## Backward Compatibility

### Existing Functionality Preserved
- All extraction features remain unchanged
- All filtering features remain unchanged
- All export features remain unchanged
- Transaction table view remains default
- No breaking changes to APIs or data structures

### New Features Additive
- Dashboard is an additional view mode
- Can be toggled on/off
- Does not affect existing workflows
- Gracefully degrades if chart library fails to load

## Future Enhancements

- Custom date range selection for timeline
- Comparison mode (compare two time periods)
- Scheme-specific detailed views
- Export dashboard as PDF report
- Saved dashboard configurations
- Additional chart types (scatter, radar, etc.)
- Real-time data updates (if backend supports)
- Shareable dashboard links
