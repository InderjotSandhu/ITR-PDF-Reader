const { parseTransactions } = require('../src/extractors/transactionExtractor');

// Test various financial transaction descriptions
const folioText = `Opening Unit Balance: 1000.000
01-Jan-2024 10,000.00 100.00 100.000 *Purchase - Regular Plan
15-Jan-2024 5,000.00 105.00 47.619 *SYSTEMATIC INVESTMENT PLAN
01-Feb-2024 (5,000.00) 110.00 (45.455) *Redemption Request
15-Feb-2024 (10,000.00) 115.00 (86.957) *Switch-Out - To Another Fund
15-Feb-2024 10,000.00 120.00 83.333 *Switch-In - From Another Fund
01-Mar-2024 500.00 125.00 4.000 *Dividend Reinvestment
15-Mar-2024 1,000.00 130.00 7.692 Regular Purchase
Closing Unit Balance: 1110.232`;

console.log('Testing financial transaction classification...\n');
const transactions = parseTransactions(folioText);

const expectedTypes = [
  'Purchase',
  'Systematic Investment',
  'Redemption',
  'Switch-Out',
  'Switch-In',
  'Dividend',
  'Purchase'
];

let allPassed = true;

transactions.forEach((tx, index) => {
  const expected = expectedTypes[index];
  const passed = tx.transactionType === expected;
  allPassed = allPassed && passed;
  
  console.log(`Transaction ${index + 1}: ${passed ? '✓' : '✗'}`);
  console.log(`  Description: ${tx.description}`);
  console.log(`  Expected Type: ${expected}`);
  console.log(`  Actual Type: ${tx.transactionType}`);
  console.log(`  Match: ${passed ? 'PASS' : 'FAIL'}`);
  console.log('');
});

console.log(`\nOverall Result: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
process.exit(allPassed ? 0 : 1);
