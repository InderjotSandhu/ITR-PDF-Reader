/**
 * Quick test to verify administrative transaction fix
 */

const { parseTransactions } = require('../src/extractors/transactionExtractor');

// Test 1: Stamp Duty transaction
console.log('Test 1: Stamp Duty Transaction');
const stampDutyText = `Opening Unit Balance: 1000.000
01-Jan-2024 10.00
*** Stamp Duty ***
Closing Unit Balance: 1000.000`;

const stampDutyResult = parseTransactions(stampDutyText);
console.log('Result:', JSON.stringify(stampDutyResult[0], null, 2));
console.log('Expected Transaction Type: "Stamp Duty" (cleaned)');
console.log('Expected Description: "*** Stamp Duty ***" (original with markers)');
console.log('Actual Transaction Type:', stampDutyResult[0]?.transactionType);
console.log('Actual Description:', stampDutyResult[0]?.description);
console.log('✓ PASS:', stampDutyResult[0]?.transactionType === 'Stamp Duty' && stampDutyResult[0]?.description === '*** Stamp Duty ***');
console.log('');

// Test 2: STT Paid transaction
console.log('Test 2: STT Paid Transaction');
const sttText = `Opening Unit Balance: 1000.000
01-Jan-2024 5.00
*** STT Paid ***
Closing Unit Balance: 1000.000`;

const sttResult = parseTransactions(sttText);
console.log('Result:', JSON.stringify(sttResult[0], null, 2));
console.log('Expected Transaction Type: "STT Paid" (cleaned)');
console.log('Expected Description: "*** STT Paid ***" (original with markers)');
console.log('Actual Transaction Type:', sttResult[0]?.transactionType);
console.log('Actual Description:', sttResult[0]?.description);
console.log('✓ PASS:', sttResult[0]?.transactionType === 'STT Paid' && sttResult[0]?.description === '*** STT Paid ***');
console.log('');

// Test 3: Other administrative transaction (e.g., KYC Update)
console.log('Test 3: Other Administrative Transaction');
const kycText = `Opening Unit Balance: 1000.000
01-Jan-2024
***KYC Update***
Closing Unit Balance: 1000.000`;

const kycResult = parseTransactions(kycText);
console.log('Result:', JSON.stringify(kycResult[0], null, 2));
console.log('Expected Transaction Type: "KYC Update" (cleaned)');
console.log('Expected Description: "***KYC Update***" (original with markers)');
console.log('Actual Transaction Type:', kycResult[0]?.transactionType);
console.log('Actual Description:', kycResult[0]?.description);
console.log('✓ PASS:', kycResult[0]?.transactionType === 'KYC Update' && kycResult[0]?.description === '***KYC Update***');
console.log('');

// Test 4: Nominee Registration
console.log('Test 4: Nominee Registration');
const nomineeText = `Opening Unit Balance: 1000.000
01-Jan-2024
***Registration of Nominee***
Closing Unit Balance: 1000.000`;

const nomineeResult = parseTransactions(nomineeText);
console.log('Result:', JSON.stringify(nomineeResult[0], null, 2));
console.log('Expected Transaction Type: "Registration of Nominee" (cleaned)');
console.log('Expected Description: "***Registration of Nominee***" (original with markers)');
console.log('Actual Transaction Type:', nomineeResult[0]?.transactionType);
console.log('Actual Description:', nomineeResult[0]?.description);
console.log('✓ PASS:', nomineeResult[0]?.transactionType === 'Registration of Nominee' && nomineeResult[0]?.description === '***Registration of Nominee***');
console.log('');

// Summary
console.log('=== SUMMARY ===');
const allPassed = 
  stampDutyResult[0]?.transactionType === 'Stamp Duty' && stampDutyResult[0]?.description === '*** Stamp Duty ***' &&
  sttResult[0]?.transactionType === 'STT Paid' && sttResult[0]?.description === '*** STT Paid ***' &&
  kycResult[0]?.transactionType === 'KYC Update' && kycResult[0]?.description === '***KYC Update***' &&
  nomineeResult[0]?.transactionType === 'Registration of Nominee' && nomineeResult[0]?.description === '***Registration of Nominee***';

if (allPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('');
  console.log('Administrative transactions now work correctly:');
  console.log('- Transaction Type: Cleaned description (e.g., "Stamp Duty", "STT Paid", "KYC Update")');
  console.log('- Description: Original text with *** markers preserved');
  console.log('- isAdministrative: true flag for filtering');
} else {
  console.log('❌ SOME TESTS FAILED');
}
