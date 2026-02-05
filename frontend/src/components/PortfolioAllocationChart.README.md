# PortfolioAllocationChart Component

## Overview
The `PortfolioAllocationChart` component displays a pie chart visualization of portfolio distribution across different mutual fund schemes. It supports interactive features like click-to-filter and chart export.

## Features
- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode Support**: Automatically adjusts colors for dark mode
- **Interactive Tooltips**: Shows detailed information on hover
- **Click-to-Filter**: Click on a segment to filter transactions by scheme
- **Chart Export**: Export chart as PNG image with timestamp
- **Smart Grouping**: Automatically groups schemes beyond 10 into "Others" category
- **Custom Colors**: Each scheme gets a unique color

## Usage

```jsx
import PortfolioAllocationChart from './components/PortfolioAllocationChart';
import { FilterProvider } from './context/FilterContext';

function Dashboard() {
  const portfolioData = {
    portfolioSummary: [
      { fundName: 'HDFC Equity Fund', marketValue: 150000, costValue: 120000 },
      { fundName: 'ICICI Prudential Fund', marketValue: 100000, costValue: 90000 },
      { fundName: 'SBI Bluechip Fund', marketValue: 75000, costValue: 70000 }
    ]
  };

  return (
    <FilterProvider transactions={transactions}>
      <PortfolioAllocationChart
        portfolioData={portfolioData}
        darkMode={false}
      />
    </FilterProvider>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `portfolioData` | Object | Yes | `null` | Portfolio data containing `portfolioSummary` array |
| `darkMode` | Boolean | No | `false` | Enable dark mode styling |

## Portfolio Data Structure

```javascript
{
  portfolioSummary: [
    {
      fundName: string,      // Name of the mutual fund scheme
      marketValue: number,   // Current market value
      costValue: number      // Original cost value
    }
  ]
}
```

## Integration with FilterContext

The component automatically integrates with the `FilterContext` to enable click-to-filter functionality. When a user clicks on a pie segment:

1. The scheme name is set as the `searchQuery` filter
2. The transaction table automatically filters to show only transactions for that scheme
3. The active filter is displayed in the filter panel

**Note**: Clicking on the "Others" category does not apply a filter since it represents multiple schemes.

## Export Functionality

The export button captures the current chart state and downloads it as a PNG image with:
- High resolution (2x scale)
- Proper background color (respects dark mode)
- Timestamp in filename: `portfolio-allocation-YYYY-MM-DDTHH-MM-SS.png`

## Empty States

The component handles empty states gracefully:
- **No Portfolio Data**: Shows "No portfolio data available" message
- **Empty Portfolio Summary**: Shows same empty state message
- **Zero Market Values**: Filters out schemes with zero market value

## Styling

The component uses CSS classes that can be customized:
- `.portfolio-allocation-chart` - Main container
- `.portfolio-allocation-chart.dark-mode` - Dark mode variant
- `.chart-header` - Header with title and export button
- `.export-button` - Export button styling
- `.custom-tooltip` - Tooltip styling

## Requirements Validated

This component validates the following requirements:
- **2.1**: Displays pie chart with each scheme as a segment
- **2.2**: Calculates percentages based on current market value
- **2.3**: Shows scheme name, market value, and percentage on hover
- **2.4**: Groups schemes beyond 10 into "Others" category
- **2.5**: Filters transaction table when segment is clicked
- **8.1**: Provides export button for the chart
- **8.2**: Downloads chart as PNG image
- **8.4**: Includes title and timestamp in export

## Dependencies

- `recharts` - Chart library
- `html2canvas` - Chart export functionality
- `react` - React framework
- `FilterContext` - Filter state management
- `dashboardUtils` - Data processing utilities
