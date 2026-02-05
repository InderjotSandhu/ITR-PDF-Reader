/**
 * Property-based tests for DashboardContext
 * Feature: data-visualization-dashboard
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { FilterProvider, useFilters } from './FilterContext';

// Test component that uses both contexts
const TestComponent = ({ onStateCapture }) => {
  const dashboardContext = useDashboard();
  const filterContext = useFilters();

  React.useEffect(() => {
    if (onStateCapture) {
      onStateCapture({
        dashboard: dashboardContext,
        filter: filterContext
      });
    }
  });

  return null;
};

// Generator for filter state
const filterStateArb = fc.record({
  dateRange: fc.record({
    start: fc.option(
      fc.integer({ min: new Date('2000-01-01').getTime(), max: new Date('2030-12-31').getTime() })
        .map(timestamp => new Date(timestamp)),
      { nil: null }
    ),
    end: fc.option(
      fc.integer({ min: new Date('2000-01-01').getTime(), max: new Date('2030-12-31').getTime() })
        .map(timestamp => new Date(timestamp)),
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

// Generator for transactions
const transactionArb = fc.record({
  date: fc.integer({ min: new Date('2000-01-01').getTime(), max: new Date('2030-12-31').getTime() })
    .map(timestamp => new Date(timestamp).toISOString()),
  amount: fc.float({ min: 0, max: 1000000, noNaN: true }),
  transactionType: fc.constantFrom('Purchase', 'SIP', 'Redemption', 'Switch-In', 'Switch-Out', 'Dividend'),
  isAdministrative: fc.boolean(),
  schemeName: fc.string({ minLength: 1, maxLength: 50 }),
  folioNumber: fc.string({ minLength: 1, maxLength: 20 })
});

describe('DashboardContext - Property-Based Tests', () => {
  /**
   * Feature: data-visualization-dashboard, Property 9: Filter State Preservation
   * Validates: Requirements 1.5, 12.3
   */
  describe('Property 9: Filter State Preservation', () => {
    it('should preserve filter state when switching from table to dashboard view', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 0, maxLength: 50 }),
          filterStateArb,
          (transactions, filterState) => {
            let capturedState = null;

            const { rerender } = render(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Apply filter state
            act(() => {
              if (capturedState && capturedState.filter) {
                capturedState.filter.setFilters(filterState);
              }
            });

            // Force re-render to capture updated state
            rerender(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Capture filter state before view switch
            const filterStateBeforeSwitch = capturedState ? { ...capturedState.filter.filters } : null;

            // Switch to dashboard view
            act(() => {
              if (capturedState && capturedState.dashboard) {
                capturedState.dashboard.setView('dashboard');
              }
            });

            // Force re-render to capture updated state
            rerender(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Capture filter state after view switch
            const filterStateAfterSwitch = capturedState ? { ...capturedState.filter.filters } : null;

            // Verify filter state is preserved
            expect(filterStateAfterSwitch).toEqual(filterStateBeforeSwitch);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve filter state when switching from dashboard to table view', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 0, maxLength: 50 }),
          filterStateArb,
          (transactions, filterState) => {
            let capturedState = null;

            const { rerender } = render(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="dashboard">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Apply filter state
            act(() => {
              if (capturedState && capturedState.filter) {
                capturedState.filter.setFilters(filterState);
              }
            });

            // Force re-render to capture updated state
            rerender(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="dashboard">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Capture filter state before view switch
            const filterStateBeforeSwitch = capturedState ? { ...capturedState.filter.filters } : null;

            // Switch to table view
            act(() => {
              if (capturedState && capturedState.dashboard) {
                capturedState.dashboard.setView('table');
              }
            });

            // Force re-render to capture updated state
            rerender(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="dashboard">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Capture filter state after view switch
            const filterStateAfterSwitch = capturedState ? { ...capturedState.filter.filters } : null;

            // Verify filter state is preserved
            expect(filterStateAfterSwitch).toEqual(filterStateBeforeSwitch);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve filter state through multiple view toggles', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 0, maxLength: 50 }),
          filterStateArb,
          fc.integer({ min: 1, max: 10 }),
          (transactions, filterState, toggleCount) => {
            let capturedState = null;

            const { rerender } = render(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Apply filter state
            act(() => {
              if (capturedState && capturedState.filter) {
                capturedState.filter.setFilters(filterState);
              }
            });

            // Force re-render to capture updated state
            rerender(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Capture initial filter state
            const initialFilterState = capturedState ? { ...capturedState.filter.filters } : null;

            // Toggle view multiple times
            for (let i = 0; i < toggleCount; i++) {
              act(() => {
                if (capturedState && capturedState.dashboard) {
                  capturedState.dashboard.toggleView();
                }
              });

              // Force re-render
              rerender(
                <FilterProvider transactions={transactions}>
                  <DashboardProvider initialView="table">
                    <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                  </DashboardProvider>
                </FilterProvider>
              );
            }

            // Capture final filter state
            const finalFilterState = capturedState ? { ...capturedState.filter.filters } : null;

            // Verify filter state is preserved after all toggles
            expect(finalFilterState).toEqual(initialFilterState);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve filtered transactions when switching views', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 50 }),
          filterStateArb,
          (transactions, filterState) => {
            let capturedState = null;

            const { rerender } = render(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Apply filter state
            act(() => {
              if (capturedState && capturedState.filter) {
                capturedState.filter.setFilters(filterState);
              }
            });

            // Force re-render to capture updated state
            rerender(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Capture filtered transactions before view switch
            const filteredTransactionsBeforeSwitch = capturedState 
              ? [...capturedState.filter.filteredTransactions] 
              : [];

            // Switch to dashboard view
            act(() => {
              if (capturedState && capturedState.dashboard) {
                capturedState.dashboard.setView('dashboard');
              }
            });

            // Force re-render
            rerender(
              <FilterProvider transactions={transactions}>
                <DashboardProvider initialView="table">
                  <TestComponent onStateCapture={(state) => { capturedState = state; }} />
                </DashboardProvider>
              </FilterProvider>
            );

            // Capture filtered transactions after view switch
            const filteredTransactionsAfterSwitch = capturedState 
              ? [...capturedState.filter.filteredTransactions] 
              : [];

            // Verify filtered transactions are preserved
            expect(filteredTransactionsAfterSwitch).toEqual(filteredTransactionsBeforeSwitch);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
