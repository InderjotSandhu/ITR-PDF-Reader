# 🚀 START APPLICATION - Quick Guide

## ⚡ Quick Start (2 Steps)

### Step 1: Start Backend Server
Open **Terminal 1** (Command Prompt or PowerShell):

```bash
cd ITR_Complete/backend
npm start
```

✅ **Wait for**: `🚀 Server running on port 5000`

---

### Step 2: Start Frontend Server
Open **Terminal 2** (Command Prompt or PowerShell):

```bash
cd ITR_Complete/frontend
npm start
```

✅ **Wait for**: Browser opens automatically at `http://localhost:3000`

---

## 🎯 That's It! Your Application is Running

### What You'll See:

**Terminal 1 (Backend):**
```
🚀 Server running on port 5000
📁 Uploads directory ready
📁 Output directory ready
✅ CAS extraction service is ready
```

**Terminal 2 (Frontend):**
```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**Browser:**
- Opens automatically at `http://localhost:3000`
- Shows the CAS PDF Extractor interface

---

## 📋 How to Use

1. **Upload PDF**: Drag & drop or click to browse
2. **Enter Password**: If your PDF is password-protected
3. **Choose Format**: 
   - 📊 Excel (with sheet selection)
   - 📦 JSON (complete data)
   - 📝 Text (raw extraction)
4. **Select Sheets**: (Excel only) Choose which sheets to generate
5. **Click Extract**: Wait for processing
6. **Download**: File downloads automatically

---

## 🛑 How to Stop

Press `Ctrl + C` in both terminals:
- Terminal 1 (Backend)
- Terminal 2 (Frontend)

---

## 🔧 First Time Setup (One-Time Only)

If you haven't installed dependencies yet:

### Install Backend Dependencies
```bash
cd ITR_Complete/backend
npm install
```

### Install Frontend Dependencies
```bash
cd ITR_Complete/frontend
npm install
```

**Then follow the Quick Start steps above.**

---

## 📊 Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR BROWSER                         │
│              http://localhost:3000                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         React Frontend (Port 3000)                │ │
│  │  - Upload Interface                               │ │
│  │  - Format Selection                               │ │
│  │  - Progress Tracking                              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        │ HTTP API Calls
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js Backend (Port 5000)                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  1. Receive PDF                                   │ │
│  │  2. Extract Text (pdfExtractor.js)                │ │
│  │  3. Parse Portfolio (portfolioExtractor.js)       │ │
│  │  4. Parse Transactions (transactionExtractor.js)  │ │
│  │  5. Generate Output (excelGenerator.js)           │ │
│  │  6. Send File Back                                │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Output Formats

### 📊 Excel Format
- **Portfolio Summary**: Fund-wise overview
- **Transactions**: Complete transaction history
- **MF Holdings**: Current holdings with details
- **Customizable**: Select which sheets to generate

### 📦 JSON Format
- Complete structured data
- Includes metadata
- Perfect for API integration
- All extracted information

### 📝 Text Format
- Raw extracted text
- Useful for debugging
- Custom parsing

---

## 🔍 Workflow Overview

```
User Uploads PDF
    ↓
Backend Extracts Text
    ↓
Backend Parses Data
    ├── Portfolio Summary
    ├── Transactions
    └── Holdings
    ↓
Backend Generates Output
    ├── Excel (selected sheets)
    ├── JSON (complete data)
    └── Text (raw content)
    ↓
User Downloads File
```

---

## 📁 Project Structure

```
ITR_Complete/
├── backend/              ← Terminal 1 runs here
│   ├── src/
│   │   ├── extractors/   ← PDF processing logic
│   │   ├── routes/       ← API endpoints
│   │   └── middleware/   ← File upload handling
│   ├── uploads/          ← Temporary PDF storage
│   ├── output/           ← Generated files
│   └── server.js         ← Main backend file
│
├── frontend/             ← Terminal 2 runs here
│   ├── src/
│   │   ├── components/   ← React UI components
│   │   ├── App.js        ← Main app component
│   │   └── index.js      ← Entry point
│   └── public/           ← Static files
│
└── docs/                 ← Documentation
    ├── WORKFLOW.md       ← Detailed workflow
    ├── FLOWCHART.md      ← Visual flowcharts
    ├── OUTPUT_FORMATS.md ← Format guide
    └── UI_GUIDE.md       ← UI documentation
```

---

## ⚠️ Troubleshooting

### Problem: "Port 5000 already in use"
**Solution:**
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Problem: "Cannot connect to backend"
**Solution:**
1. Make sure backend is running (Terminal 1)
2. Check for error messages in backend terminal
3. Verify backend shows "Server running on port 5000"

### Problem: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
cd ITR_Complete/backend
npm install

cd ../frontend
npm install
```

### Problem: Frontend doesn't open automatically
**Solution:**
Manually open browser and go to: `http://localhost:3000`

---

## 📚 Additional Documentation

- **Complete Workflow**: See `docs/WORKFLOW.md`
- **Visual Flowcharts**: See `docs/FLOWCHART.md`
- **Output Formats**: See `docs/OUTPUT_FORMATS.md`
- **UI Guide**: See `docs/UI_GUIDE.md`
- **API Documentation**: See `docs/API.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Run Commands**: See `RUN_COMMANDS.md`

---

## ✅ Verification Checklist

Before using the application, verify:

- [ ] Node.js is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] Backend dependencies installed (`backend/node_modules` exists)
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] Backend is running (Terminal 1 shows success message)
- [ ] Frontend is running (Terminal 2 shows success message)
- [ ] Browser opened at `http://localhost:3000`
- [ ] Upload interface is visible

---

## 🎯 Success Indicators

**Backend Running Successfully:**
```
✅ 🚀 Server running on port 5000
✅ 📁 Uploads directory ready
✅ 📁 Output directory ready
✅ CAS extraction service is ready
```

**Frontend Running Successfully:**
```
✅ Compiled successfully!
✅ Browser opens at http://localhost:3000
✅ Upload interface visible
```

**Application Working:**
```
✅ Can upload PDF file
✅ Can select output format
✅ Can click Extract button
✅ Progress bar shows
✅ File downloads successfully
```

---

## 🚀 You're Ready!

Your CAS PDF Extractor is now running and ready to process CAS PDFs!

**Need Help?**
- Check the documentation in `docs/` folder
- Review error messages in terminal
- Verify both servers are running

---

**Version**: 1.1.0  
**Last Updated**: November 23, 2025  
**Status**: ✅ Ready to Use
