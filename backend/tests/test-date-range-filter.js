const { parseTransactions } = require('./src/extractors/transactionExtractor');

// Test case with date range that should be filtered out
const folioText = `Opening Unit Balance: 12871.468
18-Aug-2023 299985 23.3062 12871.468 Purchase
01-Apr-2014 To 19-Jul-2025
Closing Unit Balance: 12871.468`;

console.log('Testing date range filter...\n');
const transactions = parseTransactions(folioText);

console.log(`Total transactions extracted: ${transactions.length}`);
transactions.forEach((tx, index) => {
  console.log(`\nTransaction ${index + 1}:`);
  console.log(`  Date: ${tx.date}`);
  console.log(`  Description: ${tx.description}`);
});
