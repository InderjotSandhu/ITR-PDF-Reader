# Requirements Document

## Introduction

The Data Visualization Dashboard feature will add interactive charts and graphs to visualize extracted mutual fund data from CAS PDFs. This feature will provide users with visual insights into their portfolio performance, transaction patterns, and investment distribution while maintaining all existing extraction, filtering, and export functionality.

## Glossary

- **Dashboard**: A visual interface displaying multiple charts and graphs showing portfolio analytics
- **Chart**: A graphical representation of data (pie chart, bar chart, line chart, etc.)
- **Portfolio Allocation**: Distribution of investments across different mutual fund schemes
- **Transaction Timeline**: Chronological view of all transactions over time
- **Performance Metrics**: Key indicators like total investment, current value, gains/losses
- **Interactive Chart**: A chart that responds to user interactions (hover, click, zoom)
- **Chart Library**: A JavaScript library for rendering charts (e.g., Chart.js, Recharts)
- **Responsive Chart**: A chart that adapts to different screen sizes
- **Export Chart**: Ability to download chart as an image file

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a visual dashboard after extracting CAS data, so that I can quickly understand my portfolio composition and performance.

#### Acceptance Criteria

1. WHEN a user successfully extracts CAS data THEN the system SHALL display a dashboard view with multiple visualization charts
2. WHEN the dashboard is displayed THEN the system SHALL show at least 4 different chart types (portfolio allocation, transaction timeline, transaction type distribution, and monthly investment trend)
3. WHEN the dashboard loads THEN the system SHALL calculate and display key metrics (total investment, current value, total gains/losses, percentage return)
4. WHEN the user views the dashboard THEN the system SHALL maintain access to all existing features (filtering, search, export, transaction table)
5. WHEN the user switches between dashboard and table views THEN the system SHALL preserve filter states and data

### Requirement 2

**User Story:** As a user, I want to see my portfolio allocation across different schemes, so that I can understand how my investments are distributed.

#### Acceptance Criteria

1. WHEN the dashboard displays portfolio allocation THEN the system SHALL show a pie chart or donut chart with each scheme as a segment
2. WHEN displaying portfolio allocation THEN the system SHALL calculate percentages based on current market value for each scheme
3. WHEN a user hovers over a chart segment THEN the system SHALL display the scheme name, market value, and percentage
4. WHEN there are more than 10 schemes THEN the system SHALL group smaller schemes into an "Others" category
5. WHEN the user clicks on a chart segment THEN the system SHALL filter the transaction table to show only transactions for that scheme

### Requirement 3

**User Story:** As a user, I want to see my transaction history over time, so that I can understand my investment patterns and timing.

#### Acceptance Criteria

1. WHEN the dashboard displays transaction timeline THEN the system SHALL show a line chart or area chart with time on X-axis and transaction amounts on Y-axis
2. WHEN displaying transaction timeline THEN the system SHALL aggregate transactions by month or quarter based on data density
3. WHEN a user hovers over a data point THEN the system SHALL display the date, transaction count, and total amount
4. WHEN the timeline shows multiple transaction types THEN the system SHALL use different colors or lines for purchases vs redemptions
5. WHEN the user clicks on a data point THEN the system SHALL filter the transaction table to show transactions for that time period

### Requirement 4

**User Story:** As a user, I want to see the distribution of my transaction types, so that I can understand my investment behavior.

#### Acceptance Criteria

1. WHEN the dashboard displays transaction type distribution THEN the system SHALL show a bar chart or pie chart with each transaction type
2. WHEN displaying transaction type distribution THEN the system SHALL count the number of transactions for each type (Purchase, SIP, Redemption, Switch-In, Switch-Out, Dividend)
3. WHEN a user hovers over a chart element THEN the system SHALL display the transaction type, count, and total amount
4. WHEN the user clicks on a transaction type THEN the system SHALL filter the transaction table to show only that transaction type
5. WHEN administrative transactions exist THEN the system SHALL display them separately or exclude them from the main chart

### Requirement 5

**User Story:** As a user, I want to see my monthly investment trends, so that I can track my investment discipline and patterns.

#### Acceptance Criteria

1. WHEN the dashboard displays monthly investment trend THEN the system SHALL show a bar chart with months on X-axis and investment amounts on Y-axis
2. WHEN displaying monthly trends THEN the system SHALL calculate net investment (purchases minus redemptions) for each month
3. WHEN a user hovers over a bar THEN the system SHALL display the month, total purchases, total redemptions, and net investment
4. WHEN there are multiple years of data THEN the system SHALL allow the user to select a specific year or view all years
5. WHEN the user clicks on a month bar THEN the system SHALL filter the transaction table to show transactions for that month

### Requirement 6

**User Story:** As a user, I want to see key performance metrics at a glance, so that I can quickly assess my portfolio health.

#### Acceptance Criteria

1. WHEN the dashboard displays performance metrics THEN the system SHALL show metric cards for total investment, current value, absolute gains/losses, and percentage return
2. WHEN calculating total investment THEN the system SHALL sum all purchase and SIP transactions minus redemptions
3. WHEN calculating current value THEN the system SHALL use the latest market value from the CAS data
4. WHEN calculating gains/losses THEN the system SHALL compute (current value - total investment)
5. WHEN calculating percentage return THEN the system SHALL compute ((current value - total investment) / total investment) × 100
6. WHEN metrics are displayed THEN the system SHALL use color coding (green for positive, red for negative, blue for neutral)

### Requirement 7

**User Story:** As a user, I want interactive charts that respond to my actions, so that I can explore my data in detail.

#### Acceptance Criteria

1. WHEN a user hovers over any chart element THEN the system SHALL display a tooltip with detailed information
2. WHEN a user clicks on a chart element THEN the system SHALL apply the corresponding filter to the transaction table
3. WHEN a user clicks on a legend item THEN the system SHALL toggle the visibility of that data series
4. WHEN charts support zooming THEN the system SHALL allow the user to zoom in/out on time-based charts
5. WHEN the user interacts with charts THEN the system SHALL provide smooth animations and transitions

### Requirement 8

**User Story:** As a user, I want to export charts as images, so that I can include them in reports or presentations.

#### Acceptance Criteria

1. WHEN a user views a chart THEN the system SHALL provide an export button for that chart
2. WHEN a user clicks the export button THEN the system SHALL download the chart as a PNG image file
3. WHEN exporting a chart THEN the system SHALL maintain the chart's current state (filters, zoom level, selected data)
4. WHEN exporting a chart THEN the system SHALL include a title and timestamp in the image
5. WHEN multiple charts are displayed THEN the system SHALL provide an option to export all charts at once

### Requirement 9

**User Story:** As a user, I want the dashboard to work with filtered data, so that I can visualize specific subsets of my transactions.

#### Acceptance Criteria

1. WHEN a user applies filters (date range, transaction type, folio, amount range, search) THEN the system SHALL update all charts to reflect only the filtered data
2. WHEN filters are applied THEN the system SHALL display a visual indicator showing that charts are filtered
3. WHEN a user clears filters THEN the system SHALL restore all charts to show complete data
4. WHEN filtered data results in empty charts THEN the system SHALL display an appropriate message
5. WHEN filters are applied THEN the system SHALL update performance metrics to reflect filtered data only

### Requirement 10

**User Story:** As a user, I want responsive charts that work on all devices, so that I can view my dashboard on mobile, tablet, or desktop.

#### Acceptance Criteria

1. WHEN the dashboard is viewed on different screen sizes THEN the system SHALL resize charts appropriately
2. WHEN viewed on mobile devices THEN the system SHALL stack charts vertically for better readability
3. WHEN viewed on tablets THEN the system SHALL display charts in a 2-column grid layout
4. WHEN viewed on desktop THEN the system SHALL display charts in a multi-column layout for optimal space usage
5. WHEN charts are resized THEN the system SHALL maintain readability of labels, legends, and tooltips

### Requirement 11

**User Story:** As a user, I want the dashboard to support dark mode, so that I can view charts comfortably in low-light conditions.

#### Acceptance Criteria

1. WHEN dark mode is enabled THEN the system SHALL update all chart colors to be suitable for dark backgrounds
2. WHEN dark mode is enabled THEN the system SHALL use light-colored text and gridlines for visibility
3. WHEN dark mode is toggled THEN the system SHALL smoothly transition chart colors without reloading data
4. WHEN dark mode is enabled THEN the system SHALL maintain sufficient contrast for accessibility
5. WHEN dark mode is enabled THEN the system SHALL update metric cards and dashboard background accordingly

### Requirement 12

**User Story:** As a user, I want to toggle between dashboard view and table view, so that I can choose my preferred way of viewing data.

#### Acceptance Criteria

1. WHEN the user is viewing the dashboard THEN the system SHALL provide a toggle button to switch to table view
2. WHEN the user is viewing the table THEN the system SHALL provide a toggle button to switch to dashboard view
3. WHEN switching between views THEN the system SHALL preserve all applied filters
4. WHEN switching between views THEN the system SHALL maintain the current data state without re-extraction
5. WHEN switching views THEN the system SHALL provide smooth transitions and loading indicators if needed

### Requirement 13

**User Story:** As a developer, I want the dashboard to be performant with large datasets, so that users have a smooth experience even with years of transaction data.

#### Acceptance Criteria

1. WHEN the dashboard loads with less than 1000 transactions THEN the system SHALL render all charts within 2 seconds
2. WHEN the dashboard loads with 1000-5000 transactions THEN the system SHALL render all charts within 5 seconds
3. WHEN the dashboard loads with more than 5000 transactions THEN the system SHALL use data aggregation or sampling to maintain performance
4. WHEN charts are updated due to filter changes THEN the system SHALL re-render within 500 milliseconds
5. WHEN the user interacts with charts THEN the system SHALL respond to interactions within 100 milliseconds

### Requirement 14

**User Story:** As a user, I want the dashboard to handle edge cases gracefully, so that I always have a good experience regardless of my data.

#### Acceptance Criteria

1. WHEN there is no transaction data THEN the system SHALL display an empty state message with instructions
2. WHEN there is only one transaction THEN the system SHALL display charts with appropriate messaging about limited data
3. WHEN all transactions are of the same type THEN the system SHALL display distribution charts with a single category
4. WHEN date ranges are very short (less than 1 month) THEN the system SHALL adjust time-based charts to show daily data
5. WHEN date ranges are very long (more than 10 years) THEN the system SHALL aggregate data by year for better visualization
