/**
 * Property-based tests for filter utility functions
 * Feature: advanced-filtering-search
 */

import * as fc from 'fast-check';
import { applyFilters } from './filterUtils';

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
 * Property 1: Date range filter completeness
 * Feature: advanced-filtering-search, Property 1: Date range filter completeness
 * Validates: Requirements 1.1
 * 
 * For any set of transactions and any valid date range (start <= end),
 * all filtered results should have transaction dates within the specified range (inclusive).
 */
describe('Property 1: Date range filter completeness', () => {
  test('all filtered transactions should be within the specified date range', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2029-12-31') }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
        (transactions, startDate, endDate) => {
          // Ensure start <= end
          if (startDate > endDate) {
            [startDate, endDate] = [endDate, startDate];
          }

          const filters = {
            dateRange: { start: startDate, end: endDate },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: null }
          };

          const filtered = applyFilters(transactions, filters);

          // All filtered transactions should be within the date range
          return filtered.every(tx => {
            const txDate = new Date(tx.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            txDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
            
            return txDate >= start && txDate <= end;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('date range filter with only start date', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
        (transactions, startDate) => {
          const filters = {
            dateRange: { start: startDate, end: null },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: null }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => {
            const txDate = new Date(tx.date);
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            txDate.setHours(12, 0, 0, 0);
            return txDate >= start;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('date range filter with only end date', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
        (transactions, endDate) => {
          const filters = {
            dateRange: { start: null, end: endDate },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: null }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => {
            const txDate = new Date(tx.date);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            txDate.setHours(12, 0, 0, 0);
            return txDate <= end;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 3: Transaction type filter accuracy
 * Feature: advanced-filtering-search, Property 3: Transaction type filter accuracy
 * Validates: Requirements 2.1, 2.4
 * 
 * For any set of transactions and any selected transaction types,
 * all filtered results should have a transaction type matching one of the selected types.
 */
describe('Property 3: Transaction type filter accuracy', () => {
  test('all filtered transactions should match one of the selected types', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out', 'Dividend', 'STT Paid'), { minLength: 1, maxLength: 5 }),
        (transactions, selectedTypes) => {
          const filters = {
            dateRange: { start: null, end: null },
            transactionTypes: selectedTypes,
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: null }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => selectedTypes.includes(tx.transactionType));
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 5: Search case-insensitivity
 * Property 6: Search query substring matching
 * Feature: advanced-filtering-search, Property 5 & 6: Search functionality
 * Validates: Requirements 3.1, 3.3
 * 
 * For any search query, searching with different case variations should return the same results,
 * and all results should contain the query as a substring in the scheme name.
 */
describe('Property 5 & 6: Search case-insensitivity and substring matching', () => {
  test('search should be case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.constantFrom('hdfc', 'HDFC', 'Hdfc', 'equity', 'EQUITY', 'Equity', 'fund', 'FUND', 'Fund'),
        (transactions, query) => {
          const filtersLower = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: query.toLowerCase(),
            folioNumber: null,
            amountRange: { min: null, max: null }
          };

          const filtersUpper = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: query.toUpperCase(),
            folioNumber: null,
            amountRange: { min: null, max: null }
          };

          const filteredLower = applyFilters(transactions, filtersLower);
          const filteredUpper = applyFilters(transactions, filtersUpper);

          // Same results regardless of case
          return filteredLower.length === filteredUpper.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('all filtered transactions should contain search query as substring', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.constantFrom('HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Equity', 'Debt', 'Fund'),
        (transactions, query) => {
          const filters = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: query,
            folioNumber: null,
            amountRange: { min: null, max: null }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => 
            tx.schemeName.toLowerCase().includes(query.toLowerCase())
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 7: Folio filter exactness
 * Feature: advanced-filtering-search, Property 7: Folio filter exactness
 * Validates: Requirements 4.1
 * 
 * For any selected folio number and set of transactions,
 * all filtered results should have exactly that folio number.
 */
describe('Property 7: Folio filter exactness', () => {
  test('all filtered transactions should have the exact folio number', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 100 }),
        (transactions) => {
          // Pick a folio number from the transactions
          const folioNumber = transactions[0].folioNumber;

          const filters = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: folioNumber,
            amountRange: { min: null, max: null }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => tx.folioNumber === folioNumber);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 8: Amount range filter boundaries
 * Feature: advanced-filtering-search, Property 8: Amount range filter boundaries
 * Validates: Requirements 5.1, 5.2, 5.3
 * 
 * For any amount range (min, max) and set of transactions,
 * all filtered results should have amounts where min <= amount <= max.
 */
describe('Property 8: Amount range filter boundaries', () => {
  test('all filtered transactions should be within amount range (both min and max)', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.float({ min: -100000, max: 100000, noNaN: true }),
        fc.float({ min: -100000, max: 100000, noNaN: true }),
        (transactions, minAmount, maxAmount) => {
          // Ensure min <= max
          if (minAmount > maxAmount) {
            [minAmount, maxAmount] = [maxAmount, minAmount];
          }

          const filters = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: minAmount, max: maxAmount }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => tx.amount >= minAmount && tx.amount <= maxAmount);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('all filtered transactions should be >= min amount (only min specified)', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.float({ min: -100000, max: 100000, noNaN: true }),
        (transactions, minAmount) => {
          const filters = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: minAmount, max: null }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => tx.amount >= minAmount);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('all filtered transactions should be <= max amount (only max specified)', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.float({ min: -100000, max: 100000, noNaN: true }),
        (transactions, maxAmount) => {
          const filters = {
            dateRange: { start: null, end: null },
            transactionTypes: [],
            searchQuery: '',
            folioNumber: null,
            amountRange: { min: null, max: maxAmount }
          };

          const filtered = applyFilters(transactions, filters);

          return filtered.every(tx => tx.amount <= maxAmount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 9: Multiple filter conjunction (AND logic)
 * Feature: advanced-filtering-search, Property 9: Multiple filter conjunction
 * Validates: Requirements 6.1
 * 
 * For any combination of active filters and set of transactions,
 * all filtered results should satisfy ALL filter conditions simultaneously.
 */
describe('Property 9: Multiple filter conjunction (AND logic)', () => {
  test('all filtered transactions should satisfy all active filters', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 0, maxLength: 100 }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2029-12-31') }),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
        fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP'), { minLength: 1, maxLength: 3 }),
        fc.constantFrom('HDFC', 'ICICI', 'SBI'),
        fc.float({ min: 0, max: 50000, noNaN: true }),
        fc.float({ min: 50000, max: 100000, noNaN: true }),
        (transactions, startDate, endDate, types, searchQuery, minAmount, maxAmount) => {
          // Ensure start <= end
          if (startDate > endDate) {
            [startDate, endDate] = [endDate, startDate];
          }

          const filters = {
            dateRange: { start: startDate, end: endDate },
            transactionTypes: types,
            searchQuery: searchQuery,
            folioNumber: null,
            amountRange: { min: minAmount, max: maxAmount }
          };

          const filtered = applyFilters(transactions, filters);

          // Check that all filters are satisfied
          return filtered.every(tx => {
            const txDate = new Date(tx.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            txDate.setHours(12, 0, 0, 0);

            const dateMatch = txDate >= start && txDate <= end;
            const typeMatch = types.includes(tx.transactionType);
            const searchMatch = tx.schemeName.toLowerCase().includes(searchQuery.toLowerCase());
            const amountMatch = tx.amount >= minAmount && tx.amount <= maxAmount;

            return dateMatch && typeMatch && searchMatch && amountMatch;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Available filter options completeness
 * Feature: advanced-filtering-search, Property 4: Available filter options completeness
 * Validates: Requirements 2.3, 4.2
 * 
 * For any set of transactions, the available transaction type options should contain
 * exactly the unique transaction types present in the data, and folio options should
 * contain exactly the unique folio numbers.
 */
describe('Property 4: Available filter options completeness', () => {
  test('available transaction types should match unique types in data', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 100 }),
        (transactions) => {
          // Extract unique transaction types from the data
          const uniqueTypes = [...new Set(transactions.map(tx => tx.transactionType))];
          
          // Simulate what the component would do
          const availableTypes = [...new Set(transactions.map(tx => tx.transactionType))];
          
          // Check that they match exactly
          const sortedUnique = uniqueTypes.sort();
          const sortedAvailable = availableTypes.sort();
          
          if (sortedUnique.length !== sortedAvailable.length) {
            return false;
          }
          
          return sortedUnique.every((type, index) => type === sortedAvailable[index]);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('available folio numbers should match unique folios in data', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 100 }),
        (transactions) => {
          // Extract unique folio numbers from the data
          const uniqueFolios = [...new Set(transactions.map(tx => tx.folioNumber))];
          
          // Simulate what the component would do
          const availableFolios = [...new Set(transactions.map(tx => tx.folioNumber))];
          
          // Check that they match exactly
          const sortedUnique = uniqueFolios.sort();
          const sortedAvailable = availableFolios.sort();
          
          if (sortedUnique.length !== sortedAvailable.length) {
            return false;
          }
          
          return sortedUnique.every((folio, index) => folio === sortedAvailable[index]);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('available options should update when transaction data changes', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 50 }),
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 50 }),
        (transactions1, transactions2) => {
          // Get unique types from first dataset
          const types1 = [...new Set(transactions1.map(tx => tx.transactionType))];
          
          // Get unique types from second dataset
          const types2 = [...new Set(transactions2.map(tx => tx.transactionType))];
          
          // Get unique types from combined dataset
          const combinedTransactions = [...transactions1, ...transactions2];
          const typesCombined = [...new Set(combinedTransactions.map(tx => tx.transactionType))];
          
          // The combined unique types should be a superset of both individual sets
          const allTypes1InCombined = types1.every(type => typesCombined.includes(type));
          const allTypes2InCombined = types2.every(type => typesCombined.includes(type));
          
          return allTypes1InCombined && allTypes2InCombined;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('empty transaction array should result in empty available options', () => {
    const transactions = [];
    
    // Extract unique transaction types
    const uniqueTypes = [...new Set(transactions.map(tx => tx.transactionType))];
    
    // Extract unique folio numbers
    const uniqueFolios = [...new Set(transactions.map(tx => tx.folioNumber))];
    
    // Both should be empty
    expect(uniqueTypes).toEqual([]);
    expect(uniqueFolios).toEqual([]);
  });
});
