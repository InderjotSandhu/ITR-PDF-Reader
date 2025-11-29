/**
 * Quick test to verify administrative transaction fix
 */

const { parseTransactions } = require('./src/extractors/transactionExtractor');

// Test 1: Stamp Duty transaction
console.log('Test 1: Stamp Duty Transaction');
const stampDutyText = `Opening Unit Balance: 1000.000
01-Jan-2024 10.00
*** Stamp Duty ***
Closing Unit Balance: 1000.000`;

const stampDutyResult = parseTransactions(stampDutyText);
console.log('Result:', JSON.stringify(stampDutyResult[0], null, 2));
console.log('Expected Transaction Type: "Stamp Duty"');
console.log('Expected Description: "Administrative"');
console.log('Actual Transaction Type:', stampDutyResult[0]?.transactionType);
console.log('Actual Description:', stampDutyResult[0]?.description);
console.log('✓ PASS:', stampDutyResult[0]?.transactionType === 'Stamp Duty' && stampDutyResult[0]?.description === 'Administrative');
console.log('');

// Test 2: STT Paid transaction
console.log('Test 2: STT Paid Transaction');
const sttText = `Opening Unit Balance: 1000.000
01-Jan-2024 5.00
*** STT Paid ***
Closing Unit Balance: 1000.000`;

const sttResult = parseTransactions(sttText);
console.log('Result:', JSON.stringify(sttResult[0], null, 2));
console.log('Expected Transaction Type: "STT Paid"');
console.log('Expected Description: "Administrative"');
console.log('Actual Transaction Type:', sttResult[0]?.transactionType);
console.log('Actual Description:', sttResult[0]?.description);
console.log('✓ PASS:', sttResult[0]?.transactionType === 'STT Paid' && sttResult[0]?.description === 'Administrative');
console.log('');

// Test 3: Other administrative transaction (e.g., KYC Update)
console.log('Test 3: Other Administrative Transaction');
const kycText = `Opening Unit Balance: 1000.000
01-Jan-2024
***KYC Update***
Closing Unit Balance: 1000.000`;

const kycResult = parseTransactions(kycText);
console.log('Result:', JSON.stringify(kycResult[0], null, 2));
console.log('Expected Transaction Type: "***KYC Update***" (the actual description)');
console.log('Expected Description: "Administrative"');
console.log('Actual Transaction Type:', kycResult[0]?.transactionType);
console.log('Actual Description:', kycResult[0]?.description);
console.log('✓ PASS:', kycResult[0]?.transactionType === '***KYC Update***' && kycResult[0]?.description === 'Administrative');
console.log('');

// Test 4: Nominee Registration
console.log('Test 4: Nominee Registration');
const nomineeText = `Opening Unit Balance: 1000.000
01-Jan-2024
***Registration of Nominee***
Closing Unit Balance: 1000.000`;

const nomineeResult = parseTransactions(nomineeText);
console.log('Result:', JSON.stringify(nomineeResult[0], null, 2));
console.log('Expected Transaction Type: "***Registration of Nominee***"');
console.log('Expected Description: "Administrative"');
console.log('Actual Transaction Type:', nomineeResult[0]?.transactionType);
console.log('Actual Description:', nomineeResult[0]?.description);
console.log('✓ PASS:', nomineeResult[0]?.transactionType === '***Registration of Nominee***' && nomineeResult[0]?.description === 'Administrative');
console.log('');

// Summary
console.log('=== SUMMARY ===');
const allPassed = 
  stampDutyResult[0]?.transactionType === 'Stamp Duty' && stampDutyResult[0]?.description === 'Administrative' &&
  sttResult[0]?.transactionType === 'STT Paid' && sttResult[0]?.description === 'Administrative' &&
  kycResult[0]?.transactionType === '***KYC Update***' && kycResult[0]?.description === 'Administrative' &&
  nomineeResult[0]?.transactionType === '***Registration of Nominee***' && nomineeResult[0]?.description === 'Administrative';

if (allPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('');
  console.log('Administrative transactions now work correctly:');
  console.log('- Stamp Duty → Transaction Type: "Stamp Duty", Description: "Administrative"');
  console.log('- STT Paid → Transaction Type: "STT Paid", Description: "Administrative"');
  console.log('- Other *** transactions → Transaction Type: (actual description), Description: "Administrative"');
} else {
  console.log('❌ SOME TESTS FAILED');
}
