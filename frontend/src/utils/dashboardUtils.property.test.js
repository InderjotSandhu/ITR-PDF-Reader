/**
 * Property-based tests for dashboard utility functions
 * Feature: data-visualization-dashboard
 */

import * as fc from 'fast-check';
import {
  calculateTotalInvestment,
  calculateGainsLosses,
  calculatePercentageReturn,
  getColorForValue
} from './dashboardUtils';

// Generator for transaction types
const transactionTypeArb = fc.oneof(
  fc.constant('Purchase'),
  fc.constant('SIP'),
  fc.constant('Redemption'),
  fc.constant('Switch-In'),
  fc.constant('Switch-Out'),
  fc.constant('Dividend')
);

// Generator for transactions
const transactionArb = fc.record({
  date: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()), // 2000-2030
  amount: fc.float({ min: 0, max: Math.fround(1000000), noNaN: true }),
  transactionType: transactionTypeArb,
  isAdministrative: fc.boolean(),
  schemeName: fc.string(),
  folioNumber: fc.string()
});

describe('Dashboard Utils - Property-Based Tests', () => {
  /**
   * Feature: data-visualization-dashboard, Property 1: Metric Calculation Accuracy
   * Validates: Requirements 6.2
   */
  describe('Property 1: Metric Calculation Accuracy', () => {
    it('should calculate total investment as sum of purchases/SIPs minus redemptions', () => {
      fc.assert(
        fc.property(fc.array(transactionArb, { minLength: 0, maxLength: 100 }), (transactions) => {
          const result = calculateTotalInvestment(transactions);

          // Manually calculate expected value
          const expected = transactions.reduce((total, tx) => {
            if (tx.isAdministrative) return total;
            
            const type = tx.transactionType.toLowerCase();
            if (type.includes('purchase') || type.includes('sip')) {
              return total + tx.amount;
            }
            if (type.includes('redemption')) {
              return total - tx.amount;
            }
            return total;
          }, 0);

          // Allow for floating point tolerance
          expect(Math.abs(result - expected)).toBeLessThan(0.01);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: data-visualization-dashboard, Property 6: Gains/Losses Formula
   * Validates: Requirements 6.4
   */
  describe('Property 6: Gains/Losses Formula', () => {
    it('should calculate gains/losses as currentValue - totalInvestment', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10000000), noNaN: true }),
          fc.float({ min: 0, max: Math.fround(10000000), noNaN: true }),
          (currentValue, totalInvestment) => {
            const result = calculateGainsLosses(currentValue, totalInvestment);
            const expected = currentValue - totalInvestment;

            // Allow for floating point tolerance
            expect(Math.abs(result - expected)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: data-visualization-dashboard, Property 7: Percentage Return Formula
   * Validates: Requirements 6.5
   */
  describe('Property 7: Percentage Return Formula', () => {
    it('should calculate percentage return as ((currentValue - totalInvestment) / totalInvestment) × 100', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10000000), noNaN: true }),
          fc.float({ min: 1, max: Math.fround(10000000), noNaN: true }), // min: 1 to avoid division by zero
          (currentValue, totalInvestment) => {
            const result = calculatePercentageReturn(currentValue, totalInvestment);
            const expected = ((currentValue - totalInvestment) / totalInvestment) * 100;

            // Allow for floating point tolerance
            expect(Math.abs(result - expected)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 when totalInvestment is 0', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10000000), noNaN: true }),
          (currentValue) => {
            const result = calculatePercentageReturn(currentValue, 0);
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: data-visualization-dashboard, Property 8: Color Coding Consistency
   * Validates: Requirements 6.6
   */
  describe('Property 8: Color Coding Consistency', () => {
    it('should return green for positive values', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.01), max: Math.fround(10000000), noNaN: true }),
          (value) => {
            const result = getColorForValue(value);
            expect(result).toBe('green');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return red for negative values', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(-10000000), max: Math.fround(-0.01), noNaN: true }),
          (value) => {
            const result = getColorForValue(value);
            expect(result).toBe('red');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return blue for zero', () => {
      const result = getColorForValue(0);
      expect(result).toBe('blue');
    });
  });
});


// Import the new function
import { calculatePortfolioAllocation } from './dashboardUtils';

// Generator for portfolio summary items
const portfolioItemArb = fc.record({
  fundName: fc.string({ minLength: 1 }),
  costValue: fc.float({ min: 0, max: Math.fround(10000000), noNaN: true }),
  marketValue: fc.float({ min: 0, max: Math.fround(10000000), noNaN: true })
});

describe('Portfolio Allocation - Property-Based Tests', () => {
  /**
   * Feature: data-visualization-dashboard, Property 2: Percentage Sum Invariant
   * Validates: Requirements 2.2
   */
  describe('Property 2: Percentage Sum Invariant', () => {
    it('should have percentages that sum to 100% (within floating-point tolerance)', () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 1, maxLength: 50 }),
          (portfolioSummary) => {
            // Filter to only items with positive market value (as the function does)
            const activeItems = portfolioSummary.filter(item => item.marketValue > 0);
            
            // Skip if no active items
            if (activeItems.length === 0) {
              return true;
            }

            const result = calculatePortfolioAllocation(activeItems);
            
            // Sum all percentages
            const totalPercentage = result.reduce((sum, item) => sum + item.percentage, 0);
            
            // Should be 100% within floating-point tolerance
            expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should group schemes into "Others" when more than 10 schemes exist', () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 11, maxLength: 50 }),
          (portfolioSummary) => {
            // Ensure all have positive market value
            const activeItems = portfolioSummary.map((item, idx) => ({
              ...item,
              marketValue: Math.max(item.marketValue, 1) // Ensure positive
            }));

            const result = calculatePortfolioAllocation(activeItems);
            
            // Should have exactly 11 items (top 10 + Others)
            expect(result.length).toBe(11);
            
            // Last item should be "Others"
            expect(result[result.length - 1].scheme).toBe('Others');
            
            // Percentages should still sum to 100%
            const totalPercentage = result.reduce((sum, item) => sum + item.percentage, 0);
            expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not group schemes when 10 or fewer schemes exist', () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 1, maxLength: 10 }),
          (portfolioSummary) => {
            // Ensure all have positive market value
            const activeItems = portfolioSummary.map((item, idx) => ({
              ...item,
              marketValue: Math.max(item.marketValue, 1) // Ensure positive
            }));

            const result = calculatePortfolioAllocation(activeItems);
            
            // Should have same number of items as input
            expect(result.length).toBe(activeItems.length);
            
            // Should not have "Others" category
            const hasOthers = result.some(item => item.scheme === 'Others');
            expect(hasOthers).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


// Import the new function
import { aggregateTransactionsByPeriod } from './dashboardUtils';

describe('Timeline Aggregation - Property-Based Tests', () => {
  /**
   * Feature: data-visualization-dashboard, Property 3: Timeline Aggregation Preservation
   * Validates: Requirements 3.2
   */
  describe('Property 3: Timeline Aggregation Preservation', () => {
    it('should preserve total purchase amounts across all periods', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = aggregateTransactionsByPeriod(transactions, 'monthly');
            
            // Calculate total purchases from original transactions
            const originalPurchases = transactions
              .filter(tx => !tx.isAdministrative)
              .filter(tx => {
                const type = tx.transactionType.toLowerCase();
                return type.includes('purchase') || type.includes('sip');
              })
              .reduce((sum, tx) => sum + tx.amount, 0);
            
            // Calculate total purchases from aggregated data
            const aggregatedPurchases = result.reduce((sum, item) => sum + item.purchases, 0);
            
            // Should be equal within floating-point tolerance
            expect(Math.abs(originalPurchases - aggregatedPurchases)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve total redemption amounts across all periods', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = aggregateTransactionsByPeriod(transactions, 'monthly');
            
            // Calculate total redemptions from original transactions
            const originalRedemptions = transactions
              .filter(tx => !tx.isAdministrative)
              .filter(tx => tx.transactionType.toLowerCase().includes('redemption'))
              .reduce((sum, tx) => sum + tx.amount, 0);
            
            // Calculate total redemptions from aggregated data
            const aggregatedRedemptions = result.reduce((sum, item) => sum + item.redemptions, 0);
            
            // Should be equal within floating-point tolerance
            expect(Math.abs(originalRedemptions - aggregatedRedemptions)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve transaction count across all periods', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = aggregateTransactionsByPeriod(transactions, 'monthly');
            
            // Count non-administrative transactions
            const originalCount = transactions.filter(tx => !tx.isAdministrative).length;
            
            // Calculate total count from aggregated data
            const aggregatedCount = result.reduce((sum, item) => sum + item.count, 0);
            
            // Should be equal
            expect(aggregatedCount).toBe(originalCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should work with different aggregation periods', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          fc.constantFrom('monthly', 'quarterly', 'yearly'),
          (transactions, period) => {
            const result = aggregateTransactionsByPeriod(transactions, period);
            
            // Calculate total amounts from original
            const originalTotal = transactions
              .filter(tx => !tx.isAdministrative)
              .reduce((sum, tx) => {
                const type = tx.transactionType.toLowerCase();
                if (type.includes('purchase') || type.includes('sip')) {
                  return sum + tx.amount;
                } else if (type.includes('redemption')) {
                  return sum - tx.amount;
                }
                return sum;
              }, 0);
            
            // Calculate total from aggregated net
            const aggregatedTotal = result.reduce((sum, item) => sum + item.net, 0);
            
            // Should be equal within floating-point tolerance
            expect(Math.abs(originalTotal - aggregatedTotal)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


// Import the new function
import { calculateTypeDistribution } from './dashboardUtils';

describe('Transaction Type Distribution - Property-Based Tests', () => {
  /**
   * Feature: data-visualization-dashboard, Property 4: Transaction Count Accuracy
   * Validates: Requirements 4.2
   */
  describe('Property 4: Transaction Count Accuracy', () => {
    it('should have counts that sum to total number of transactions', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = calculateTypeDistribution(transactions, false);
            
            // Count non-administrative transactions
            const expectedTotal = transactions.filter(tx => !tx.isAdministrative).length;
            
            // Sum counts from distribution
            const actualTotal = result.reduce((sum, item) => sum + item.count, 0);
            
            // Should be equal
            expect(actualTotal).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include administrative transactions when flag is true', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = calculateTypeDistribution(transactions, true);
            
            // Count all transactions
            const expectedTotal = transactions.length;
            
            // Sum counts from distribution
            const actualTotal = result.reduce((sum, item) => sum + item.count, 0);
            
            // Should be equal
            expect(actualTotal).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have percentages that sum to 100%', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            // Filter to ensure we have at least one non-administrative transaction
            const nonAdminTransactions = transactions.filter(tx => !tx.isAdministrative);
            
            if (nonAdminTransactions.length === 0) {
              return true; // Skip if no non-admin transactions
            }

            const result = calculateTypeDistribution(transactions, false);
            
            // Sum percentages
            const totalPercentage = result.reduce((sum, item) => sum + item.percentage, 0);
            
            // Should be 100% within floating-point tolerance
            expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve total transaction amounts', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = calculateTypeDistribution(transactions, false);
            
            // Calculate total amount from original transactions
            const expectedTotal = transactions
              .filter(tx => !tx.isAdministrative)
              .reduce((sum, tx) => sum + (tx.amount || 0), 0);
            
            // Sum amounts from distribution
            const actualTotal = result.reduce((sum, item) => sum + item.amount, 0);
            
            // Should be equal within floating-point tolerance
            expect(Math.abs(expectedTotal - actualTotal)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


// Import the new function
import { calculateMonthlyTrends } from './dashboardUtils';

describe('Monthly Trends - Property-Based Tests', () => {
  /**
   * Feature: data-visualization-dashboard, Property 5: Net Investment Calculation
   * Validates: Requirements 5.2
   */
  describe('Property 5: Net Investment Calculation', () => {
    it('should calculate net as purchases minus redemptions for each month', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = calculateMonthlyTrends(transactions);
            
            // For each month, verify net = purchases - redemptions
            result.forEach(monthData => {
              const expectedNet = monthData.purchases - monthData.redemptions;
              expect(Math.abs(monthData.net - expectedNet)).toBeLessThan(0.01);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve total amounts when filtering by year', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          fc.integer({ min: 2000, max: 2030 }),
          (transactions, filterYear) => {
            const result = calculateMonthlyTrends(transactions, filterYear);
            
            // Calculate expected totals from original transactions for that year
            const expectedPurchases = transactions
              .filter(tx => !tx.isAdministrative)
              .filter(tx => new Date(tx.date).getFullYear() === filterYear)
              .filter(tx => {
                const type = tx.transactionType.toLowerCase();
                return type.includes('purchase') || type.includes('sip');
              })
              .reduce((sum, tx) => sum + tx.amount, 0);
            
            const expectedRedemptions = transactions
              .filter(tx => !tx.isAdministrative)
              .filter(tx => new Date(tx.date).getFullYear() === filterYear)
              .filter(tx => tx.transactionType.toLowerCase().includes('redemption'))
              .reduce((sum, tx) => sum + tx.amount, 0);
            
            // Calculate totals from monthly trends
            const actualPurchases = result.reduce((sum, item) => sum + item.purchases, 0);
            const actualRedemptions = result.reduce((sum, item) => sum + item.redemptions, 0);
            
            // Should be equal within floating-point tolerance
            expect(Math.abs(expectedPurchases - actualPurchases)).toBeLessThan(0.01);
            expect(Math.abs(expectedRedemptions - actualRedemptions)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all months in the correct year when year filter is applied', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          fc.integer({ min: 2000, max: 2030 }),
          (transactions, filterYear) => {
            const result = calculateMonthlyTrends(transactions, filterYear);
            
            // All results should be from the specified year
            result.forEach(monthData => {
              expect(monthData.year).toBe(filterYear);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve total net investment across all months', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 1, maxLength: 100 }),
          (transactions) => {
            const result = calculateMonthlyTrends(transactions);
            
            // Calculate expected net from original transactions
            const expectedNet = transactions
              .filter(tx => !tx.isAdministrative)
              .reduce((sum, tx) => {
                const type = tx.transactionType.toLowerCase();
                if (type.includes('purchase') || type.includes('sip')) {
                  return sum + tx.amount;
                } else if (type.includes('redemption')) {
                  return sum - tx.amount;
                }
                return sum;
              }, 0);
            
            // Calculate total net from monthly trends
            const actualNet = result.reduce((sum, item) => sum + item.net, 0);
            
            // Should be equal within floating-point tolerance
            expect(Math.abs(expectedNet - actualNet)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
