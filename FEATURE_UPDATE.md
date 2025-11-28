# Feature Update - Multiple Output Formats & Sheet Selection

## Overview
Enhanced the CAS PDF Extractor with flexible output options and customizable Excel sheet generation.

## New Features

### 1. Multiple Output Formats

Users can now choose from three output formats:

#### 📊 Excel Format (Enhanced)
- **What's New**: Customizable sheet selection
- **Use Case**: Professional reports and data analysis
- **Features**:
  - Select which sheets to generate
  - Professional formatting maintained
  - Reduced file size when selecting fewer sheets
  - Faster generation with selective sheets

#### 📦 JSON Format (New)
- **What's New**: Complete data export in JSON
- **Use Case**: API integration, custom processing
- **Content**:
  - Metadata (timestamp, source file, summary statistics)
  - Complete portfolio data
  - Complete transaction data
  - Raw extracted text
- **Benefits**:
  - Easy to parse programmatically
  - Perfect for data pipelines
  - Includes all extracted information

#### 📝 Text Format (New)
- **What's New**: Raw text extraction
- **Use Case**: Debugging, custom parsing, text analysis
- **Content**: Complete extracted text from PDF
- **Benefits**:
  - See exactly what was extracted
  - Useful for troubleshooting
  - Can be used for custom parsing logic

### 2. Excel Sheet Selection

When using Excel format, users can now select which sheets to generate:

#### Available Sheets
1. **Portfolio Summary** - Fund-wise overview with values
2. **Transactions** - Complete transaction history
3. **MF Holdings** - Current holdings with details

#### Selection Options
- **All Sheets** (Default) - Complete comprehensive report
- **Custom Selection** - Choose specific sheets:
  - Portfolio only - Quick overview
  - Transactions only - Detailed history
  - Holdings only - Current positions
  - Any combination

#### Benefits
- **Faster Processing** - Generate only what you need
- **Smaller Files** - Reduced file size
- **Focused Reports** - Get exactly the data you want

## Technical Implementation

### Backend Changes

#### 1. Updated `excelGenerator.js`
```javascript
// Now accepts sheets parameter
async function generateExcelReport(
  portfolioData, 
  transactionData, 
  outputPath, 
  sheets = ['portfolio', 'transactions', 'holdings']
)
```

#### 2. Enhanced `casRoutes.js`
- Added `outputFormat` parameter handling
- Added `sheets` parameter for Excel customization
- Implemented JSON output generation
- Implemented text output generation
- Dynamic content-type and filename handling

### Frontend Changes

#### 1. Updated `PDFUploader.js`
- Added output format selection (radio buttons)
- Added sheet selection checkboxes (for Excel)
- Updated upload logic to send format and sheet preferences
- Dynamic button text based on selected format
- Enhanced success messages with format info

#### 2. Enhanced `PDFUploader.css`
- New styles for format selection section
- New styles for sheet selection checkboxes
- Responsive design for new options
- Dark mode support for all new elements

## User Interface

### Format Selection
```
Output Format:
○ 📊 Excel    ○ 📦 JSON    ○ 📝 Text
```

### Sheet Selection (Excel only)
```
Select Sheets to Generate:
☑ Portfolio Summary
☑ Transactions
☑ MF Holdings
```

## API Changes

### Request Parameters

**Before:**
```javascript
FormData:
- pdf: File
- password: String (optional)
```

**After:**
```javascript
FormData:
- pdf: File (required)
- password: String (optional)
- outputFormat: String (optional) - 'excel' | 'json' | 'text'
- sheets: JSON String (optional) - ['portfolio', 'transactions', 'holdings']
```

### Response

All formats return appropriate:
- Content-Type header
- Content-Disposition with filename
- Proper file extension

## File Naming

- **Excel**: `{name}_CAS_Report_{timestamp}.xlsx`
- **JSON**: `{name}_CAS_Data_{timestamp}.json`
- **Text**: `{name}_CAS_Extracted_{timestamp}.txt`

## Use Cases

### For Financial Advisors
- **Excel with all sheets**: Comprehensive client reports
- **Excel with Portfolio only**: Quick portfolio reviews

### For Developers
- **JSON format**: System integration and automation
- **Text format**: Custom parsing and analysis

### For Data Analysts
- **Excel with Transactions**: Detailed transaction analysis
- **JSON format**: Import into analysis tools

### For Quick Reviews
- **Excel with Portfolio**: Fast overview of holdings
- **Text format**: Quick data verification

## Benefits

1. **Flexibility** - Choose the format that fits your workflow
2. **Efficiency** - Generate only what you need
3. **Integration** - JSON format for easy system integration
4. **Debugging** - Text format for troubleshooting
5. **Performance** - Faster generation with selective sheets
6. **File Size** - Smaller files when selecting fewer sheets

## Backward Compatibility

- Default behavior unchanged (Excel with all sheets)
- Existing API calls work without modification
- New parameters are optional

## Documentation

New documentation added:
- `docs/OUTPUT_FORMATS.md` - Detailed format guide
- Updated `README.md` - Feature highlights
- Updated `docs/API.md` - API parameter documentation

## Testing Recommendations

1. Test each output format independently
2. Test Excel with different sheet combinations
3. Verify file extensions are correct
4. Check JSON structure is valid
5. Verify text output is complete
6. Test with password-protected PDFs
7. Test with various CAS PDF formats

## Future Enhancements

Potential future additions:
- CSV format option
- PDF report generation
- Email delivery of reports
- Scheduled extractions
- Batch processing
- Custom sheet templates

---

## Latest Updates (Version 1.2.0 - November 24, 2025)

### Scheme Name Extraction Enhancement

**What Changed:**
- Scheme names are now extracted directly from the ISIN line in the JSON data
- More reliable and consistent extraction method

**Technical Details:**
```javascript
// New extraction pattern in extractISINInfo()
const schemeMatch = isinLine.match(/^(.+?)\s*-\s*ISIN:/);
if (schemeMatch) {
  schemeName = schemeMatch[1].trim();
}
```

**Example:**
- **Input**: `"128AFGPG-Axis Focused Fund - Regular Growth - ISIN: INF846K01CH7(Advisor: ARN-111569) Registrar : KFINTECH"`
- **Output**: `"128AFGPG-Axis Focused Fund - Regular Growth"`

**Benefits:**
- More accurate scheme name extraction
- Handles multi-line ISIN data better
- Consistent naming across all output formats
- Eliminates dependency on external text files

### Administrative Transaction Handling

**What Changed:**
- Added `isAdministrative` field to transaction objects
- Proper identification of administrative transactions

**Transaction Types Identified:**
- Stamp Duty
- STT Paid (Securities Transaction Tax)
- Other administrative transactions marked with `***`

**Technical Details:**
```javascript
// In parseTransactions()
const isAdministrative = 
  transactionType === 'Stamp Duty' || 
  transactionType === 'STT Paid' || 
  transactionType === 'Administrative' ||
  restOfLine.includes('***');

transactions.push({
  // ... other fields
  isAdministrative  // NEW FIELD
});
```

**Benefits:**
- Better transaction categorization
- Easier filtering of administrative vs. investment transactions
- Improved data analysis capabilities
- Clearer reporting in Excel and JSON outputs

**JSON Output Example:**
```json
{
  "date": "18-Aug-2023",
  "amount": 15.00,
  "nav": null,
  "units": null,
  "transactionType": "Stamp Duty",
  "unitBalance": null,
  "description": "***Stamp Duty",
  "isAdministrative": true
}
```

### Impact on Outputs

**Excel Format:**
- Scheme names now accurately reflect the full scheme name from ISIN line
- Administrative transactions properly classified in Transaction Type column

**JSON Format:**
- `schemeName` field contains accurate scheme name
- `isAdministrative` field available for filtering and analysis

**Text Format:**
- No changes (raw text extraction remains the same)

---

**Version**: 1.2.0  
**Date**: November 24, 2025  
**Status**: ✅ Implemented and Tested
