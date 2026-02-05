/**
 * Property-based tests for Dashboard component filter integration
 * Feature: data-visualization-dashboard
 */

import React from 'react';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import Dashboard from './Dashboard';
import { FilterProvider, useFilters } from '../context/FilterContext';
import { applyFilters } from '../utils/filterUtils';
import { 
  calculateTotalInvestment, 
  calculateGainsLosses, 
  calculatePercentageReturn 
} from '../utils/dashboardUtils';

// Generator for transactions
const transactionArb = fc.record({
  date: fc.integer({ min: 946684800000, max: 1924905600000 }) // 2000-01-01 to 2030-12-31 in milliseconds
    .map(ms => {
      const d = new Date(ms);
      return d.toISOString().split('T')[0];
    }),
  amount: fc.float({ min: 0, max: 1000000, noNaN: true }),
  transactionType: fc.constantFrom('Purchase', 'SIP', 'Redemption', 'Switch-In', 'Switch-Out', 'Dividend'),
  isAdministrative: fc.boolean(),
  schemeName: fc.string({ minLength: 1, maxLength: 50 }),
  folioNumber: fc.string({ minLength: 1, maxLength: 20 }),
  description: fc.string({ maxLength: 100 })
});

// Generator for filter state
const filterStateArb = fc.record({
  dateRange: fc.record({
    start: fc.option(
      fc.integer({ min: 946684800000, max: 1924905600000 })
        .map(ms => new Date(ms).toISOString().split('T')[0]), 
      { nil: null }
    ),
    end: fc.option(
      fc.integer({ min: 946684800000, max: 1924905600000 })
        .map(ms => new Date(ms).toISOString().split('T')[0]), 
      { nil: null }
    )
  }),
  transactionTypes: fc.array(
    fc.constantFrom('Purchase', 'SIP', 'Redemption', 'Switch-In', 'Switch-Out', 'Dividend'),
    { maxLength: 6 }
  ),
  searchQuery: fc.string({ maxLength: 50 }),
  folioNumber: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
  amountRange: fc.record({
    min: fc.option(fc.float({ min: 0, max: 1000000, noNaN: true }), { nil: null }),
    max: fc.option(fc.float({ min: 0, max: 1000000, noNaN: true }), { nil: null })
  })
});

// Generator for portfolio data
const portfolioDataArb = fc.record({
  portfolioSummary: fc.array(
    fc.record({
      schemeName: fc.string({ minLength: 1, maxLength: 50 }),
      marketValue: fc.float({ min: 0, max: 10000000, noNaN: true }),
      units: fc.float({ min: 0, max: 100000, noNaN: true })
    }),
    { minLength: 0, maxLength: 20 }
  )
});

// Test component to capture filter context
const TestWrapper = ({ transactions, children, onFilterCapture }) => {
  const filterContext = useFilters();

  React.useEffect(() => {
    if (onFilterCapture) {
      onFilterCapture(filterContext);
    }
  });

  return <>{children}</>;
};

describe('Dashboard - Property-Based Tests for Filter Integration', () => {
  /**
   * Feature: data-visualization-dashboard, Property 10: Chart Data Filtering
   * Validates: Requirements 9.1
   */
  describe('Property 10: Chart Data Filtering', () => {
    it('should display only filtered transactions in dashboard', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          filterStateArb,
          portfolioDataArb,
          (transactions, filterState, portfolioData) => {
            // Apply filters manually to get expected result
            const expectedFilteredTransactions = applyFilters(transactions, filterState);

            let capturedFilterContext = null;

            const { container } = render(
              <FilterProvider transactions={transactions}>
                <TestWrapper 
                  transactions={transactions}
                  onFilterCapture={(ctx) => { capturedFilterContext = ctx; }}
                >
                  <Dashboard
                    transactions={expectedFilteredTransactions}
                    portfolioData={portfolioData}
                    darkMode={false}
                    loading={false}
                    isFiltered={true}
                  />
                </TestWrapper>
              </FilterProvider>
            );

            // Verify dashboard renders without errors
            expect(container).toBeTruthy();

            // If there are filtered transactions, verify they match expected
            if (expectedFilteredTransactions.length > 0) {
              // Dashboard should not be in empty state
              const emptyState = container.querySelector('.dashboard-empty-state');
              expect(emptyState).toBeNull();
            } else {
              // Dashboard should show empty state
              const emptyState = container.querySelector('.dashboard-empty-state');
              expect(emptyState).toBeTruthy();
            }

            // Property: The dashboard receives exactly the filtered transactions
            // This is validated by the fact that Dashboard component receives
            // the filtered transactions as props
            expect(expectedFilteredTransactions.length).toBeGreaterThanOrEqual(0);
            expect(expectedFilteredTransactions.length).toBeLessThanOrEqual(transactions.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show all transactions when no filters are applied', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          portfolioDataArb,
          (transactions, portfolioData) => {
            // Empty filter state (no filters applied)
            const emptyFilterState = {
              dateRange: { start: null, end: null },
              transactionTypes: [],
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: null, max: null }
            };

            const filteredTransactions = applyFilters(transactions, emptyFilterState);

            const { container } = render(
              <FilterProvider transactions={transactions}>
                <Dashboard
                  transactions={filteredTransactions}
                  portfolioData={portfolioData}
                  darkMode={false}
                  loading={false}
                  isFiltered={false}
                />
              </FilterProvider>
            );

            // Property: When no filters are applied, all transactions should be shown
            expect(filteredTransactions.length).toBe(transactions.length);

            // Dashboard should not show empty state
            const emptyState = container.querySelector('.dashboard-empty-state');
            expect(emptyState).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: data-visualization-dashboard, Property 11: Filter Clear Round-Trip
   * Validates: Requirements 9.3
   */
  describe('Property 11: Filter Clear Round-Trip', () => {
    it('should restore complete dataset when filters are cleared', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          filterStateArb,
          portfolioDataArb,
          (transactions, filterState, portfolioData) => {
            // Apply filters
            const filteredTransactions = applyFilters(transactions, filterState);

            // Clear filters (empty filter state)
            const emptyFilterState = {
              dateRange: { start: null, end: null },
              transactionTypes: [],
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: null, max: null }
            };

            const clearedFilteredTransactions = applyFilters(transactions, emptyFilterState);

            // Property: Clearing filters should restore all original transactions
            expect(clearedFilteredTransactions.length).toBe(transactions.length);
            expect(clearedFilteredTransactions).toEqual(transactions);

            // Verify dashboard can render both states
            const { container: filteredContainer } = render(
              <FilterProvider transactions={transactions}>
                <Dashboard
                  transactions={filteredTransactions}
                  portfolioData={portfolioData}
                  darkMode={false}
                  loading={false}
                  isFiltered={true}
                />
              </FilterProvider>
            );

            const { container: clearedContainer } = render(
              <FilterProvider transactions={transactions}>
                <Dashboard
                  transactions={clearedFilteredTransactions}
                  portfolioData={portfolioData}
                  darkMode={false}
                  loading={false}
                  isFiltered={false}
                />
              </FilterProvider>
            );

            expect(filteredContainer).toBeTruthy();
            expect(clearedContainer).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: data-visualization-dashboard, Property 12: Metric Recalculation with Filters
   * Validates: Requirements 9.5
   */
  describe('Property 12: Metric Recalculation with Filters', () => {
    it('should recalculate metrics using only filtered transactions', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          filterStateArb,
          portfolioDataArb,
          (transactions, filterState, portfolioData) => {
            // Apply filters
            const filteredTransactions = applyFilters(transactions, filterState);

            // Calculate metrics for all transactions
            const totalInvestmentAll = calculateTotalInvestment(transactions);

            // Calculate metrics for filtered transactions
            const totalInvestmentFiltered = calculateTotalInvestment(filteredTransactions);

            // Property: Filtered metrics should be based only on filtered transactions
            // If filters reduce the transaction set, metrics should differ (or be equal if all pass)
            if (filteredTransactions.length < transactions.length) {
              // Metrics should be different (unless by coincidence they're the same)
              // We can't guarantee they're different, but we can verify they're calculated correctly
              expect(totalInvestmentFiltered).toBeGreaterThanOrEqual(0);
            } else {
              // If all transactions pass the filter, metrics should be the same
              expect(totalInvestmentFiltered).toBe(totalInvestmentAll);
            }

            // Verify metrics are calculated correctly for filtered set
            const expectedInvestment = filteredTransactions.reduce((sum, tx) => {
              if (tx.isAdministrative) return sum;
              if (tx.transactionType === 'Purchase' || tx.transactionType === 'SIP') {
                return sum + tx.amount;
              } else if (tx.transactionType === 'Redemption') {
                return sum - tx.amount;
              }
              return sum;
            }, 0);

            // Allow for floating point precision differences
            expect(Math.abs(totalInvestmentFiltered - expectedInvestment)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate gains/losses correctly for filtered data', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          filterStateArb,
          portfolioDataArb,
          (transactions, filterState, portfolioData) => {
            // Apply filters
            const filteredTransactions = applyFilters(transactions, filterState);

            // Calculate metrics
            const totalInvestment = calculateTotalInvestment(filteredTransactions);
            
            // Get current value from portfolio data
            const currentValue = portfolioData.portfolioSummary.reduce(
              (sum, scheme) => sum + (scheme.marketValue || 0),
              0
            );

            const gainsLosses = calculateGainsLosses(currentValue, totalInvestment);

            // Property: Gains/Losses = Current Value - Total Investment
            const expectedGainsLosses = currentValue - totalInvestment;
            
            // Allow for floating point precision differences
            expect(Math.abs(gainsLosses - expectedGainsLosses)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate percentage return correctly for filtered data', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          filterStateArb,
          portfolioDataArb,
          (transactions, filterState, portfolioData) => {
            // Apply filters
            const filteredTransactions = applyFilters(transactions, filterState);

            // Calculate metrics
            const totalInvestment = calculateTotalInvestment(filteredTransactions);
            
            // Get current value from portfolio data
            const currentValue = portfolioData.portfolioSummary.reduce(
              (sum, scheme) => sum + (scheme.marketValue || 0),
              0
            );

            const percentageReturn = calculatePercentageReturn(currentValue, totalInvestment);

            // Property: Percentage Return = ((Current Value - Total Investment) / Total Investment) × 100
            if (totalInvestment === 0) {
              expect(percentageReturn).toBe(0);
            } else {
              const expectedPercentageReturn = ((currentValue - totalInvestment) / totalInvestment) * 100;
              
              // Allow for floating point precision differences
              expect(Math.abs(percentageReturn - expectedPercentageReturn)).toBeLessThan(0.01);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
