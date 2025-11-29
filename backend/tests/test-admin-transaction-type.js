const { parseTransactions } = require('../src/extractors/transactionExtractor');

// Test case with administrative transaction
const folioText = `Opening Unit Balance: 12871.468
09-Jul-2024
***NCT Correction of ARS***
09-Jul-2024
***NCT Correction of Change of Address***
Closing Unit Balance: 12871.468`;

console.log('Testing administrative transaction type...\n');
const transactions = parseTransactions(folioText);

transactions.forEach((tx, index) => {
  console.log(`Transaction ${index + 1}:`);
  console.log(`  Date: ${tx.date}`);
  console.log(`  Transaction Type: ${tx.transactionType}`);
  console.log(`  Description: ${tx.description}`);
  console.log(`  Is Administrative: ${tx.isAdministrative}`);
  console.log('');
});
