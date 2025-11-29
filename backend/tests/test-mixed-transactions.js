const { generateExcelReport } = require('./src/extractors/excelGenerator');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function testMixedTransactions() {
  const date = '01-Dec-2020';
  const amount = 100;
  const nav = 10;
  const units = 1;
  const balance = 1001;
  
  // Create test data with both financial and administrative transactions
  const transactionData = {
    funds: [{
      fundName: 'Test Fund',
      folios: [{
        folioNumber: 'TEST123',
        schemeName: 'Test Scheme',
        isin: 'INF123456789',
        transactions: [
          {
            date: date,
            amount: amount,
            nav: nav,
            units: units,
            transactionType: 'Purchase',
            unitBalance: balance,
            description: 'Purchase'
          },
          {
            date: date,
            amount: null,
            nav: null,
            units: null,
            transactionType: 'Administrative',
            unitBalance: null,
            description: '***Address Updated***'
          }
        ]
      }]
    }]
  };
  
  const portfolioData = { portfolioSummary: [] };
  const outputPath = path.join(__dirname, 'test-mixed-output.xlsx');
  
  try {
    // Generate Excel file
    await generateExcelReport(portfolioData, transactionData, outputPath, ['transactions']);
    
    // Read the generated Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(outputPath);
    
    const worksheet = workbook.getWorksheet('Transactions');
    
    console.log('Total rows:', worksheet.rowCount);
    console.log('\nRow 1 (Header):');
    const headerRow = worksheet.getRow(1);
    for (let i = 1; i <= 10; i++) {
      console.log(`  Cell ${i}: ${headerRow.getCell(i).value}`);
    }
    
    console.log('\nRow 2:');
    const row2 = worksheet.getRow(2);
    for (let i = 1; i <= 10; i++) {
      console.log(`  Cell ${i}: ${row2.getCell(i).value}`);
    }
    
    console.log('\nRow 3:');
    const row3 = worksheet.getRow(3);
    for (let i = 1; i <= 10; i++) {
      console.log(`  Cell ${i}: ${row3.getCell(i).value}`);
    }
    
  } finally {
    // Clean up test file
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
}

testMixedTransactions().catch(console.error);
