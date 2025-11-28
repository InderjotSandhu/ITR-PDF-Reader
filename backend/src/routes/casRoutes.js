const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { extractTextFromPDF } = require('../extractors/pdfExtractor');
const { extractPortfolioSummary } = require('../extractors/portfolioExtractor');
const { extractFundTransactions } = require('../extractors/transactionExtractor');
const { generateExcelReport } = require('../extractors/excelGenerator');

/**
 * POST /api/extract-cas
 * Main endpoint for CAS PDF extraction and file generation
 * Supports multiple output formats: excel, json, text
 * Supports sheet selection for Excel: portfolio, transactions, holdings
 */
router.post('/extract-cas', upload.single('pdf'), async (req, res) => {
  let uploadedFilePath = null;
  let outputFilePath = null;
  
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a PDF file'
      });
    }
    
    uploadedFilePath = req.file.path;
    const password = req.body.password || null;
    const outputFormat = req.body.outputFormat || 'excel'; // excel, json, text
    const selectedSheets = req.body.sheets ? JSON.parse(req.body.sheets) : ['portfolio', 'transactions', 'holdings'];
    
    console.log(`\n📄 Processing CAS PDF: ${req.file.originalname}`);
    console.log(`   File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Output format: ${outputFormat}`);
    if (password) console.log(`   Password protected: Yes`);
    if (outputFormat === 'excel') console.log(`   Selected sheets: ${selectedSheets.join(', ')}`);
    
    // Step 1: Extract text from PDF
    console.log('\n🔍 Step 1: Extracting text from PDF...');
    const textContent = await extractTextFromPDF(uploadedFilePath, password);
    
    if (!textContent || textContent.length < 100) {
      throw new Error('Extracted text is too short. PDF may be empty or corrupted.');
    }
    
    // Step 2: Extract portfolio summary
    console.log('\n📊 Step 2: Extracting portfolio summary...');
    const portfolioData = extractPortfolioSummary(textContent);
    
    if (!portfolioData.portfolioSummary || portfolioData.portfolioSummary.length === 0) {
      throw new Error('No portfolio data found. Please ensure this is a valid CAS PDF.');
    }
    
    // Step 3: Extract fund transactions
    console.log('\n💼 Step 3: Extracting fund transactions...');
    const transactionData = extractFundTransactions(textContent, portfolioData);
    
    if (!transactionData.funds || transactionData.funds.length === 0) {
      throw new Error('No transaction data found. Please ensure this is a valid CAS PDF.');
    }
    
    // Prepare summary
    const summary = {
      totalFunds: portfolioData.fundCount,
      totalFolios: transactionData.totalFolios,
      totalTransactions: 0
    };
    
    // Count total transactions
    transactionData.funds.forEach(fund => {
      fund.folios.forEach(folio => {
        if (folio.transactions) {
          summary.totalTransactions += folio.transactions.length;
        }
      });
    });
    
    console.log('\n✅ Extraction Complete!');
    console.log(`   Funds: ${summary.totalFunds}`);
    console.log(`   Folios: ${summary.totalFolios}`);
    console.log(`   Transactions: ${summary.totalTransactions}`);
    
    const timestamp = Date.now();
    const originalName = path.parse(req.file.originalname).name;
    let fileName, contentType;
    
    // Step 4: Generate output based on format
    if (outputFormat === 'json') {
      console.log('\n📦 Step 4: Generating JSON output...');
      fileName = `${originalName}_CAS_Data_${timestamp}.json`;
      outputFilePath = path.join(__dirname, '../../output', fileName);
      
      const jsonData = {
        metadata: {
          extractedAt: new Date().toISOString(),
          sourceFile: req.file.originalname,
          summary
        },
        portfolioData,
        transactionData,
        rawText: textContent
      };
      
      fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));
      contentType = 'application/json';
      console.log(`✓ JSON file saved: ${fileName}`);
      
    } else if (outputFormat === 'text') {
      console.log('\n📝 Step 4: Generating text output...');
      fileName = `${originalName}_CAS_Extracted_${timestamp}.txt`;
      outputFilePath = path.join(__dirname, '../../output', fileName);
      
      fs.writeFileSync(outputFilePath, textContent);
      contentType = 'text/plain';
      console.log(`✓ Text file saved: ${fileName}`);
      
    } else {
      // Default: Excel
      console.log('\n📈 Step 4: Generating Excel report...');
      fileName = `${originalName}_CAS_Report_${timestamp}.xlsx`;
      outputFilePath = path.join(__dirname, '../../output', fileName);
      
      await generateExcelReport(portfolioData, transactionData, outputFilePath, selectedSheets);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      console.log(`✓ Excel file saved: ${fileName}`);
    }
    
    // Send file as download with proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.download(outputFilePath, fileName, (err) => {
      // Cleanup files after download
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Download failed',
            message: 'Failed to download file'
          });
        }
      }
      
      // Delete output file after a delay (5 minutes)
      setTimeout(() => {
        if (outputFilePath && fs.existsSync(outputFilePath)) {
          fs.unlinkSync(outputFilePath);
          console.log(`🗑️  Cleaned up: ${fileName}`);
        }
      }, 5 * 60 * 1000);
    });
    
  } catch (error) {
    console.error('\n❌ Error during extraction:', error.message);
    
    // Cleanup uploaded file on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
    
    // Cleanup output file on error
    if (outputFilePath && fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
    
    // Send error response
    res.status(500).json({
      error: 'Extraction failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/extract-cas-data
 * Extract CAS data and return as JSON (for filtering in frontend)
 * Does not generate files, just returns the extracted data
 */
router.post('/extract-cas-data', upload.single('pdf'), async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a PDF file'
      });
    }
    
    uploadedFilePath = req.file.path;
    const password = req.body.password || null;
    
    console.log(`\n📄 Processing CAS PDF for data extraction: ${req.file.originalname}`);
    console.log(`   File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    if (password) console.log(`   Password protected: Yes`);
    
    // Step 1: Extract text from PDF
    console.log('\n🔍 Step 1: Extracting text from PDF...');
    const textContent = await extractTextFromPDF(uploadedFilePath, password);
    
    if (!textContent || textContent.length < 100) {
      throw new Error('Extracted text is too short. PDF may be empty or corrupted.');
    }
    
    // Step 2: Extract portfolio summary
    console.log('\n📊 Step 2: Extracting portfolio summary...');
    const portfolioData = extractPortfolioSummary(textContent);
    
    if (!portfolioData.portfolioSummary || portfolioData.portfolioSummary.length === 0) {
      throw new Error('No portfolio data found. Please ensure this is a valid CAS PDF.');
    }
    
    // Step 3: Extract fund transactions
    console.log('\n💼 Step 3: Extracting fund transactions...');
    const transactionData = extractFundTransactions(textContent, portfolioData);
    
    if (!transactionData.funds || transactionData.funds.length === 0) {
      throw new Error('No transaction data found. Please ensure this is a valid CAS PDF.');
    }
    
    // Flatten transactions for filtering
    const allTransactions = [];
    transactionData.funds.forEach(fund => {
      fund.folios.forEach(folio => {
        if (folio.transactions) {
          folio.transactions.forEach(transaction => {
            allTransactions.push({
              ...transaction,
              schemeName: fund.schemeName,
              folioNumber: folio.folioNumber,
              isin: fund.isin || ''
            });
          });
        }
      });
    });
    
    // Prepare summary
    const summary = {
      totalFunds: portfolioData.fundCount,
      totalFolios: transactionData.totalFolios,
      totalTransactions: allTransactions.length
    };
    
    console.log('\n✅ Extraction Complete!');
    console.log(`   Funds: ${summary.totalFunds}`);
    console.log(`   Folios: ${summary.totalFolios}`);
    console.log(`   Transactions: ${summary.totalTransactions}`);
    
    // Return data as JSON
    res.json({
      success: true,
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceFile: req.file.originalname,
        summary
      },
      portfolioData,
      transactionData,
      transactions: allTransactions
    });
    
  } catch (error) {
    console.error('\n❌ Error during extraction:', error.message);
    
    // Send error response
    res.status(500).json({
      error: 'Extraction failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Cleanup uploaded file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  }
});

/**
 * POST /api/export-filtered
 * Export filtered transaction data
 * Accepts filtered transactions and filter metadata from frontend
 */
router.post('/export-filtered', async (req, res) => {
  let outputFilePath = null;
  
  try {
    const { 
      filteredTransactions, 
      portfolioData, 
      transactionData,
      filterMetadata,
      outputFormat = 'excel',
      selectedSheets = ['portfolio', 'transactions', 'holdings'],
      sourceFileName = 'CAS_Data'
    } = req.body;
    
    // Validate required data
    if (!filteredTransactions || !Array.isArray(filteredTransactions)) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'filteredTransactions array is required'
      });
    }
    
    console.log(`\n📦 Exporting filtered data...`);
    console.log(`   Output format: ${outputFormat}`);
    console.log(`   Filtered transactions: ${filteredTransactions.length}`);
    console.log(`   Original transactions: ${filterMetadata?.originalCount || 'unknown'}`);
    
    const timestamp = Date.now();
    const originalName = sourceFileName.replace(/\.(pdf|PDF)$/, '');
    let fileName, contentType;
    
    // Reconstruct transaction data structure from filtered transactions
    const filteredTransactionData = reconstructTransactionData(
      filteredTransactions, 
      transactionData
    );
    
    if (outputFormat === 'json') {
      console.log('📦 Generating filtered JSON output...');
      fileName = `${originalName}_Filtered_${timestamp}.json`;
      outputFilePath = path.join(__dirname, '../../output', fileName);
      
      const jsonData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          sourceFile: sourceFileName,
          filterMetadata: filterMetadata || null,
          summary: {
            totalFunds: portfolioData?.fundCount || 0,
            totalFolios: filteredTransactionData.totalFolios,
            totalTransactions: filteredTransactions.length
          }
        },
        portfolioData: portfolioData || null,
        transactionData: filteredTransactionData,
        transactions: filteredTransactions
      };
      
      fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));
      contentType = 'application/json';
      console.log(`✓ Filtered JSON file saved: ${fileName}`);
      
    } else if (outputFormat === 'text') {
      console.log('📝 Generating filtered text output...');
      fileName = `${originalName}_Filtered_${timestamp}.txt`;
      outputFilePath = path.join(__dirname, '../../output', fileName);
      
      let textContent = '';
      
      // Add filter summary if metadata exists
      if (filterMetadata) {
        textContent += formatFilterMetadataAsText(filterMetadata);
        textContent += '\n\n';
      }
      
      // Add transaction data
      textContent += '=== FILTERED TRANSACTIONS ===\n\n';
      filteredTransactions.forEach((tx, index) => {
        textContent += `Transaction ${index + 1}:\n`;
        textContent += `  Date: ${tx.date}\n`;
        textContent += `  Scheme: ${tx.schemeName}\n`;
        textContent += `  Folio: ${tx.folioNumber}\n`;
        textContent += `  Type: ${tx.transactionType}\n`;
        textContent += `  Amount: ₹${tx.amount?.toLocaleString('en-IN') || 'N/A'}\n`;
        textContent += `  NAV: ${tx.nav || 'N/A'}\n`;
        textContent += `  Units: ${tx.units || 'N/A'}\n`;
        textContent += `  Balance: ${tx.unitBalance || 'N/A'}\n`;
        textContent += '\n';
      });
      
      fs.writeFileSync(outputFilePath, textContent);
      contentType = 'text/plain';
      console.log(`✓ Filtered text file saved: ${fileName}`);
      
    } else {
      // Default: Excel
      console.log('📈 Generating filtered Excel report...');
      fileName = `${originalName}_Filtered_${timestamp}.xlsx`;
      outputFilePath = path.join(__dirname, '../../output', fileName);
      
      await generateExcelReport(
        portfolioData, 
        filteredTransactionData, 
        outputFilePath, 
        selectedSheets,
        filterMetadata
      );
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      console.log(`✓ Filtered Excel file saved: ${fileName}`);
    }
    
    // Send file as download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.download(outputFilePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Download failed',
            message: 'Failed to download file'
          });
        }
      }
      
      // Delete output file after a delay (5 minutes)
      setTimeout(() => {
        if (outputFilePath && fs.existsSync(outputFilePath)) {
          fs.unlinkSync(outputFilePath);
          console.log(`🗑️  Cleaned up: ${fileName}`);
        }
      }, 5 * 60 * 1000);
    });
    
  } catch (error) {
    console.error('\n❌ Error during filtered export:', error.message);
    
    // Cleanup output file on error
    if (outputFilePath && fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
    
    res.status(500).json({
      error: 'Export failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Helper function to reconstruct transaction data structure from flat filtered transactions
 */
function reconstructTransactionData(filteredTransactions, originalTransactionData) {
  const fundsMap = new Map();
  
  // Group transactions by scheme and folio
  filteredTransactions.forEach(tx => {
    const key = `${tx.schemeName}|${tx.isin}`;
    
    if (!fundsMap.has(key)) {
      fundsMap.set(key, {
        schemeName: tx.schemeName,
        isin: tx.isin,
        folios: new Map()
      });
    }
    
    const fund = fundsMap.get(key);
    
    if (!fund.folios.has(tx.folioNumber)) {
      // Find original folio data for metadata
      let originalFolio = null;
      if (originalTransactionData?.funds) {
        for (const origFund of originalTransactionData.funds) {
          if (origFund.folios) {
            const folio = origFund.folios.find(f => f.folioNumber === tx.folioNumber);
            if (folio) {
              originalFolio = folio;
              break;
            }
          }
        }
      }
      
      fund.folios.set(tx.folioNumber, {
        folioNumber: tx.folioNumber,
        schemeName: tx.schemeName,
        isin: tx.isin,
        openingUnitBalance: originalFolio?.openingUnitBalance || null,
        closingUnitBalance: originalFolio?.closingUnitBalance || null,
        navOnDate: originalFolio?.navOnDate || null,
        totalCostValue: originalFolio?.totalCostValue || null,
        marketValue: originalFolio?.marketValue || null,
        advisor: originalFolio?.advisor || null,
        pan: originalFolio?.pan || null,
        transactions: []
      });
    }
    
    fund.folios.get(tx.folioNumber).transactions.push({
      date: tx.date,
      transactionType: tx.transactionType,
      amount: tx.amount,
      nav: tx.nav,
      units: tx.units,
      unitBalance: tx.unitBalance,
      description: tx.description,
      isAdministrative: tx.isAdministrative
    });
  });
  
  // Convert maps to arrays
  const funds = Array.from(fundsMap.values()).map(fund => ({
    schemeName: fund.schemeName,
    isin: fund.isin,
    folios: Array.from(fund.folios.values())
  }));
  
  // Count unique folios
  const uniqueFolios = new Set();
  funds.forEach(fund => {
    fund.folios.forEach(folio => {
      uniqueFolios.add(folio.folioNumber);
    });
  });
  
  return {
    funds,
    totalFolios: uniqueFolios.size
  };
}

/**
 * Helper function to format filter metadata as text
 */
function formatFilterMetadataAsText(metadata) {
  const lines = [];
  
  lines.push('=== FILTER SUMMARY ===');
  lines.push(`Applied At: ${new Date(metadata.appliedAt).toLocaleString('en-IN')}`);
  lines.push(`Results: ${metadata.filteredCount} of ${metadata.originalCount} transactions`);
  lines.push('');
  
  if (Object.keys(metadata.filters).length === 0) {
    lines.push('No filters applied');
  } else {
    lines.push('Active Filters:');
    
    if (metadata.filters.dateRange) {
      lines.push(`  • Date Range: ${metadata.filters.dateRange}`);
    }
    
    if (metadata.filters.transactionTypes) {
      lines.push(`  • Transaction Types: ${metadata.filters.transactionTypes.join(', ')}`);
    }
    
    if (metadata.filters.searchQuery) {
      lines.push(`  • Search: "${metadata.filters.searchQuery}"`);
    }
    
    if (metadata.filters.folioNumber) {
      lines.push(`  • Folio Number: ${metadata.filters.folioNumber}`);
    }
    
    if (metadata.filters.amountRange) {
      lines.push(`  • Amount Range: ${metadata.filters.amountRange}`);
    }
  }
  
  lines.push('======================');
  
  return lines.join('\n');
}

/**
 * GET /api/status
 * Check extraction status
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'ready',
    message: 'CAS extraction service is ready',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
