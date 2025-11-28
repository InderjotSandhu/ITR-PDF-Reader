# 🚀 Run Commands

## Quick Start Commands

### Option 1: Run Both Servers (Recommended)

Open **TWO separate terminal windows** and run these commands:

#### Terminal 1 - Backend Server
```bash
cd ITR_Complete/backend
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
📁 Uploads directory ready
📁 Output directory ready
✅ CAS extraction service is ready
```

#### Terminal 2 - Frontend Server
```bash
cd ITR_Complete/frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Option 2: Using Windows Command Prompt

#### Terminal 1 - Backend
```cmd
cd ITR_Complete\backend
npm start
```

#### Terminal 2 - Frontend
```cmd
cd ITR_Complete\frontend
npm start
```

---

## First Time Setup

If you haven't installed dependencies yet:

### Backend Setup
```bash
cd ITR_Complete/backend
npm install
```

**This installs:**
- express (web server)
- multer (file upload)
- pdf-parse (PDF extraction)
- exceljs (Excel generation)
- cors (cross-origin requests)

### Frontend Setup
```bash
cd ITR_Complete/frontend
npm install
```

**This installs:**
- react (UI framework)
- axios (HTTP client)
- react-scripts (build tools)

---

## Development Commands

### Backend Development (with auto-reload)
```bash
cd ITR_Complete/backend
npm run dev
```
*Requires nodemon to be installed*

### Frontend Development (already has hot-reload)
```bash
cd ITR_Complete/frontend
npm start
```

---

## Production Commands

### Build Frontend for Production
```bash
cd ITR_Complete/frontend
npm run build
```

This creates an optimized production build in `frontend/build/`

### Run Production Server
```bash
cd ITR_Complete/backend
npm start
```

---

## Testing Commands

### Test Backend
```bash
cd ITR_Complete/backend
npm test
```

### Test Frontend
```bash
cd ITR_Complete/frontend
npm test
```

---

## Troubleshooting Commands

### Check if ports are in use

**Windows:**
```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

**Kill process on port (Windows):**
```cmd
taskkill /PID <PID_NUMBER> /F
```

### Clear npm cache
```bash
npm cache clean --force
```

### Reinstall dependencies
```bash
# Backend
cd ITR_Complete/backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Frontend
cd ITR_Complete/frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## Verification Commands

### Check Node.js version
```bash
node --version
```
*Should be v14 or higher*

### Check npm version
```bash
npm --version
```

### Check if backend is running
```bash
curl http://localhost:5000/api/status
```

**Expected Response:**
```json
{
  "status": "ready",
  "message": "CAS extraction service is ready",
  "timestamp": "2025-11-23T..."
}
```

---

## Stop Commands

### Stop Backend
Press `Ctrl + C` in the backend terminal

### Stop Frontend
Press `Ctrl + C` in the frontend terminal

---

## Complete Workflow

### 1. First Time Setup
```bash
# Install backend dependencies
cd ITR_Complete/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Application
```bash
# Terminal 1 - Start backend
cd ITR_Complete/backend
npm start

# Terminal 2 - Start frontend
cd ITR_Complete/frontend
npm start
```

### 3. Access Application
Open browser and go to: **http://localhost:3000**

### 4. Use Application
1. Upload CAS PDF
2. Enter password (if needed)
3. Select output format (Excel/JSON/Text)
4. Select sheets (if Excel)
5. Click "Extract & Generate"
6. Download file

### 5. Stop Application
Press `Ctrl + C` in both terminals

---

## Environment Variables (Optional)

Create `.env` file in backend folder:

```env
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output
```

---

## Quick Reference

| Command | Purpose | Location |
|---------|---------|----------|
| `npm install` | Install dependencies | backend/ or frontend/ |
| `npm start` | Start server | backend/ or frontend/ |
| `npm run dev` | Start with auto-reload | backend/ |
| `npm run build` | Build for production | frontend/ |
| `npm test` | Run tests | backend/ or frontend/ |
| `Ctrl + C` | Stop server | Any terminal |

---

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Frontend Dev | 3000 | http://localhost:3000 |
| Frontend Prod | 5000 | http://localhost:5000 |

---

## Common Issues & Solutions

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change port in backend/server.js
```

### Issue: "Cannot connect to backend"
**Solution:**
1. Check if backend is running
2. Verify backend is on port 5000
3. Check CORS settings in backend/server.js

### Issue: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
npm install
```

### Issue: "PDF extraction failed"
**Solution:**
1. Check if PDF is valid CAS document
2. Try with password if PDF is protected
3. Check backend logs for errors

---

## Logs Location

- **Backend logs**: Console output in Terminal 1
- **Frontend logs**: Console output in Terminal 2
- **Browser logs**: Browser Developer Console (F12)

---

## Need Help?

1. Check `docs/WORKFLOW.md` for detailed flow
2. Check `docs/API.md` for API documentation
3. Check `README.md` for feature overview
4. Check backend console for error messages

---

**Last Updated**: November 23, 2025
