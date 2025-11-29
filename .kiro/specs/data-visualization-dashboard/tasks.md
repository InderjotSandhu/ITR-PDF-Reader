# Implementation Plan - Data Visualization Dashboard

- [ ] 1. Set up project dependencies and chart library
  - Install Recharts library (`npm install recharts`)
  - Install html2canvas for chart export (`npm install html2canvas`)
  - Install date-fns for date manipulation (if not already installed)
  - Update package.json with new dependencies
  - _Requirements: All_

- [ ] 2. Create data processing utilities
  - [ ] 2.1 Implement metric calculation functions
    - Create `calculateTotalInvestment()` function
    - Create `calculateGainsLosses()` function
    - Create `calculatePercentageReturn()` function
    - Create `getColorForValue()` function for color coding
    - _Requirements: 6.2, 6.4, 6.5, 6.6_

  - [ ] 2.2 Write property test for metric calculations
    - **Property 1: Metric Calculation Accuracy**
    - **Property 6: Gains/Losses Formula**
    - **Property 7: Percentage Return Formula**
    - **Property 8: Color Coding Consistency**
    - **Validates: Requirements 6.2, 6.4, 6.5, 6.6**

  - [ ] 2.3 Implement portfolio allocation data processing
    - Create `calculatePortfolioAllocation()` function
    - Implement scheme grouping logic (>10 schemes → "Others")
    - Calculate percentages for each scheme
    - _Requirements: 2.2, 2.4_

  - [ ] 2.4 Write property test for portfolio allocation
    - **Property 2: Percentage Sum Invariant**
    - **Validates: Requirements 2.2**

  - [ ] 2.5 Implement timeline data aggregation
    - Create `aggregateTransactionsByPeriod()` function
    - Support monthly, quarterly, and yearly aggregation
    - Separate purchases and redemptions
    - _Requirements: 3.2_

  - [ ] 2.6 Write property test for timeline aggregation
    - **Property 3: Timeline Aggregation Preservation**
    - **Validates: Requirements 3.2**

  - [ ] 2.7 Implement transaction type distribution processing
    - Create `calculateTypeDistribution()` function
    - Count transactions by type
    - Calculate total amounts per type
    - Handle administrative transactions separately
    - _Requirements: 4.2_

  - [ ] 2.8 Write property test for type distribution
    - **Property 4: Transaction Count Accuracy**
    - **Validates: Requirements 4.2**

  - [ ] 2.9 Implement monthly trend data processing
    - Create `calculateMonthlyTrends()` function
    - Group by month and year
    - Calculate purchases, redemptions, and net investment
    - _Requirements: 5.2_

  - [ ] 2.10 Write property test for monthly trends
    - **Property 5: Net Investment Calculation**
    - **Validates: Requirements 5.2**

- [ ] 3. Create Dashboard context and state management
  - [ ] 3.1 Create DashboardContext
    - Define context interface with view state
    - Implement context provider component
    - Create `useDashboard` custom hook
    - _Requirements: 12.1, 12.2_

  - [ ] 3.2 Implement view toggle logic
    - Add view state ('dashboard' | 'table')
    - Implement view switching function
    - Preserve filter state during view switches
    - _Requirements: 12.3, 12.4_

  - [ ] 3.3 Write property test for state preservation
    - **Property 9: Filter State Preservation**
    - **Validates: Requirements 1.5, 12.3**

- [ ] 4. Build MetricsPanel component
  - [ ] 4.1 Create MetricCard component
    - Design card layout with value, label, and icon
    - Implement color coding based on value
    - Add responsive styling
    - Support dark mode
    - _Requirements: 6.1, 6.6_

  - [ ] 4.2 Create MetricsPanel container
    - Layout 4 metric cards in a grid
    - Calculate and pass metrics to cards
    - Handle loading and error states
    - _Requirements: 6.1, 6.3_

  - [ ]* 4.3 Write unit tests for MetricsPanel
    - Test metric card rendering
    - Test color coding logic
    - Test responsive layout
    - Test dark mode styling
    - _Requirements: 6.1, 6.6_

- [ ] 5. Build PortfolioAllocationChart component
  - [ ] 5.1 Implement chart component
    - Use Recharts PieChart or DonutChart
    - Configure responsive behavior
    - Add custom colors for schemes
    - Implement tooltip with scheme details
    - _Requirements: 2.1, 2.3_

  - [ ] 5.2 Add click-to-filter functionality
    - Handle segment click events
    - Apply scheme filter to transaction table
    - Update active filters display
    - _Requirements: 2.5_

  - [ ] 5.3 Add chart export functionality
    - Implement export button
    - Use html2canvas to capture chart
    - Download as PNG with title and timestamp
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ]* 5.4 Write unit tests for PortfolioAllocationChart
    - Test chart rendering with various data
    - Test click-to-filter interaction
    - Test export functionality
    - Test "Others" grouping logic
    - _Requirements: 2.1, 2.4, 2.5, 8.2_

- [ ] 6. Build TransactionTimelineChart component
  - [ ] 6.1 Implement chart component
    - Use Recharts LineChart or AreaChart
    - Configure time-based X-axis
    - Add separate lines for purchases and redemptions
    - Implement tooltip with transaction details
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ] 6.2 Add click-to-filter functionality
    - Handle data point click events
    - Apply date range filter for clicked period
    - Update active filters display
    - _Requirements: 3.5_

  - [ ] 6.3 Add zoom functionality
    - Implement zoom controls
    - Allow zooming on time axis
    - Reset zoom button
    - _Requirements: 7.4_

  - [ ] 6.4 Add chart export functionality
    - Implement export button
    - Capture chart with current zoom state
    - Download as PNG
    - _Requirements: 8.2, 8.3_

  - [ ]* 6.5 Write unit tests for TransactionTimelineChart
    - Test chart rendering with time series data
    - Test aggregation by different periods
    - Test click-to-filter interaction
    - Test zoom functionality
    - _Requirements: 3.1, 3.2, 3.5, 7.4_

- [ ] 7. Build TransactionTypeChart component
  - [ ] 7.1 Implement chart component
    - Use Recharts BarChart or PieChart
    - Configure with transaction types
    - Add custom colors for each type
    - Implement tooltip with type details
    - _Requirements: 4.1, 4.3_

  - [ ] 7.2 Handle administrative transactions
    - Separate or exclude admin transactions
    - Add toggle to show/hide admin transactions
    - _Requirements: 4.5_

  - [ ] 7.3 Add click-to-filter functionality
    - Handle bar/segment click events
    - Apply transaction type filter
    - Update active filters display
    - _Requirements: 4.4_

  - [ ] 7.4 Add chart export functionality
    - Implement export button
    - Download as PNG
    - _Requirements: 8.2_

  - [ ]* 7.5 Write unit tests for TransactionTypeChart
    - Test chart rendering with type distribution
    - Test admin transaction handling
    - Test click-to-filter interaction
    - _Requirements: 4.1, 4.4, 4.5_

- [ ] 8. Build MonthlyTrendChart component
  - [ ] 8.1 Implement chart component
    - Use Recharts BarChart
    - Configure with months on X-axis
    - Show purchases, redemptions, and net as stacked/grouped bars
    - Implement tooltip with monthly details
    - _Requirements: 5.1, 5.3_

  - [ ] 8.2 Add year selection control
    - Implement year dropdown
    - Filter data by selected year
    - Add "All Years" option
    - _Requirements: 5.4_

  - [ ] 8.3 Add click-to-filter functionality
    - Handle bar click events
    - Apply month filter to transaction table
    - Update active filters display
    - _Requirements: 5.5_

  - [ ] 8.4 Add chart export functionality
    - Implement export button
    - Download as PNG
    - _Requirements: 8.2_

  - [ ]* 8.5 Write unit tests for MonthlyTrendChart
    - Test chart rendering with monthly data
    - Test year selection functionality
    - Test click-to-filter interaction
    - _Requirements: 5.1, 5.4, 5.5_

- [ ] 9. Create Dashboard container component
  - [ ] 9.1 Implement Dashboard component
    - Create layout grid for all charts
    - Add MetricsPanel at the top
    - Arrange 4 charts in responsive grid
    - Handle loading states
    - _Requirements: 1.1, 1.2_

  - [ ] 9.2 Integrate with filter system
    - Connect to FilterContext
    - Pass filtered data to all charts
    - Update charts when filters change
    - Display filter indicator on dashboard
    - _Requirements: 9.1, 9.2_

  - [ ]* 9.3 Write property test for filter integration
    - **Property 10: Chart Data Filtering**
    - **Property 11: Filter Clear Round-Trip**
    - **Property 12: Metric Recalculation with Filters**
    - **Validates: Requirements 9.1, 9.3, 9.5**

  - [ ] 9.4 Add bulk export functionality
    - Implement "Export All Charts" button
    - Capture all charts sequentially
    - Create ZIP file with all images
    - _Requirements: 8.5_

  - [ ]* 9.5 Write unit tests for Dashboard
    - Test dashboard rendering
    - Test chart layout at different breakpoints
    - Test bulk export functionality
    - _Requirements: 1.1, 1.2, 8.5_

- [ ] 10. Implement ViewToggle component
  - [ ] 10.1 Create toggle UI
    - Design toggle button/tabs
    - Add icons for dashboard and table views
    - Implement active state styling
    - Support dark mode
    - _Requirements: 12.1, 12.2_

  - [ ] 10.2 Integrate with view switching logic
    - Connect to DashboardContext
    - Handle view change events
    - Preserve filter state during switches
    - _Requirements: 12.3, 12.4_

  - [ ]* 10.3 Write unit tests for ViewToggle
    - Test toggle rendering
    - Test view switching
    - Test state preservation
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 11. Implement responsive design
  - [ ] 11.1 Add responsive breakpoints
    - Define breakpoints for mobile, tablet, desktop
    - Implement responsive grid layouts
    - Adjust chart sizes for different screens
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 11.2 Write property test for responsive behavior
    - **Property 13: Responsive Chart Resizing**
    - **Validates: Requirements 10.1**

  - [ ]* 11.3 Write unit tests for responsive layouts
    - Test mobile layout (vertical stack)
    - Test tablet layout (2-column grid)
    - Test desktop layout (multi-column)
    - _Requirements: 10.2, 10.3, 10.4_

- [ ] 12. Implement dark mode support
  - [ ] 12.1 Create dark mode color schemes
    - Define color palettes for dark mode
    - Ensure sufficient contrast ratios
    - Test with colorblind simulators
    - _Requirements: 11.1, 11.2, 11.4_

  - [ ]* 12.2 Write property test for dark mode contrast
    - **Property 14: Dark Mode Contrast**
    - **Validates: Requirements 11.4**

  - [ ] 12.3 Apply dark mode to all charts
    - Update Recharts theme configuration
    - Apply dark colors to all chart components
    - Update metric cards for dark mode
    - Test smooth transitions
    - _Requirements: 11.1, 11.3, 11.5_

  - [ ]* 12.4 Write unit tests for dark mode
    - Test color scheme application
    - Test theme toggle transitions
    - Test contrast ratios
    - _Requirements: 11.1, 11.3, 11.4_

- [ ] 13. Implement interactive features
  - [ ] 13.1 Add hover interactions
    - Implement tooltips for all charts
    - Show detailed information on hover
    - Add hover effects to chart elements
    - _Requirements: 7.1_

  - [ ] 13.2 Add legend interactions
    - Implement legend click to toggle series
    - Update chart when series toggled
    - Maintain toggle state
    - _Requirements: 7.3_

  - [ ]* 13.3 Write unit tests for interactions
    - Test tooltip display on hover
    - Test legend toggle functionality
    - Test click-to-filter across all charts
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14. Implement performance optimizations
  - [ ] 14.1 Add memoization
    - Memoize metric calculations with useMemo
    - Memoize chart data processing with useMemo
    - Memoize chart components with React.memo
    - _Requirements: 13.1, 13.2_

  - [ ] 14.2 Implement lazy loading
    - Code split dashboard components
    - Lazy load Recharts library
    - Show loading indicators during load
    - _Requirements: 13.1_

  - [ ] 14.3 Add debouncing for filter updates
    - Debounce filter changes (300ms)
    - Prevent excessive re-renders
    - _Requirements: 13.4_

  - [ ]* 14.4 Write property tests for performance
    - **Property 15: Render Performance - Small Dataset**
    - **Property 16: Render Performance - Medium Dataset**
    - **Property 17: Update Performance**
    - **Property 18: Interaction Performance**
    - **Validates: Requirements 13.1, 13.2, 13.4, 13.5**

- [ ] 15. Handle edge cases and empty states
  - [ ] 15.1 Implement empty state components
    - Create EmptyState component for no data
    - Create LimitedDataWarning component
    - Create NoResultsMessage component for filtered empty
    - _Requirements: 14.1, 14.2_

  - [ ] 15.2 Handle edge case data
    - Single transaction handling
    - All same type handling
    - Very short date range handling
    - Very long date range handling
    - _Requirements: 14.2, 14.3, 14.4, 14.5_

  - [ ]* 15.3 Write unit tests for edge cases
    - Test empty data state
    - Test single transaction
    - Test all same type
    - Test short and long date ranges
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 16. Implement accessibility features
  - [ ] 16.1 Add keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Implement logical tab order
    - Add visible focus indicators
    - _Requirements: All interactive features_

  - [ ] 16.2 Add ARIA labels and roles
    - Add ARIA labels to all charts
    - Add descriptive alt text for exports
    - Implement ARIA live regions for updates
    - _Requirements: All charts_

  - [ ] 16.3 Add screen reader support
    - Provide data tables as fallback
    - Add descriptive tooltips
    - Test with screen readers
    - _Requirements: All charts_

  - [ ]* 16.4 Write accessibility tests
    - Test keyboard navigation
    - Test ARIA labels
    - Test screen reader compatibility
    - _Requirements: All_

- [ ] 17. Update existing components
  - [ ] 17.1 Update FilterView component
    - Add ViewToggle component
    - Conditionally render Dashboard or TransactionTable
    - Maintain existing functionality
    - _Requirements: 1.4, 12.1, 12.2_

  - [ ] 17.2 Update App.css for dashboard styles
    - Add dashboard-specific styles
    - Ensure consistency with existing theme
    - Add responsive styles
    - _Requirements: All_

  - [ ]* 17.3 Write integration tests
    - Test FilterView with dashboard
    - Test view switching
    - Test filter preservation
    - _Requirements: 1.4, 12.3, 12.4_

- [ ] 18. Create documentation
  - [ ] 18.1 Update README.md
    - Add dashboard feature description
    - Add screenshots of dashboard
    - Update feature list
    - _Requirements: All_

  - [ ] 18.2 Update DOCUMENTATION.md
    - Add dashboard usage guide
    - Document chart interactions
    - Add troubleshooting section
    - _Requirements: All_

  - [ ] 18.3 Create dashboard user guide
    - Document each chart type
    - Explain metric calculations
    - Provide usage examples
    - _Requirements: All_

- [ ] 19. Final testing and polish
  - [ ] 19.1 Run all tests
    - Run unit tests
    - Run property-based tests
    - Run integration tests
    - Fix any failing tests
    - _Requirements: All_

  - [ ] 19.2 Performance testing
    - Test with small datasets (<1000 transactions)
    - Test with medium datasets (1000-5000 transactions)
    - Test with large datasets (>5000 transactions)
    - Optimize as needed
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ] 19.3 Cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge
    - Fix browser-specific issues
    - Ensure consistent behavior
    - _Requirements: All_

  - [ ] 19.4 Accessibility audit
    - Run automated accessibility tests
    - Manual testing with keyboard only
    - Test with screen readers
    - Fix accessibility issues
    - _Requirements: All_

  - [ ] 19.5 Visual polish
    - Refine animations and transitions
    - Ensure consistent spacing and alignment
    - Optimize colors and contrast
    - Final design review
    - _Requirements: All_

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
