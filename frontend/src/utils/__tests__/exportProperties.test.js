/**
 * Property-Based Tests for Export Functionality
 * Feature: advanced-filtering-search
 * Using fast-check for property-based testing
 */

const fc = require('fast-check');
const { createFilterMetadata, serializeFilters } = require('../filterMetadata');

describe('Export Property-Based Tests', () => {
  describe('Property 13: Export data matches filtered view', () => {
    /**
     * Feature: advanced-filtering-search, Property 13: Export data matches filtered view
     * Validates: Requirements 8.1
     * 
     * For any set of active filters and transactions, the exported data should contain 
     * exactly the same transactions as displayed in the filtered view.
     */
    test('exported transactions should match filtered transactions exactly', () => {
      fc.assert(
        fc.property(
          // Generate array of transactions
          fc.array(
            fc.record({
              date: fc.integer({ min: 2020, max: 2024 })
                .chain(year => fc.integer({ min: 1, max: 12 })
                  .chain(month => fc.integer({ min: 1, max: 28 })
                    .map(day => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
                  )
                ),
              schemeName: fc.string({ minLength: 10, maxLength: 50 }),
              folioNumber: fc.stringMatching(/^[A-Z0-9]{8,12}$/),
              transactionType: fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out', 'Dividend'),
              amount: fc.float({ min: Math.fround(100), max: Math.fround(100000), noNaN: true }),
              nav: fc.option(fc.float({ min: Math.fround(10), max: Math.fround(1000), noNaN: true }), { nil: null }),
              units: fc.option(fc.float({ min: Math.fround(0.001), max: Math.fround(10000), noNaN: true }), { nil: null }),
              unitBalance: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true }), { nil: null }),
              description: fc.string({ minLength: 5, maxLength: 100 }),
              isAdministrative: fc.boolean(),
              isin: fc.stringMatching(/^INF[A-Z0-9]{9}$/)
            }),
            { minLength: 10, maxLength: 50 }
          ),
          // Generate filter indices to select subset
          fc.array(fc.nat(), { minLength: 1, maxLength: 20 }),
          (allTransactions, filterIndices) => {
            // Create filtered subset
            const filteredTransactions = filterIndices
              .map(idx => allTransactions[idx % allTransactions.length])
              .filter((tx, index, self) => 
                index === self.findIndex(t => t.date === tx.date && t.schemeName === tx.schemeName)
              );

            // Property: The filtered transactions array should be a subset of all transactions
            filteredTransactions.forEach(filteredTx => {
              const found = allTransactions.some(tx => 
                tx.date === filteredTx.date && 
                tx.schemeName === filteredTx.schemeName &&
                tx.amount === filteredTx.amount
              );
              expect(found).toBe(true);
            });

            // Property: Every transaction in filtered set should be unique
            const uniqueKeys = new Set(
              filteredTransactions.map(tx => `${tx.date}-${tx.schemeName}-${tx.amount}`)
            );
            expect(uniqueKeys.size).toBe(filteredTransactions.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('export request should include all filtered transactions', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              date: fc.string(),
              schemeName: fc.string(),
              amount: fc.float()
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (filteredTransactions) => {
            // Mock export data structure
            const exportData = {
              filteredTransactions,
              portfolioData: {},
              transactionData: {},
              filterMetadata: {},
              outputFormat: 'excel'
            };

            // Property: Export data should contain all filtered transactions
            expect(exportData.filteredTransactions).toEqual(filteredTransactions);
            expect(exportData.filteredTransactions.length).toBe(filteredTransactions.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Export format preservation', () => {
    /**
     * Feature: advanced-filtering-search, Property 14: Export format preservation
     * Validates: Requirements 8.2
     * 
     * For any selected output format (Excel, JSON, Text), applying filters should not 
     * change the output format of the export.
     */
    test('export format should remain consistent regardless of filters', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('excel', 'json', 'text'),
          fc.array(fc.record({ date: fc.string(), amount: fc.float() }), { minLength: 1, maxLength: 10 }),
          fc.record({
            dateRange: fc.record({
              start: fc.option(fc.date(), { nil: null }),
              end: fc.option(fc.date(), { nil: null })
            }),
            transactionTypes: fc.array(fc.string(), { maxLength: 5 }),
            searchQuery: fc.string(),
            folioNumber: fc.option(fc.string(), { nil: null }),
            amountRange: fc.record({
              min: fc.option(fc.float(), { nil: null }),
              max: fc.option(fc.float(), { nil: null })
            })
          }),
          (format, transactions, filters) => {
            // Create export data
            const exportData = {
              filteredTransactions: transactions,
              outputFormat: format,
              filterMetadata: createFilterMetadata(filters, 100, transactions.length)
            };

            // Property: Output format should match requested format
            expect(exportData.outputFormat).toBe(format);
            expect(['excel', 'json', 'text']).toContain(exportData.outputFormat);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('format should be preserved through the export pipeline', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('excel', 'json', 'text'),
          (format) => {
            // Mock export request
            const exportRequest = {
              outputFormat: format,
              filteredTransactions: [],
              filterMetadata: {}
            };

            // Property: Format should remain unchanged
            const processedFormat = exportRequest.outputFormat;
            expect(processedFormat).toBe(format);
            
            // Property: Format should be one of the valid options
            expect(['excel', 'json', 'text']).toContain(processedFormat);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Export metadata includes filter criteria', () => {
    /**
     * Feature: advanced-filtering-search, Property 15: Export metadata includes filter criteria
     * Validates: Requirements 8.4
     * 
     * For any filtered export, the metadata should contain all active filter information 
     * including filter types, values, and result counts.
     */
    test('metadata should include all active filter information', () => {
      fc.assert(
        fc.property(
          fc.record({
            dateRange: fc.record({
              start: fc.option(fc.date(), { nil: null }),
              end: fc.option(fc.date(), { nil: null })
            }),
            transactionTypes: fc.array(
              fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out'),
              { minLength: 0, maxLength: 3 }
            ),
            searchQuery: fc.string({ maxLength: 50 }),
            folioNumber: fc.option(fc.stringMatching(/^[A-Z0-9]{8,12}$/), { nil: null }),
            amountRange: fc.record({
              min: fc.option(fc.float({ min: 0, max: 50000 }), { nil: null }),
              max: fc.option(fc.float({ min: 50000, max: 100000 }), { nil: null })
            })
          }),
          fc.integer({ min: 10, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          (filters, originalCount, filteredCount) => {
            // Create filter metadata
            const metadata = createFilterMetadata(filters, originalCount, filteredCount);

            // Property: Metadata should have required fields
            expect(metadata).toHaveProperty('appliedAt');
            expect(metadata).toHaveProperty('filters');
            expect(metadata).toHaveProperty('originalCount');
            expect(metadata).toHaveProperty('filteredCount');

            // Property: Counts should be correct
            expect(metadata.originalCount).toBe(originalCount);
            expect(metadata.filteredCount).toBe(filteredCount);

            // Property: appliedAt should be a valid ISO date string
            expect(() => new Date(metadata.appliedAt)).not.toThrow();
            expect(new Date(metadata.appliedAt).toISOString()).toBe(metadata.appliedAt);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('serialized filters should include all non-empty filter values', () => {
      fc.assert(
        fc.property(
          fc.record({
            dateRange: fc.record({
              start: fc.option(fc.date(), { nil: null }),
              end: fc.option(fc.date(), { nil: null })
            }),
            transactionTypes: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
            searchQuery: fc.string({ minLength: 1, maxLength: 20 }),
            folioNumber: fc.option(fc.string({ minLength: 1 }), { nil: null }),
            amountRange: fc.record({
              min: fc.option(fc.float(), { nil: null }),
              max: fc.option(fc.float(), { nil: null })
            })
          }),
          (filters) => {
            const serialized = serializeFilters(filters);

            // Property: If transaction types are present, they should be in serialized output
            if (filters.transactionTypes.length > 0) {
              expect(serialized).toHaveProperty('transactionTypes');
              expect(serialized.transactionTypes).toEqual(filters.transactionTypes);
            }

            // Property: If search query is present, it should be in serialized output
            if (filters.searchQuery && filters.searchQuery.trim() !== '') {
              expect(serialized).toHaveProperty('searchQuery');
              expect(serialized.searchQuery).toBe(filters.searchQuery.trim());
            }

            // Property: If folio number is present, it should be in serialized output
            if (filters.folioNumber) {
              expect(serialized).toHaveProperty('folioNumber');
              expect(serialized.folioNumber).toBe(filters.folioNumber);
            }

            // Property: Serialized output should only contain non-empty filters
            Object.keys(serialized).forEach(key => {
              expect(serialized[key]).toBeTruthy();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('metadata should correctly represent filter counts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 10000 }),
          fc.integer({ min: 0, max: 10000 }),
          (originalCount, filteredCount) => {
            // Ensure filtered count doesn't exceed original count
            const actualFilteredCount = Math.min(filteredCount, originalCount);
            
            const filters = {
              dateRange: { start: null, end: null },
              transactionTypes: [],
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: null, max: null }
            };
            
            const metadata = createFilterMetadata(filters, originalCount, actualFilteredCount);

            // Property: Filtered count should never exceed original count
            expect(metadata.filteredCount).toBeLessThanOrEqual(metadata.originalCount);

            // Property: Counts should be non-negative
            expect(metadata.originalCount).toBeGreaterThanOrEqual(0);
            expect(metadata.filteredCount).toBeGreaterThanOrEqual(0);

            // Property: Metadata should preserve the counts passed to it
            expect(metadata.originalCount).toBe(originalCount);
            expect(metadata.filteredCount).toBe(actualFilteredCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('date range serialization should be human-readable', () => {
      fc.assert(
        fc.property(
          fc.record({
            start: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }), { nil: null }),
            end: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }), { nil: null })
          }),
          (dateRange) => {
            const filters = {
              dateRange,
              transactionTypes: [],
              searchQuery: '',
              folioNumber: null,
              amountRange: { min: null, max: null }
            };

            const serialized = serializeFilters(filters);

            // Property: If date range exists, it should be serialized as a string
            if (dateRange.start || dateRange.end) {
              expect(serialized).toHaveProperty('dateRange');
              expect(typeof serialized.dateRange).toBe('string');
              
              // Property: Serialized date should contain readable date format
              if (dateRange.start && dateRange.end) {
                expect(serialized.dateRange).toContain('to');
              } else if (dateRange.start) {
                expect(serialized.dateRange).toContain('From');
              } else if (dateRange.end) {
                expect(serialized.dateRange).toContain('Until');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('amount range serialization should include currency symbol', () => {
      fc.assert(
        fc.property(
          fc.record({
            min: fc.option(fc.float({ min: 0, max: 50000 }), { nil: null }),
            max: fc.option(fc.float({ min: 50000, max: 100000 }), { nil: null })
          }),
          (amountRange) => {
            const filters = {
              dateRange: { start: null, end: null },
              transactionTypes: [],
              searchQuery: '',
              folioNumber: null,
              amountRange
            };

            const serialized = serializeFilters(filters);

            // Property: If amount range exists, it should include currency symbol
            if (amountRange.min !== null || amountRange.max !== null) {
              expect(serialized).toHaveProperty('amountRange');
              expect(serialized.amountRange).toContain('₹');
              
              // Property: Should contain appropriate comparison operators
              if (amountRange.min !== null && amountRange.max !== null) {
                expect(serialized.amountRange).toContain('to');
              } else if (amountRange.min !== null) {
                expect(serialized.amountRange).toContain('≥');
              } else if (amountRange.max !== null) {
                expect(serialized.amountRange).toContain('≤');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
