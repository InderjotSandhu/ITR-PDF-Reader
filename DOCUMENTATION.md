# ITR Complete - Complete Documentation

> **One comprehensive guide for everything you need to know about ITR_Complete**

**Version**: 1.6.0  
**Last Updated**: November 29, 2025

---

## 📑 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Using the Application](#using-the-application)
5. [Features](#features)
6. [Filtering and Search](#filtering-and-search)
7. [Output Formats](#output-formats)
8. [API Documentation](#api-documentation)
9. [Architecture](#architecture)
10. [File Structure](#file-structure)
11. [Commands Reference](#commands-reference)
12. [Troubleshooting](#troubleshooting)
13. [Development](#development)
14. [Testing](#testing)
15. [Contributing](#contributing)

---

## 🚀 Quick Start

### For First-Time Users

**3 Simple Steps:**

1. **Install Dependencies** (2 minutes)
   ```bash
   # Windows
   install.bat
   
   # Or manually
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start Servers** (30 seconds)
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

3. **Use Application** (1 minute)
   - Open http://localhost:3000
   - Upload CAS PDF
   - Filter and search transactions (optional)
   - Download Excel report

**That's it!** 🎉

---

## 📦 Installation

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) - Comes with Node.js
- **Git** (optional) - For cloning the repository

### Installation Methods

#### Method 1: Automated (Windows)
```bash
install.bat
```

#### Method 2: Manual
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

**Output:**
```
🚀 ITR Complete Backend Server
📡 Server running on http://localhost:5000
✅ Health check: http://localhost:5000/health
📊 API endpoint: http://localhost:5000/api/extract-cas
```

### Start Frontend Server

```bash
cd frontend
npm start
```

**Output:**
```
Compiled successfully!
You can now view itr-complete-frontend in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Verification Checklist

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ No error messages in terminals
- ✅ Browser opens automatically to http://localhost:3000

---

## 💻 Using the Application

### Step-by-Step Usage

1. **Open Browser**
   - Navigate to http://localhost:3000

2. **Upload PDF**
   - Drag & drop your CAS PDF file
   - Or click to browse and select

3. **Enter Password** (if needed)
   - If PDF is password-protected
   - Enter password and click show/hide to verify

4. **Select Output Format** (optional)
   - Excel (default) - Professional report
   - JSON - For API integration
   - Text - Raw extracted data

5. **Choose Excel Sheets** (if Excel selected)
   - Portfolio Summary
   - Transactions
   - MF Holdings
   - Or select all (default)

6. **Extract Data**
   - Click "Extract & Generate Excel"
   - Watch real-time progress
   - Wait for completion

7. **Filter and Search** (optional, NEW in v1.5.0)
   - Use search bar to find specific schemes
   - Apply date range filter for specific time periods
   - Select transaction types to filter
   - Choose folio number to view specific accounts
   - Set amount range to find transactions by value
   - Combine multiple filters for precise analysis
   - View and remove active filters using tags

8. **Download Report**
   - File downloads automatically (filtered or complete data)
   - Check your Downloads folder

### Tips for Best Results

- ✅ Use valid CAS PDF from your mutual fund provider
- ✅ Ensure PDF is not corrupted
- ✅ File size should be under 10MB
- ✅ Check password before uploading
- ✅ Wait for extraction to complete

---

## ✨ Features

### Core Features

#### 1. PDF Upload
- **Drag & Drop**: Easy file selection
- **Click to Browse**: Traditional file picker
- **File Validation**: Only PDF files accepted
- **Size Limit**: 10MB maximum

#### 2. Password Support
- **Protected PDFs**: Handle encrypted files
- **Show/Hide Password**: Toggle visibility
- **Validation**: Immediate feedback on incorrect password

#### 3. Multiple Output Formats
- **Excel**: Professional formatted reports
- **JSON**: Complete structured data
- **Text**: Raw extracted content

#### 4. Excel Sheet Selection
- **Portfolio Summary**: Fund-wise overview
- **Transactions**: Complete history
- **MF Holdings**: Current positions
- **Custom Selection**: Choose what you need

#### 5. Real-time Progress
- **Progress Bar**: Visual feedback
- **Status Messages**: Know what's happening
- **Percentage**: 0-100% completion

### Latest Improvements (v1.6.0)

#### 1. Financial Transaction Classification
**What**: Transactions are now properly classified by type instead of using raw descriptions

**Benefits**:
- Transaction Type Filter works correctly for all types
- Standardized categories: Purchase, Systematic Investment, Redemption, Switch-Out, Switch-In, Dividend
- Better data accuracy and filtering capabilities

**Example**:
```
Before: Transaction Type = "*Switch-Out - To ABSL Small Cap Fund Growth"
After:  Transaction Type = "Switch-Out"
        Description = "*Switch-Out - To ABSL Small Cap Fund Growth"
```

#### 2. Scheme Name Display
**What**: Transaction table now displays scheme names correctly

**Fix**: Corrected data path from `fund.schemeName` to `folio.schemeName`

**Impact**:
- Scheme column now shows actual fund names
- Scheme-based filtering works properly
- Better transaction context and analysis

#### 3. UI Layout Improvements
**What**: Multiple UI enhancements for better usability

**Improvements**:
- Wider transaction table (1600px max-width) for more data visibility
- Optimized filter sidebar (280px) for better space utilization
- Fixed date range filter duplicate "to" text
- Fixed scheme name overflow in filter tags
- Fixed search bar overflow issues
- Fixed search bar clear button alignment

**Impact**:
- More professional appearance
- Better use of screen space
- Improved readability and usability
- All elements fit properly within their containers

---

### Advanced Features (v1.4.0)

#### 1. Credit/Debit Amount Split
**What**: Separate columns for money in vs money out

**Benefits**:
- Clear visualization of cash flow
- Easy accounting reconciliation
- Better financial analysis

**Example**:
```
Old: Amount of Transaction: -50,000
New: Credit Amount: (empty)
     Debit Amount: 50,000
```

#### 2. Multi-line Description Support
**What**: Correctly extracts descriptions spanning multiple lines

**Example**:
```
PDF Format:
27-Sep-2023 (50,000.00) 23.4671 (2,130.664)
*Switch-Out - To ABSL Small Cap Fund Growth, less STT

Extracted:
Description: *Switch-Out - To ABSL Small Cap Fund Growth, less STT
```

#### 3. Transaction Type Cleaning
**What**: Removes unnecessary symbols for cleaner display

**Examples**:
- `***STT Paid***` → `STT Paid`
- `*Switch-Out - To Fund` → `Switch-Out - To Fund`
- `***Address Updated***` → `Address Updated`

#### 4. DIRECT Advisor Support
**What**: Handles both ARN codes and DIRECT plans

**Supported Formats**:
- `ARN-123456`
- `DIRECT`
- `(Advisor: ARN-123456)`
- `Advisor: DIRECT`

#### 5. Administrative Transaction Flag
**What**: `isAdministrative` field in JSON output

**Usage**:
```javascript
// Filter only financial transactions
const financial = transactions.filter(tx => !tx.isAdministrative);

// Filter only administrative transactions
const admin = transactions.filter(tx => tx.isAdministrative);
```

---

## 🔍 Filtering and Search

### Overview

The Advanced Filtering and Search feature (v1.5.0) allows you to interactively filter and search through extracted transaction data before exporting. This enables focused analysis and reduces the need for post-processing in Excel.

### Filter Types

#### 1. Search Bar

**Purpose**: Find transactions by scheme name

**How to Use**:
1. Type scheme name in the search box
2. Results update automatically (300ms debounce)
3. Search is case-insensitive
4. Matches partial scheme names

**Example**:
- Search "HDFC" → Shows all HDFC fund transactions
- Search "equity" → Shows all equity fund transactions

**Features**:
- Real-time search with debouncing
- Case-insensitive matching
- Substring matching (finds "HDFC" in "HDFC Equity Fund")
- Clear button to reset search

#### 2. Date Range Filter

**Purpose**: View transactions within a specific time period

**How to Use**:
1. Select start date (optional)
2. Select end date (optional)
3. Filter applies automatically
4. Clear to reset

**Validation**:
- End date must be after start date
- Error message displays for invalid ranges
- Both dates are inclusive

**Use Cases**:
- View transactions for a financial year
- Analyze quarterly performance
- Find transactions in a specific month

#### 3. Transaction Type Filter

**Purpose**: Filter by transaction category

**How to Use**:
1. Check one or more transaction types
2. Results show transactions matching ANY selected type
3. Uncheck all to show all transactions

**Available Types**:
- Purchase
- Redemption
- SIP (Systematic Investment Plan)
- Switch-In
- Switch-Out
- Dividend
- And more (based on your data)

**Features**:
- Multi-select support
- "Select All" / "Deselect All" options
- Shows only types present in your data

#### 4. Folio Filter

**Purpose**: View transactions for a specific investment account

**How to Use**:
1. Select folio number from dropdown
2. View transactions for that folio only
3. Select "All Folios" to reset

**Features**:
- Dropdown shows all unique folio numbers
- Easy switching between accounts
- Clear indication of selected folio

**Use Cases**:
- Track specific investment account
- Separate family member accounts
- Analyze individual portfolio performance

#### 5. Amount Range Filter

**Purpose**: Find transactions within specific amount ranges

**How to Use**:
1. Enter minimum amount (optional)
2. Enter maximum amount (optional)
3. Filter applies automatically

**Validation**:
- Only numeric values accepted
- Maximum must be greater than minimum
- Error messages for invalid input

**Use Cases**:
- Find large transactions (>₹50,000)
- Find small transactions (<₹10,000)
- Identify transactions in specific range

**Examples**:
- Min: 10000, Max: 50000 → Shows transactions between ₹10,000 and ₹50,000
- Min: 100000, Max: (empty) → Shows transactions ≥ ₹100,000
- Min: (empty), Max: 5000 → Shows transactions ≤ ₹5,000

### Combining Filters

**Multi-Filter Support**: All filters work together with AND logic

**Example Scenario**:
```
Search: "HDFC"
Date Range: Jan 2024 - Mar 2024
Transaction Type: Purchase, SIP
Amount Range: Min ₹5,000

Result: Shows HDFC fund purchases and SIPs 
        between Jan-Mar 2024 with amount ≥ ₹5,000
```

**Filter Behavior**:
- Adding filters narrows results (fewer transactions)
- Removing filters expands results (more transactions)
- All filters must match (AND logic)

### Active Filters

**Visual Indicators**: See which filters are currently applied

**Features**:
- Filter tags show name and value
- Click × to remove individual filter
- Total count of active filters displayed
- "Clear All Filters" button to reset everything

**Example Display**:
```
Active Filters (3):
[Date: Jan-Mar 2024 ×] [Type: Purchase ×] [Amount: >5000 ×]
```

### Filter Results

**Result Display**:
- Shows count: "Showing X of Y transactions"
- Updates in real-time as filters change
- Empty state: "No transactions match your filters"

**Performance**:
- Filters apply in <100ms for <1000 transactions
- Filters apply in <500ms for <10,000 transactions
- Virtual scrolling for large datasets
- Smooth, responsive UI

### Exporting Filtered Data

**How It Works**:
1. Apply your desired filters
2. Click export button
3. Only filtered transactions are exported
4. Filter metadata included in export

**Export Formats**:
- **Excel**: Filtered transactions in all sheets
- **JSON**: Filtered data with filter metadata
- **Text**: Filtered raw data

**Filter Metadata** (in JSON/Excel):
```json
{
  "filterMetadata": {
    "appliedAt": "2025-11-29T10:30:00.000Z",
    "filters": {
      "dateRange": "01-Jan-2024 to 31-Mar-2024",
      "transactionTypes": ["Purchase", "SIP"],
      "searchQuery": "HDFC",
      "amountRange": "Min: 5000"
    },
    "originalCount": 1234,
    "filteredCount": 45
  }
}
```

### Tips for Effective Filtering

1. **Start Broad, Then Narrow**
   - Begin with one filter
   - Add more filters to refine results
   - Remove filters that are too restrictive

2. **Use Search for Quick Finds**
   - Fastest way to find specific schemes
   - Combine with other filters for precision

3. **Date Ranges for Time Analysis**
   - Financial year: Apr 1 - Mar 31
   - Quarterly: 3-month periods
   - Monthly: First to last day of month

4. **Amount Ranges for Value Analysis**
   - Large transactions: Min ₹50,000
   - Small transactions: Max ₹10,000
   - Mid-range: ₹10,000 - ₹50,000

5. **Transaction Types for Category Analysis**
   - Investments: Purchase + SIP
   - Withdrawals: Redemption + Switch-Out
   - Income: Dividend

### Keyboard Shortcuts

- **Tab**: Navigate between filter controls
- **Enter**: Apply filter (in input fields)
- **Escape**: Clear search (when focused)

### Troubleshooting Filters

#### Issue: "No results found"
**Solutions**:
- Check if filters are too restrictive
- Remove one filter at a time
- Verify date range is correct
- Check amount range values

#### Issue: "Invalid date range"
**Solution**:
- Ensure end date is after start date
- Check date format is correct
- Clear and re-enter dates

#### Issue: "Invalid amount range"
**Solution**:
- Enter only numeric values
- Ensure max is greater than min
- Remove commas or currency symbols

#### Issue: Filters not applying
**Solution**:
- Refresh the page
- Re-upload PDF and extract
- Check browser console for errors

#### Issue: Slow performance
**Solution**:
- Reduce number of active filters
- Use more specific filters
- Close other browser tabs
- For very large datasets (>10,000 transactions), filtering may take a few seconds

---

## 📊 Output Formats

### 1. Excel Format (.xlsx)

#### Sheet 1: Portfolio Summary
| Column | Description |
|--------|-------------|
| Mutual Fund | Fund house name |
| Cost Value (INR) | Total investment |
| Market Value (INR) | Current value |

#### Sheet 2: Transactions
| Column | Description |
|--------|-------------|
| Folio Number | Folio identifier |
| Scheme Name | Fund scheme name |
| ISIN | 12-character code |
| Date of Transaction | DD-MMM-YYYY format |
| Transaction Type | Cleaned type (symbols removed) |
| **Credit Amount** | Positive transactions (Purchase, SIP) |
| **Debit Amount** | Negative transactions (Redemption, Switch-Out) |
| NAV (Price per Unit) | 4 decimal precision |
| Units Transacted | 4 decimal precision |
| Unit Balance | Running balance |

#### Sheet 3: MF Holdings
| Column | Description |
|--------|-------------|
| Folio Number | Folio identifier |
| Scheme Name | Fund scheme name |
| ISIN | 12-character code |
| Opening Unit Balance | Starting balance |
| Closing Unit Balance | Ending balance |
| NAV | Current NAV |
| Total Cost Value | Total investment |
| Market Value | Current value |
| Advisor | ARN code or DIRECT |
| PAN | Investor PAN |

### 2. JSON Format (.json)

**Structure**:
```json
{
  "metadata": {
    "extractedAt": "2025-11-28T10:30:00.000Z",
    "sourceFile": "CAS_Report.pdf",
    "summary": {
      "totalFunds": 17,
      "totalFolios": 130,
      "totalTransactions": 4956
    }
  },
  "portfolioData": {
    "portfolioSummary": [...],
    "total": {...}
  },
  "transactionData": {
    "funds": [...]
  }
}
```

**Transaction Object**:
```json
{
  "date": "27-Sep-2023",
  "amount": -50000,
  "nav": 23.4671,
  "units": -2130.664,
  "transactionType": "Switch-Out - To ABSL Small Cap Fund",
  "unitBalance": 10740.804,
  "description": "*Switch-Out - To ABSL Small Cap Fund",
  "isAdministrative": false
}
```

### 3. Text Format (.txt)

Raw extracted text from PDF for:
- Custom parsing
- Text analysis
- Debugging

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Extract CAS Data
```
POST /api/extract-cas
```

**Request**:
```javascript
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('password', 'optional-password');
formData.append('outputFormat', 'excel'); // or 'json', 'text'
formData.append('sheets', JSON.stringify(['portfolio', 'transactions', 'holdings']));

fetch('http://localhost:5000/api/extract-cas', {
  method: 'POST',
  body: formData
});
```

**Response**: Excel/JSON/Text file

#### 2. Health Check
```
GET /health
```

**Response**:
```json
{
  "status": "OK",
  "message": "ITR Complete Backend is running"
}
```

#### 3. Service Status
```
GET /api/status
```

**Response**:
```json
{
  "status": "ready",
  "message": "CAS extraction service is ready",
  "timestamp": "2025-11-28T10:30:00.000Z"
}
```

### Error Responses

| Code | Message | Solution |
|------|---------|----------|
| 400 | No file uploaded | Include PDF in request |
| 400 | Only PDF files allowed | Upload PDF file only |
| 400 | PDF is password protected | Provide password |
| 400 | Incorrect password | Check password |
| 500 | No portfolio data found | Ensure valid CAS PDF |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────┐
│         React Frontend (Port 3000)       │
│  - PDF Upload UI                         │
│  - Progress Tracking                     │
│  - File Download                         │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────────┐
│      Node.js Backend (Port 5000)         │
│  ┌────────────────────────────────────┐ │
│  │  1. PDF Extractor                  │ │
│  │  2. Portfolio Extractor            │ │
│  │  3. Transaction Extractor          │ │
│  │  4. Excel Generator                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- React 18
- Axios
- CSS3

**Backend**:
- Node.js
- Express
- Multer (file upload)
- pdf-parse (PDF extraction)
- ExcelJS (Excel generation)

---

## 📁 File Structure

```
ITR_Complete/
├── README.md                   # Main documentation
├── DOCUMENTATION.md            # This file (complete guide)
├── CHANGELOG.md                # Version history
│
├── backend/                    # Backend server
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   ├── src/
│   │   ├── extractors/        # Extraction modules
│   │   │   ├── pdfExtractor.js
│   │   │   ├── portfolioExtractor.js
│   │   │   ├── transactionExtractor.js
│   │   │   └── excelGenerator.js
│   │   ├── routes/            # API routes
│   │   │   └── casRoutes.js
│   │   └── middleware/        # Middleware
│   │       └── upload.js
│   ├── uploads/               # Temporary PDF storage
│   └── output/                # Generated reports
│
├── frontend/                   # React frontend
│   ├── package.json           # Dependencies
│   ├── public/                # Static files
│   └── src/
│       ├── App.js            # Main component
│       ├── App.css           # Styles
│       ├── components/       # React components
│       │   ├── filters/      # Filter components (NEW v1.5.0)
│       │   │   ├── FilterPanel.js
│       │   │   ├── SearchBar.js
│       │   │   ├── DateRangeFilter.js
│       │   │   ├── TransactionTypeFilter.js
│       │   │   ├── FolioFilter.js
│       │   │   ├── AmountRangeFilter.js
│       │   │   └── ActiveFilters.js
│       │   └── table/        # Table components (NEW v1.5.0)
│       │       └── TransactionTable.js
│       ├── context/          # React context (NEW v1.5.0)
│       │   └── FilterContext.js
│       ├── utils/            # Utility functions (NEW v1.5.0)
│       │   ├── filterUtils.js
│       │   └── filterMetadata.js
│       └── types/            # Type definitions (NEW v1.5.0)
│           └── filters.js
│
└── docs/                      # Additional documentation
    ├── API.md                # Detailed API docs
    ├── ARCHITECTURE.md       # System design
    └── OUTPUT_FORMATS.md     # Format specs
```

---

## 🎮 Commands Reference

### Backend Commands

```bash
# Start server
npm start

# Run tests
npm test

# Run specific test
npm test -- transactionExtractor.test.js

# Run with coverage
npm test -- --coverage
```

### Frontend Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Port 5000 already in use"
**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/server.js
```

#### Issue: "Port 3000 already in use"
**Solution**:
```bash
# Kill process or use different port
# Frontend will prompt to use different port
```

#### Issue: "No portfolio data found"
**Causes**:
- Invalid CAS PDF
- Corrupted file
- Wrong file format

**Solution**:
- Verify PDF is from mutual fund provider
- Try opening PDF manually
- Check file size and integrity

#### Issue: "Incorrect password"
**Solution**:
- Copy-paste password to avoid typos
- Check for extra spaces
- Verify password with PDF reader

#### Issue: "Module not found"
**Solution**:
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install
```

#### Issue: "Excel file won't open"
**Solution**:
- Ensure Excel/LibreOffice is installed
- Check file isn't corrupted
- Try opening with Google Sheets

#### Issue: "Filters not working"
**Solution**:
- Ensure data is extracted first
- Refresh the page and try again
- Check browser console for errors
- Clear browser cache

#### Issue: "Filtered export contains all data"
**Solution**:
- Verify filters are applied (check active filter tags)
- Ensure you see filtered count before exporting
- Try applying filters again
- Check that filter values are valid

#### Issue: "Search not finding transactions"
**Solution**:
- Check spelling of scheme name
- Try partial name (e.g., "HDFC" instead of full name)
- Search is case-insensitive, but check for typos
- Ensure transactions exist with that scheme name

#### Issue: "Date filter showing wrong results"
**Solution**:
- Verify date format is correct
- Check that end date is after start date
- Ensure dates are within your data range
- Clear and re-apply date filter

---

## 👨‍💻 Development

### Setting Up Development Environment

1. **Clone Repository**
   ```bash
   git clone https://github.com/InderjotSandhu/ITR-PDF-Reader.git
   cd ITR-PDF-Reader
   ```

2. **Install Dependencies**
   ```bash
   install.bat
   ```

3. **Start Development**
   ```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2
   cd frontend && npm start
   ```

### Project Structure Explained

**Backend Extractors**:
- `pdfExtractor.js` - Extracts text from PDF
- `portfolioExtractor.js` - Parses portfolio summary
- `transactionExtractor.js` - Extracts transactions (most complex)
- `excelGenerator.js` - Generates Excel reports

**Key Functions**:
- `extractISINInfo()` - Extracts scheme names, ISIN, advisor
- `parseTransactions()` - Parses transaction data
- `classifyTransactionType()` - Classifies transaction types
- `cleanTransactionType()` - Removes symbols

### Making Changes

1. **Make your changes**
2. **Test locally**
3. **Run tests**: `npm test`
4. **Commit**: `git commit -m "Description"`
5. **Push**: `git push`

---

## 🧪 Testing

### Test Structure

- **70+ Unit Tests** - Core functionality and filtering
- **59 Property-Based Tests** - 5,900+ generated cases
- **16 Integration Tests** - Full pipeline

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- transactionExtractor.test.js

# Run property-based tests
npm test -- transactionExtractor.property.test.js

# Run with coverage
npm test -- --coverage

# Silent mode
npm test -- --silent
```

### Test Files

**Backend Tests**:
- `transactionExtractor.test.js` - Unit tests
- `transactionExtractor.property.test.js` - Property-based tests
- `transactionExtractor.integration.test.js` - Integration tests
- `casRoutes.test.js` - API route tests

**Frontend Tests** (NEW v1.5.0):
- `filterUtils.test.js` - Filter logic unit tests
- `FilterContext.test.js` - Context unit tests
- `SearchBar.test.js` - Search component tests
- `DateRangeFilter.test.js` - Date filter tests
- `TransactionTypeFilter.test.js` - Type filter tests
- `FolioFilter.test.js` - Folio filter tests
- `AmountRangeFilter.test.js` - Amount filter tests
- `ActiveFilters.test.js` - Active filters tests
- `FilterPanel.test.js` - Filter panel tests
- `TransactionTable.test.js` - Table component tests
- `exportProperties.test.js` - Export property tests

---

## 🤝 Contributing

### How to Contribute

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/AmazingFeature`
3. **Make changes**
4. **Run tests**: `npm test`
5. **Commit**: `git commit -m 'Add AmazingFeature'`
6. **Push**: `git push origin feature/AmazingFeature`
7. **Open Pull Request**

### Contribution Guidelines

- Write clear commit messages
- Add tests for new features
- Update documentation
- Follow existing code style
- Test thoroughly before submitting

---

## 📞 Support

### Getting Help

1. **Check this documentation**
2. **Review troubleshooting section**
3. **Check GitHub issues**
4. **Open new issue** with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Useful Links

- **GitHub**: https://github.com/InderjotSandhu/ITR-PDF-Reader
- **Issues**: https://github.com/InderjotSandhu/ITR-PDF-Reader/issues
- **Changelog**: See CHANGELOG.md

---

## 📝 Additional Resources

### Documentation Files

- **README.md** - Quick overview and getting started
- **DOCUMENTATION.md** - This file (complete guide)
- **CHANGELOG.md** - Version history and changes
- **docs/API.md** - Detailed API documentation
- **docs/ARCHITECTURE.md** - System architecture details
- **docs/OUTPUT_FORMATS.md** - Output format specifications

### External Resources

- **Node.js**: https://nodejs.org/
- **React**: https://reactjs.org/
- **Express**: https://expressjs.com/
- **ExcelJS**: https://github.com/exceljs/exceljs

---

**Made with ❤️ by Inderjot Sandhu**

**Version**: 1.6.0  
**Last Updated**: November 29, 2025
