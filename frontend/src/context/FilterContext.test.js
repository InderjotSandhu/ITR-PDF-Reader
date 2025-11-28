/**
 * Property-based tests for FilterContext
 * Feature: advanced-filtering-search
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { FilterProvider, useFilters } from './FilterContext';
import { createEmptyFilterState } from '../types/filters';

/**
 * Arbitrary generator for transaction objects
 */
const transactionArbitrary = fc.record({
  date: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
    .filter(d => !isNaN(d.getTime()))
    .map(d => d.toISOString().split('T')[0]),
  amount: fc.float({ min: -1000000, max: 1000000, noNaN: true }),
  nav: fc.option(fc.float({ min: 0, max: 10000, noNaN: true })),
  units: fc.option(fc.float({ min: -100000, max: 100000, noNaN: true })),
  transactionType: fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out', 'Dividend', 'STT Paid'),
  unitBalance: fc.option(fc.float({ min: 0, max: 1000000, noNaN: true })),
  description: fc.string(),
  isAdministrative: fc.boolean(),
  folioNumber: fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 8, maxLength: 12 }).map(arr => arr.join('')),
  schemeName: fc.constantFrom(
    'HDFC Equity Fund',
    'ICICI Prudential Debt Fund',
    'SBI Bluechip Fund',
    'Axis Long Term Equity Fund',
    'Kotak Standard Multicap Fund'
  ),
  isin: fc.array(fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3'), { minLength: 12, maxLength: 12 }).map(arr => arr.join(''))
});

/**
 * Arbitrary generator for filter state
 */
const filterStateArbitrary = fc.record({
  dateRange: fc.record({
    start: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())), { nil: null }),
    end: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())), { nil: null })
  }),
  transactionTypes: fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out', 'Dividend'), { maxLength: 5 }),
  searchQuery: fc.oneof(fc.constant(''), fc.constantFrom('HDFC', 'ICICI', 'SBI', 'Equity', 'Debt')),
  folioNumber: fc.option(fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 8, maxLength: 12 }).map(arr => arr.join('')), { nil: null }),
  amountRange: fc.record({
    min: fc.option(fc.float({ min: -100000, max: 100000, noNaN: true }), { nil: null }),
    max: fc.option(fc.float({ min: -100000, max: 100000, noNaN: true }), { nil: null })
  })
});

/**
 * Helper to create a wrapper with FilterProvider
 */
const createWrapper = (transactions) => {
  return ({ children }) => (
    <FilterProvider transactions={transactions}>
      {children}
    </FilterProvider>
  );
};

/**
 * Property 2: Filter clearing returns to original state
 * Feature: advanced-filtering-search, Property 2: Filter clearing returns to original state
 * Validates: Requirements 1.2, 2.2, 3.2, 4.3, 5.4, 9.2
 * 
 * For any set of transactions and any applied filters,
 * clearing all filters should return exactly the original set of transactions.
 */
describe('Property 2: Filter clearing returns to original state', () => {
  test('clearing filters should return all original transactions', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        filterStateArbitrary,
        (transactions, filters) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply filters
          act(() => {
            result.current.setFilters(filters);
          });

          // Clear filters
          act(() => {
            result.current.clearFilters();
          });

          // Should return all original transactions
          return result.current.filteredTransactions.length === transactions.length &&
                 result.current.filteredTransactions.every((tx, idx) => 
                   transactions.some(origTx => origTx.date === tx.date && origTx.amount === tx.amount)
                 );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('clearing filters should reset filter state to empty', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 50 }),
        filterStateArbitrary,
        (transactions, filters) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply filters
          act(() => {
            result.current.setFilters(filters);
          });

          // Clear filters
          act(() => {
            result.current.clearFilters();
          });

          const emptyState = createEmptyFilterState();
          const currentFilters = result.current.filters;

          // Check all filter properties are reset
          return currentFilters.dateRange.start === emptyState.dateRange.start &&
                 currentFilters.dateRange.end === emptyState.dateRange.end &&
                 currentFilters.transactionTypes.length === 0 &&
                 currentFilters.searchQuery === '' &&
                 currentFilters.folioNumber === null &&
                 currentFilters.amountRange.min === null &&
                 currentFilters.amountRange.max === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 10: Filter addition narrows results
 * Feature: advanced-filtering-search, Property 10: Filter addition narrows results
 * Validates: Requirements 6.2
 * 
 * For any set of transactions with active filters,
 * adding an additional filter should return a subset (or equal set) of the current results.
 */
describe('Property 10: Filter addition narrows results', () => {
  test('adding a date range filter should narrow or maintain results', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP'), { minLength: 1, maxLength: 3 }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2029-12-31') }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
        (transactions, types, startDate, endDate) => {
          // Ensure start <= end
          if (startDate > endDate) {
            [startDate, endDate] = [endDate, startDate];
          }

          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply initial filter (transaction types only)
          act(() => {
            result.current.setFilters({
              dateRange: { start: null, end: null },
              transactionTypes: types,
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: null, max: null }
            });
          });

          const countAfterFirstFilter = result.current.filteredTransactions.length;

          // Add date range filter
          act(() => {
            result.current.setFilters({
              dateRange: { start: startDate, end: endDate },
              transactionTypes: types,
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: null, max: null }
            });
          });

          const countAfterSecondFilter = result.current.filteredTransactions.length;

          // Adding a filter should narrow or maintain results (subset)
          return countAfterSecondFilter <= countAfterFirstFilter;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('adding an amount range filter should narrow or maintain results', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.constantFrom('HDFC', 'ICICI', 'SBI'),
        fc.float({ min: 0, max: 50000, noNaN: true }),
        fc.float({ min: 50000, max: 100000, noNaN: true }),
        (transactions, searchQuery, minAmount, maxAmount) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply initial filter (search only)
          act(() => {
            result.current.setFilters({
              dateRange: { start: null, end: null },
              transactionTypes: [],
              searchQuery: searchQuery,
              folioNumber: null,
              amountRange: { min: null, max: null }
            });
          });

          const countAfterFirstFilter = result.current.filteredTransactions.length;

          // Add amount range filter
          act(() => {
            result.current.setFilters({
              dateRange: { start: null, end: null },
              transactionTypes: [],
              searchQuery: searchQuery,
              folioNumber: null,
              amountRange: { min: minAmount, max: maxAmount }
            });
          });

          const countAfterSecondFilter = result.current.filteredTransactions.length;

          // Adding a filter should narrow or maintain results
          return countAfterSecondFilter <= countAfterFirstFilter;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 11: Filter removal expands results
 * Feature: advanced-filtering-search, Property 11: Filter removal expands results
 * Validates: Requirements 6.3
 * 
 * For any set of transactions with multiple active filters,
 * removing one filter should return a superset (or equal set) of the current results.
 */
describe('Property 11: Filter removal expands results', () => {
  test('removing date range filter should expand or maintain results', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2029-12-31') }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
        fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP'), { minLength: 1, maxLength: 3 }),
        (transactions, startDate, endDate, types) => {
          // Ensure start <= end
          if (startDate > endDate) {
            [startDate, endDate] = [endDate, startDate];
          }

          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply multiple filters
          act(() => {
            result.current.setFilters({
              dateRange: { start: startDate, end: endDate },
              transactionTypes: types,
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: null, max: null }
            });
          });

          const countWithBothFilters = result.current.filteredTransactions.length;

          // Remove date range filter
          act(() => {
            result.current.removeFilter('dateRange');
          });

          const countAfterRemoval = result.current.filteredTransactions.length;

          // Removing a filter should expand or maintain results (superset)
          return countAfterRemoval >= countWithBothFilters;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('removing transaction type filter should expand or maintain results', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP'), { minLength: 1, maxLength: 3 }),
        fc.constantFrom('HDFC', 'ICICI', 'SBI'),
        (transactions, types, searchQuery) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply multiple filters
          act(() => {
            result.current.setFilters({
              dateRange: { start: null, end: null },
              transactionTypes: types,
              searchQuery: searchQuery,
              folioNumber: null,
              amountRange: { min: null, max: null }
            });
          });

          const countWithBothFilters = result.current.filteredTransactions.length;

          // Remove transaction type filter
          act(() => {
            result.current.removeFilter('transactionTypes');
          });

          const countAfterRemoval = result.current.filteredTransactions.length;

          // Removing a filter should expand or maintain results
          return countAfterRemoval >= countWithBothFilters;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('removing search query filter should expand or maintain results', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.constantFrom('HDFC', 'ICICI', 'SBI'),
        fc.float({ min: 0, max: 100000, noNaN: true }),
        (transactions, searchQuery, minAmount) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply multiple filters
          act(() => {
            result.current.setFilters({
              dateRange: { start: null, end: null },
              transactionTypes: [],
              searchQuery: searchQuery,
              folioNumber: null,
              amountRange: { min: minAmount, max: null }
            });
          });

          const countWithBothFilters = result.current.filteredTransactions.length;

          // Remove search query filter
          act(() => {
            result.current.removeFilter('searchQuery');
          });

          const countAfterRemoval = result.current.filteredTransactions.length;

          // Removing a filter should expand or maintain results
          return countAfterRemoval >= countWithBothFilters;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('removing amount range filter should expand or maintain results', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP'), { minLength: 1, maxLength: 3 }),
        fc.float({ min: 0, max: 50000, noNaN: true }),
        fc.float({ min: 50000, max: 100000, noNaN: true }),
        (transactions, types, minAmount, maxAmount) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply multiple filters
          act(() => {
            result.current.setFilters({
              dateRange: { start: null, end: null },
              transactionTypes: types,
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: minAmount, max: maxAmount }
            });
          });

          const countWithBothFilters = result.current.filteredTransactions.length;

          // Remove amount range filter
          act(() => {
            result.current.removeFilter('amountRange');
          });

          const countAfterRemoval = result.current.filteredTransactions.length;

          // Removing a filter should expand or maintain results
          return countAfterRemoval >= countWithBothFilters;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 16: Clear all filters resets state
 * Feature: advanced-filtering-search, Property 16: Clear all filters resets state
 * Validates: Requirements 9.1, 9.3
 * 
 * For any set of active filters, clicking "Clear All Filters" should result in
 * an empty filter state with all filter fields at default values.
 */
describe('Property 16: Clear all filters resets state', () => {
  test('clear all filters should reset all filter fields to default values', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        filterStateArbitrary,
        (transactions, filters) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply arbitrary filters
          act(() => {
            result.current.setFilters(filters);
          });

          // Clear all filters
          act(() => {
            result.current.clearFilters();
          });

          const emptyState = createEmptyFilterState();
          const currentFilters = result.current.filters;

          // Verify all fields are reset to default
          const dateRangeReset = currentFilters.dateRange.start === emptyState.dateRange.start &&
                                 currentFilters.dateRange.end === emptyState.dateRange.end;
          const transactionTypesReset = currentFilters.transactionTypes.length === 0;
          const searchQueryReset = currentFilters.searchQuery === '';
          const folioNumberReset = currentFilters.folioNumber === null;
          const amountRangeReset = currentFilters.amountRange.min === null &&
                                   currentFilters.amountRange.max === null;

          return dateRangeReset && transactionTypesReset && searchQueryReset &&
                 folioNumberReset && amountRangeReset;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('clear all filters should return all original transactions', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 100 }),
        filterStateArbitrary,
        (transactions, filters) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply filters that might reduce results
          act(() => {
            result.current.setFilters(filters);
          });

          const filteredCount = result.current.filteredTransactions.length;

          // Clear all filters
          act(() => {
            result.current.clearFilters();
          });

          const clearedCount = result.current.filteredTransactions.length;

          // After clearing, should have all original transactions
          return clearedCount === transactions.length && clearedCount >= filteredCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('clear all filters should be idempotent', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        filterStateArbitrary,
        (transactions, filters) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Apply filters
          act(() => {
            result.current.setFilters(filters);
          });

          // Clear all filters once
          act(() => {
            result.current.clearFilters();
          });

          const firstClearState = JSON.stringify(result.current.filters);
          const firstClearCount = result.current.filteredTransactions.length;

          // Clear all filters again
          act(() => {
            result.current.clearFilters();
          });

          const secondClearState = JSON.stringify(result.current.filters);
          const secondClearCount = result.current.filteredTransactions.length;

          // Clearing twice should have the same effect as clearing once
          return firstClearState === secondClearState && firstClearCount === secondClearCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('clear all filters with no active filters should maintain empty state', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        (transactions) => {
          const wrapper = createWrapper(transactions);
          const { result } = renderHook(() => useFilters(), { wrapper });

          // Don't apply any filters, just clear
          act(() => {
            result.current.clearFilters();
          });

          const emptyState = createEmptyFilterState();
          const currentFilters = result.current.filters;

          // Should still be in empty state
          return currentFilters.dateRange.start === emptyState.dateRange.start &&
                 currentFilters.dateRange.end === emptyState.dateRange.end &&
                 currentFilters.transactionTypes.length === 0 &&
                 currentFilters.searchQuery === '' &&
                 currentFilters.folioNumber === null &&
                 currentFilters.amountRange.min === null &&
                 currentFilters.amountRange.max === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});
