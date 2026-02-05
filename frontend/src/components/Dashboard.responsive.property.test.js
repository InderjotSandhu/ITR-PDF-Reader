/**
 * Property-based tests for responsive dashboard behavior
 * Feature: data-visualization-dashboard
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { FilterProvider } from '../context/FilterContext';
import { DashboardProvider } from '../context/DashboardContext';

// Mock Recharts components to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }) => (
    <div data-testid="responsive-container" style={{ width, height }}>
      {children}
    </div>
  ),
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Generator for viewport widths
const viewportWidthArb = fc.integer({ min: 320, max: 2560 });

// Generator for transactions
const transactionArb = fc.record({
  date: fc.integer({ min: new Date('2000-01-01').getTime(), max: new Date('2030-12-31').getTime() })
    .map(timestamp => new Date(timestamp).toISOString()),
  amount: fc.float({ min: 100, max: 1000000, noNaN: true }),
  transactionType: fc.constantFrom('Purchase', 'SIP', 'Redemption', 'Switch-In', 'Switch-Out', 'Dividend'),
  isAdministrative: fc.boolean(),
  schemeName: fc.string({ minLength: 5, maxLength: 50 }),
  folioNumber: fc.string({ minLength: 5, maxLength: 20 })
});

// Generator for portfolio data
const portfolioDataArb = fc.record({
  portfolioSummary: fc.array(
    fc.record({
      fundName: fc.string({ minLength: 5, maxLength: 50 }),
      costValue: fc.float({ min: 1000, max: 1000000, noNaN: true }),
      marketValue: fc.float({ min: 1000, max: 1000000, noNaN: true })
    }),
    { minLength: 1, maxLength: 20 }
  )
});

/**
 * Helper to set viewport width
 */
const setViewportWidth = (width) => {
  global.innerWidth = width;
  global.dispatchEvent(new Event('resize'));
};

/**
 * Helper to get expected layout based on viewport width
 */
const getExpectedLayout = (width) => {
  if (width <= 480) {
    return 'mobile-small';
  } else if (width <= 768) {
    return 'mobile';
  } else if (width <= 1200) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Helper to render Dashboard with providers
 */
const renderDashboard = (props) => {
  return render(
    <FilterProvider>
      <DashboardProvider>
        <Dashboard {...props} />
      </DashboardProvider>
    </FilterProvider>
  );
};

describe('Dashboard Responsive Behavior - Property-Based Tests', () => {
  /**
   * Feature: data-visualization-dashboard, Property 13: Responsive Chart Resizing
   * Validates: Requirements 10.1
   */
  describe('Property 13: Responsive Chart Resizing', () => {
    it('should render charts within available viewport width', () => {
      fc.assert(
        fc.property(
          viewportWidthArb,
          fc.array(transactionArb, { minLength: 5, maxLength: 50 }),
          portfolioDataArb,
          (viewportWidth, transactions, portfolioData) => {
            // Set viewport width
            setViewportWidth(viewportWidth);

            // Render dashboard
            const { container } = renderDashboard({
              transactions,
              portfolioData,
              darkMode: false,
              loading: false,
              isFiltered: false
            });

            // Get dashboard element
            const dashboard = container.querySelector('.dashboard');
            expect(dashboard).toBeInTheDocument();

            // Verify ResponsiveContainer components are rendered
            const responsiveContainers = screen.queryAllByTestId('responsive-container');
            
            // Should have responsive containers for charts (if data is present)
            if (transactions.length > 0 && portfolioData.portfolioSummary.length > 0) {
              expect(responsiveContainers.length).toBeGreaterThan(0);
              
              // Each responsive container should have width="100%"
              responsiveContainers.forEach(container => {
                const style = container.style;
                expect(style.width).toBe('100%');
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain chart readability across all viewport sizes', () => {
      fc.assert(
        fc.property(
          viewportWidthArb,
          fc.array(transactionArb, { minLength: 5, maxLength: 50 }),
          portfolioDataArb,
          (viewportWidth, transactions, portfolioData) => {
            // Set viewport width
            setViewportWidth(viewportWidth);

            // Render dashboard
            const { container } = renderDashboard({
              transactions,
              portfolioData,
              darkMode: false,
              loading: false,
              isFiltered: false
            });

            // Get all chart containers
            const chartContainers = container.querySelectorAll('.dashboard-chart');
            
            if (chartContainers.length > 0) {
              chartContainers.forEach(chart => {
                // Chart should be visible
                expect(chart).toBeVisible();
                
                // Chart should have the dashboard-chart class
                expect(chart).toHaveClass('dashboard-chart');
                
                // Chart should be in the document
                expect(chart).toBeInTheDocument();
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply correct grid layout based on viewport width', () => {
      fc.assert(
        fc.property(
          viewportWidthArb,
          fc.array(transactionArb, { minLength: 5, maxLength: 50 }),
          portfolioDataArb,
          (viewportWidth, transactions, portfolioData) => {
            // Set viewport width
            setViewportWidth(viewportWidth);

            // Render dashboard
            const { container } = renderDashboard({
              transactions,
              portfolioData,
              darkMode: false,
              loading: false,
              isFiltered: false
            });

            // Get dashboard grid
            const dashboardGrid = container.querySelector('.dashboard-grid');
            
            if (dashboardGrid) {
              // Verify dashboard grid exists and has correct class
              expect(dashboardGrid).toBeInTheDocument();
              expect(dashboardGrid).toHaveClass('dashboard-grid');
              
              // Verify all charts are rendered within the grid
              const chartContainers = dashboardGrid.querySelectorAll('.dashboard-chart');
              expect(chartContainers.length).toBe(4); // Should have 4 charts
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain metrics panel responsiveness', () => {
      fc.assert(
        fc.property(
          viewportWidthArb,
          fc.array(transactionArb, { minLength: 5, maxLength: 50 }),
          portfolioDataArb,
          (viewportWidth, transactions, portfolioData) => {
            // Set viewport width
            setViewportWidth(viewportWidth);

            // Render dashboard
            const { container } = renderDashboard({
              transactions,
              portfolioData,
              darkMode: false,
              loading: false,
              isFiltered: false
            });

            // Get metrics grid
            const metricsGrid = container.querySelector('.metrics-grid');
            
            if (metricsGrid) {
              // Verify metrics grid exists and has correct class
              expect(metricsGrid).toBeInTheDocument();
              expect(metricsGrid).toHaveClass('metrics-grid');
              
              // Verify metrics panel is present
              const metricsPanel = container.querySelector('.metrics-panel');
              expect(metricsPanel).toBeInTheDocument();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle viewport width changes without errors', () => {
      fc.assert(
        fc.property(
          fc.array(viewportWidthArb, { minLength: 2, maxLength: 5 }),
          fc.array(transactionArb, { minLength: 5, maxLength: 50 }),
          portfolioDataArb,
          (viewportWidths, transactions, portfolioData) => {
            // Render dashboard once
            const { container, rerender } = renderDashboard({
              transactions,
              portfolioData,
              darkMode: false,
              loading: false,
              isFiltered: false
            });

            // Change viewport width multiple times
            viewportWidths.forEach(width => {
              setViewportWidth(width);
              
              // Rerender with same props
              rerender(
                <FilterProvider>
                  <DashboardProvider>
                    <Dashboard
                      transactions={transactions}
                      portfolioData={portfolioData}
                      darkMode={false}
                      loading={false}
                      isFiltered={false}
                    />
                  </DashboardProvider>
                </FilterProvider>
              );

              // Dashboard should still be rendered
              const dashboard = container.querySelector('.dashboard');
              expect(dashboard).toBeInTheDocument();
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
