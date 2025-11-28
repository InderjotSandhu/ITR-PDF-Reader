# 📊 ITR Complete - CAS Data Extractor

A comprehensive full-stack application for extracting and analyzing Consolidated Account Statement (CAS) data from mutual fund PDFs.

## 🌟 Features

### Frontend (React)
- 📄 **PDF Upload** - Drag & drop or click to upload
- 🔐 **Password Protection** - Handle password-protected PDFs
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode
- 📱 **Mobile Friendly** - Works on all devices
- ⚡ **Real-time Progress** - Live extraction status updates
- 📊 **Multiple Output Formats** - Excel, JSON, or Text
- ⚙️ **Customizable Excel Sheets** - Select which sheets to generate

### Backend (Node.js)
- 🔍 **Advanced Extraction** - Multi-pattern data extraction with fallbacks
- 📊 **Comprehensive Data** - Extract portfolio, transactions, and holdings
- ✅ **Data Validation** - Built-in validation and quality checks
- 📈 **Flexible Output** - Excel, JSON, or Text formats
- 🎯 **Sheet Selection** - Generate only the sheets you need
- 🛡️ **Error Handling** - Robust error handling and logging

### Data Extraction
- **Portfolio Summary** - Overview by fund house with cost and market values
- **Transactions** - Complete transaction history with:
  - Transaction Date & Type (SIP, Purchase, Redemption, etc.)
  - Amount, NAV (4 decimal precision)
  - Units Transacted (4 decimal precision)
  - Unit Balance (running balance)
  - Administrative transaction handling (Stamp Duty, STT Paid)
- **MF Holdings** - Current holdings with:
  - Opening/Closing Unit Balance
  - NAV, Cost Value, Market Value
  - Folio details (PAN, ISIN, Advisor, Registrar)
  - Scheme names extracted directly from ISIN line

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd ITR_Complete
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```
   Backend will run on `http://localhost:5000`

2. **Start the frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```
   Frontend will open at `http://localhost:3000`

3. **Upload your CAS PDF**
   - Open `http://localhost:3000` in your browser
   - Upload your CAS PDF file
   - Enter password if required
   - Choose output format (Excel, JSON, or Text)
   - For Excel: Select which sheets to generate
   - Click "Extract & Generate"
   - Download the generated file

## 📁 Project Structure

```
ITR_Complete/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── extractors/        # Data extraction modules
│   │   │   ├── pdfExtractor.js
│   │   │   ├── portfolioExtractor.js
│   │   │   ├── transactionExtractor.js
│   │   │   └── excelGenerator.js
│   │   ├── routes/            # API routes
│   │   │   └── casRoutes.js
│   │   ├── middleware/        # Express middleware
│   │   │   └── upload.js
│   │   └── utils/             # Utility functions
│   │       └── validators.js
│   ├── uploads/               # Temporary PDF storage
│   ├── output/                # Generated Excel files
│   ├── server.js              # Express server
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PDFUploader.js
│   │   │   ├── PDFUploader.css
│   │   │   └── ProgressBar.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
├── docs/                       # Documentation
│   ├── API.md                 # API documentation
│   ├── ARCHITECTURE.md        # Architecture overview
│   └── DEPLOYMENT.md          # Deployment guide
│
└── README.md                   # This file
```

## 🔧 Configuration

### Backend Configuration
Edit `backend/server.js` to configure:
- Port (default: 5000)
- Upload limits
- CORS settings

### Frontend Configuration
Edit `frontend/src/config.js` to configure:
- API endpoint
- Upload settings

## 📊 Output Formats

### Excel Format (Default)
Professional spreadsheet with customizable sheets:

**Sheet 1: Portfolio Summary**
- Mutual Fund Name
- Cost Value (INR)
- Market Value (INR)

**Sheet 2: Transactions**
- Folio Number, Scheme Name, ISIN
- Date of Transaction, Transaction Type
- Amount of Transaction
- NAV (Price per Unit) - 4 decimals
- Units Transacted - 4 decimals
- Unit Balance - 4 decimals

**Sheet 3: MF Holdings**
- Folio Number, Scheme Name, ISIN
- Opening/Closing Unit Balance
- NAV, Total Cost Value, Market Value
- Advisor, PAN

**Sheet Selection:** Choose to generate all sheets or select specific ones based on your needs.

### JSON Format
Complete structured data including:
- Metadata (extraction timestamp, source file, summary)
- Portfolio data (all funds and values)
- Transaction data (all transactions with details)
- Raw extracted text

Perfect for programmatic access and integration with other systems.

### Text Format
Raw extracted text from the PDF for:
- Custom parsing
- Text analysis
- Debugging extraction issues

See `docs/OUTPUT_FORMATS.md` for detailed format documentation.

## 🎯 Key Features

### Advanced Extraction
- **Multi-pattern matching** with fallback strategies
- **ISIN validation** (12-character format)
- **PAN extraction** with validation
- **Transaction classification** (SIP, Purchase, Redemption, etc.)
- **Administrative transaction detection** (Stamp Duty, STT Paid, etc.)
- **Scheme name extraction** directly from ISIN line
- **Numeric parsing** with comma and parentheses handling

### Data Quality
- **Validation checks** for all extracted data
- **Quality reports** showing missing/invalid data
- **Extraction summary** with counts and statistics
- **Error logging** for debugging

### User Experience
- **Drag & drop** file upload
- **Password support** for protected PDFs
- **Real-time progress** updates
- **Dark mode** toggle
- **Responsive design** for all devices

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Run with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Run with hot reload
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 API Documentation

### POST /api/extract-cas
Upload and extract CAS PDF data

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `pdf`: PDF file (required)
  - `password`: PDF password (optional)
  - `outputFormat`: 'excel' | 'json' | 'text' (optional, default: 'excel')
  - `sheets`: JSON array of sheet names (optional, default: all sheets)
    - Example: `["portfolio", "transactions", "holdings"]`

**Response:**
- Success: File download (Excel, JSON, or Text)
- Error: JSON with error message

**Examples:**
```javascript
// Excel with selected sheets
formData.append('outputFormat', 'excel');
formData.append('sheets', JSON.stringify(['portfolio', 'holdings']));

// JSON output
formData.append('outputFormat', 'json');

// Text output
formData.append('outputFormat', 'text');
```

See `docs/API.md` and `docs/OUTPUT_FORMATS.md` for complete documentation.

## 🚀 Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve frontend from backend**
   ```bash
   cd backend
   npm start
   ```

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 🐛 Troubleshooting

### Common Issues

1. **"Port already in use"**
   - Change port in `backend/server.js`
   - Or kill the process using the port

2. **"No CAS data found"**
   - Ensure PDF is a valid CAS document
   - Check if PDF is password-protected

3. **"CORS error"**
   - Ensure backend is running
   - Check CORS configuration in `backend/server.js`

4. **"Upload failed"**
   - Check file size limits
   - Ensure `uploads/` directory exists

## 📄 License

This project is for personal use in analyzing mutual fund investments.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

---

## 🆕 Recent Updates

### Version 1.1.0 (November 24, 2025)

**Scheme Name Extraction Enhancement:**
- Scheme names are now extracted directly from the ISIN line in the JSON data
- Pattern: Everything before " - ISIN:" is captured as the scheme name
- Example: `"128AFGPG-Axis Focused Fund - Regular Growth - ISIN: INF846K01CH7..."` → `"128AFGPG-Axis Focused Fund - Regular Growth"`
- More reliable and consistent scheme name extraction

**Administrative Transaction Handling:**
- Added `isAdministrative` field to identify administrative transactions
- Administrative transactions include: Stamp Duty, STT Paid, and other *** marked transactions
- Proper classification and handling in the extraction pipeline
- Improved transaction type detection for better reporting

---

**Version:** 1.1.0  
**Last Updated:** November 24, 2025  
**Architecture:** React + Node.js + Express + ExcelJS
