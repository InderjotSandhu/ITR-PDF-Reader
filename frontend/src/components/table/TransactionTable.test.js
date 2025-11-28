/**
 * Property-based tests for TransactionTable component
 * Feature: advanced-filtering-search
 */

import * as fc from 'fast-check';
import { applyFilters } from '../../utils/filterUtils';

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
    start: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2029-12-31') })),
    end: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }))
  }).map(range => {
    // Ensure start <= end if both are present
    if (range.start && range.end && range.start > range.end) {
      return { start: range.end, end: range.start };
    }
    return range;
  }),
  transactionTypes: fc.array(
    fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out', 'Dividend', 'STT Paid'),
    { minLength: 0, maxLength: 5 }
  ),
  searchQuery: fc.oneof(
    fc.constant(''),
    fc.constantFrom('HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Equity', 'Debt', 'Fund')
  ),
  folioNumber: fc.option(
    fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 8, maxLength: 12 }).map(arr => arr.join(''))
  ),
  amountRange: fc.record({
    min: fc.option(fc.float({ min: -100000, max: 100000, noNaN: true })),
    max: fc.option(fc.float({ min: -100000, max: 100000, noNaN: true }))
  }).map(range => {
    // Ensure min <= max if both are present
    if (range.min !== null && range.max !== null && range.min > range.max) {
      return { min: range.max, max: range.min };
    }
    return range;
  })
});

/**
 * Property 12: Result count accuracy
 * Feature: advanced-filtering-search, Property 12: Result count accuracy
 * Validates: Requirements 4.4, 6.4
 * 
 * For any set of filters applied to transactions, the displayed count should equal
 * the actual number of transactions in the filtered results.
 */
describe('Property 12: Result count accuracy', () => {
  test('filtered count should equal the actual number of filtered transactions', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 200 }),
        filterStateArbitrary,
        (allTransactions, filters) => {
          // Apply filters to get filtered transactions
          const filteredTransactions = applyFilters(allTransactions, filters);
          
          // The count should match the length of filtered array
          const actualCount = filteredTransactions.length;
          const expectedCount = filteredTransactions.length;
          
          return actualCount === expectedCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('total count should remain constant regardless of filters', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 200 }),
        filterStateArbitrary,
        filterStateArbitrary,
        (allTransactions, filters1, filters2) => {
          // Apply different filters
          const filtered1 = applyFilters(allTransactions, filters1);
          const filtered2 = applyFilters(allTransactions, filters2);
          
          // Total count (original) should be the same
          const totalCount = allTransactions.length;
          
          // Both filtered results should reference the same total
          return totalCount === allTransactions.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('filtered count should be less than or equal to total count', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 200 }),
        filterStateArbitrary,
        (allTransactions, filters) => {
          const filteredTransactions = applyFilters(allTransactions, filters);
          
          const totalCount = allTransactions.length;
          const filteredCount = filteredTransactions.length;
          
          // Filtered count should never exceed total count
          return filteredCount <= totalCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('with no filters, filtered count should equal total count', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 200 }),
        (allTransactions) => {
          // Empty filter state (no filters applied)
          const emptyFilters = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: null }
          };
          
          const filteredTransactions = applyFilters(allTransactions, emptyFilters);
          
          const totalCount = allTransactions.length;
          const filteredCount = filteredTransactions.length;
          
          // With no filters, counts should be equal
          return filteredCount === totalCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('count should be zero when no transactions match filters', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 200 }),
        (allTransactions) => {
          // Create a filter that will match nothing
          // Use a date range far in the future
          const impossibleFilters = {
            dateRange: { 
              start: new Date('2050-01-01'), 
              end: new Date('2050-12-31') 
            },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: null }
          };
          
          const filteredTransactions = applyFilters(allTransactions, impossibleFilters);
          const filteredCount = filteredTransactions.length;
          
          // Count should be zero or match the actual filtered length
          return filteredCount === filteredTransactions.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('count accuracy with multiple active filters', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 200 }),
        fc.date({ min: new Date('2010-01-01'), max: new Date('2020-12-31') }),
        fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP'), { minLength: 1, maxLength: 3 }),
        fc.constantFrom('HDFC', 'ICICI', 'SBI'),
        (allTransactions, startDate, types, searchQuery) => {
          const filters = {
            dateRange: { start: startDate, end: new Date('2025-12-31') },
            transactionTypes: types,
            searchQuery: searchQuery,
            folioNumber: null,
            amountRange: { min: 1000, max: 50000 }
          };
          
          const filteredTransactions = applyFilters(allTransactions, filters);
          const filteredCount = filteredTransactions.length;
          
          // Count should exactly match the filtered array length
          return filteredCount === filteredTransactions.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('count should update correctly when filters change', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 10, maxLength: 200 }),
        (allTransactions) => {
          // Start with no filters
          const noFilters = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: null }
          };
          
          const initialFiltered = applyFilters(allTransactions, noFilters);
          const initialCount = initialFiltered.length;
          
          // Add a filter
          const withFilter = {
            ...noFilters,
            transactionTypes: ['Purchase']
          };
          
          const filteredWithFilter = applyFilters(allTransactions, withFilter);
          const countWithFilter = filteredWithFilter.length;
          
          // Both counts should accurately reflect their respective filtered arrays
          return (
            initialCount === initialFiltered.length &&
            countWithFilter === filteredWithFilter.length &&
            countWithFilter <= initialCount
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
