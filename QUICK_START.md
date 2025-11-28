# 🚀 Quick Start Guide - ITR Complete

Get up and running in 5 minutes!

## Prerequisites

- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd ITR_Complete/backend
npm install
```

This will install:
- express (web server)
- cors (cross-origin support)
- multer (file uploads)
- pdf-parse (PDF extraction)
- exceljs (Excel generation)

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- react (UI framework)
- react-dom (React rendering)
- axios (HTTP client)
- react-scripts (build tools)

## Running the Application

### Terminal 1: Start Backend Server

```bash
cd ITR_Complete/backend
npm start
```

You should see:
```
🚀 ITR Complete Backend Server
📡 Server running on http://localhost:5000
✅ Health check: http://localhost:5000/health
📊 API endpoint: http://localhost:5000/api/extract-cas
```

### Terminal 2: Start Frontend

```bash
cd ITR_Complete/frontend
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

## Using the Application

1. **Upload PDF**
   - Drag & drop your CAS PDF file
   - Or click "Browse Files" to select

2. **Enter Password** (if needed)
   - If your PDF is password-protected, enter the password

3. **Extract Data**
   - Click "🚀 Extract & Generate Excel"
   - Wait for processing (usually 10-30 seconds)

4. **Download Excel**
   - Excel file will automatically download
   - Contains 3 sheets: Portfolio Summary, Transactions, MF Holdings

## Troubleshooting

### Backend won't start
- **Error: "Port 5000 already in use"**
  - Solution: Kill the process using port 5000 or change port in `backend/server.js`

### Frontend won't start
- **Error: "Port 3000 already in use"**
  - Solution: The terminal will ask if you want to use another port, type 'Y'

### Cannot connect to server
- **Error: "Cannot connect to server"**
  - Solution: Ensure backend is running on port 5000
  - Check: Visit `http://localhost:5000/health` in browser

### Upload fails
- **Error: "No CAS data found"**
  - Solution: Ensure you're uploading a valid CAS PDF
  - Check: PDF should be from CAMS or Karvy

### Password errors
- **Error: "Incorrect password"**
  - Solution: Double-check your password
  - Tip: Try typing it manually instead of copy-paste

## Testing with Sample Data

If you don't have a CAS PDF handy:
1. Download a sample CAS from your mutual fund provider
2. Or use the test PDF in `ITR2/input/` folder (if available)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API.md](docs/API.md) for API documentation
- See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design

## Need Help?

- Check the [Troubleshooting](#troubleshooting) section above
- Review the console logs in both terminals
- Ensure all dependencies are installed correctly

---

**Congratulations! You're ready to extract CAS data! 🎉**
