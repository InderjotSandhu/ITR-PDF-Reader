# ITR Complete - CAS Data Extractor

> **A comprehensive full-stack application for extracting and analyzing mutual fund data from Consolidated Account Statement (CAS) PDFs**

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/InderjotSandhu/ITR-PDF-Reader)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.0.0-blue.svg)](https://reactjs.org/)

---

## 🚀 Features

### Core Functionality
- 📄 **PDF Upload** - Drag & drop or click to upload CAS PDF files
- 🔐 **Password Support** - Handle password-protected PDFs
- 📊 **Excel Reports** - Generate professional Excel reports with 3 sheets
- 📈 **JSON Export** - Complete data in JSON format for API integration
- 📝 **Text Export** - Raw extracted text for custom processing

### Advanced Features
- ✨ **Credit/Debit Split** - Separate columns for credit and debit transactions
- 🎯 **Multi-line Support** - Correctly extracts descriptions spanning multiple lines
- 🏷️ **Transaction Cleaning** - Removes unnecessary symbols (*** and *) from transaction types
- 🔍 **DIRECT Advisor Support** - Handles both ARN codes and DIRECT plans
- 📋 **Administrative Transactions** - Properly identifies and flags admin transactions
- 🎨 **Dark Mode** - Easy on the eyes interface
- ⚡ **Real-time Progress** - Live extraction progress tracking

### Filtering & Search (NEW in v1.5.0)
- 🔎 **Advanced Search** - Search transactions by scheme name with real-time results
- 📅 **Date Range Filter** - Filter transactions by custom date ranges
- 🏷️ **Transaction Type Filter** - Filter by purchase, redemption, SIP, and more
- 📁 **Folio Filter** - View transactions for specific investment accounts
- 💰 **Amount Range Filter** - Find transactions within specific amount ranges
- 🎯 **Multi-Filter Support** - Combine multiple filters for precise analysis
- 🏷️ **Active Filter Tags** - Visual indicators showing applied filters
- 📤 **Filtered Export** - Export only the data you need with filter metadata

---

## 📸 Screenshots

### Upload Interface
![Upload Interface](docs/screenshots/upload.png)

### Excel Report
![Excel Report](docs/screenshots/excel-report.png)

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Axios** - HTTP client for API calls
- **CSS3** - Animations and responsive design

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **ExcelJS** - Excel file generation

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Quick Install (Windows)
```bash
install.bat
```

### Manual Installation
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🚀 Usage

### Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on: http://localhost:3000

### Using the Application

1. Open http://localhost:3000 in your browser
2. Upload your CAS PDF file (drag & drop or click)
3. Enter password if the PDF is protected
4. Click "Extract & Generate Excel"
5. **Filter and search** through extracted transactions (NEW)
   - Use search bar to find specific schemes
   - Apply date range, transaction type, folio, or amount filters
   - Combine multiple filters for precise analysis
   - View active filters and remove them individually
6. Download the generated Excel report (filtered or complete data)

---

## 📊 Output Formats

### Excel Report (3 Sheets)

#### Sheet 1: Portfolio Summary
- Fund names
- Cost values
- Market values

#### Sheet 2: Transactions
- Folio Number
- Scheme Name
- ISIN
- Date of Transaction
- Transaction Type
- **Credit Amount** (NEW in v1.4.0)
- **Debit Amount** (NEW in v1.4.0)
- NAV (4 decimal precision)
- Units Transacted (4 decimal precision)
- Unit Balance

#### Sheet 3: MF Holdings
- Current holdings
- Folio details
- PAN, ISIN, Advisor info

### JSON Output
Complete structured data with:
- Transaction details
- Portfolio summary
- Metadata
- All extracted fields

---

## 🆕 What's New in v1.5.0

### Advanced Filtering & Search
- **Interactive Data Filtering**: Filter extracted transactions before export
- **Real-time Search**: Search by scheme name with instant results
- **Date Range Filter**: View transactions within specific time periods
- **Transaction Type Filter**: Filter by purchase, redemption, SIP, switch, dividend, etc.
- **Folio Filter**: View transactions for specific investment accounts
- **Amount Range Filter**: Find transactions within min/max amount ranges
- **Multi-Filter Support**: Combine multiple filters with AND logic
- **Active Filter Tags**: Visual indicators with one-click removal
- **Filtered Export**: Export only filtered data with metadata
- **Performance Optimized**: Handles large datasets (1000+ transactions) smoothly

### Previous Updates (v1.4.0)
- **Credit/Debit Amount Split**: Separate columns for credit and debit transactions
- **Multi-line Description Support**: Correctly extracts descriptions spanning multiple lines
- **Transaction Type Cleaning**: Removes `***` and `*` symbols for cleaner display
- **DIRECT Advisor Support**: Handles both `ARN-123456` and `DIRECT` advisor formats

---

## 📖 Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete comprehensive guide
- **[API Documentation](docs/API.md)** - API reference
- **[Architecture](docs/ARCHITECTURE.md)** - System design
- **[Output Formats](docs/OUTPUT_FORMATS.md)** - Format specifications
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

## 🧪 Testing

### Run Tests
```bash
cd backend
npm test
```

### Test Coverage
- **70+ Unit Tests** - Core functionality and filtering
- **59 Property-Based Tests** - 5,900+ generated test cases
- **16 Integration Tests** - Full pipeline validation

---

## 📁 Project Structure

```
ITR_Complete/
├── backend/                    # Backend server
│   ├── src/
│   │   ├── extractors/        # PDF, Portfolio, Transaction, Excel
│   │   ├── routes/            # API routes
│   │   └── middleware/        # Upload middleware
│   ├── uploads/               # Temporary PDF storage
│   └── output/                # Generated reports
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   └── App.js            # Main app
│   └── public/               # Static assets
├── docs/                      # Documentation
└── .kiro/                     # Kiro IDE specs
```

---

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
```

### Frontend
Runs on port 3000 by default.

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "No portfolio data found"**
- Ensure the PDF is a valid CAS document
- Check if the PDF is corrupted

**Issue: "Incorrect password"**
- Verify the password is correct
- Try copying the password to avoid typos

**Issue: "Port already in use"**
- Kill the process using the port
- Or change the port in configuration

For more troubleshooting, see [DOCUMENTATION.md](DOCUMENTATION.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Inderjot Sandhu**
- GitHub: [@InderjotSandhu](https://github.com/InderjotSandhu)

---

## 🙏 Acknowledgments

- Built with React and Node.js
- PDF extraction powered by pdf-parse
- Excel generation using ExcelJS
- Property-based testing with fast-check

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [documentation](DOCUMENTATION.md)
- Review [troubleshooting guide](DOCUMENTATION.md#troubleshooting)

---

## 🗺️ Roadmap

- [ ] Support for multiple CAS formats
- [x] Advanced filtering and search (v1.5.0)
- [ ] Data visualization dashboard
- [ ] Export to other formats (CSV, PDF)
- [ ] Batch processing support
- [ ] Saved filter presets
- [ ] Column sorting and custom views

---

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ by Inderjot Sandhu**

