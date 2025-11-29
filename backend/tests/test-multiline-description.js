const { parseTransactions } = require('./src/extractors/transactionExtractor');

// Test case with multi-line description (actual format from PDF)
const folioText = `Opening Unit Balance: 12871.468
27-Sep-2023 (50,000.00) 23.4671	(2,130.664)	
*Switch-Out - To ABSL Small Cap Fund Growth , less STT 10,740.804
27-Sep-2023 0.50
*** STT Paid ***
Closing Unit Balance: 10740.804`;

console.log('Testing multi-line description extraction...\n');
const transactions = parseTransactions(folioText);

transactions.forEach((tx, index) => {
  console.log(`Transaction ${index + 1}:`);
  console.log(`  Date: ${tx.date}`);
  console.log(`  Amount: ${tx.amount}`);
  console.log(`  NAV: ${tx.nav}`);
  console.log(`  Units: ${tx.units}`);
  console.log(`  Unit Balance: ${tx.unitBalance}`);
  console.log(`  Transaction Type: ${tx.transactionType}`);
  console.log(`  Description: ${tx.description}`);
  console.log(`  Is Administrative: ${tx.isAdministrative}`);
  console.log('');
});
