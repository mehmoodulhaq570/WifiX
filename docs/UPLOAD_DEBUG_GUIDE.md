# Upload Debugging Guide

## Latest Changes Made

### 1. Fixed File Selection Display

- **Added**: Visual feedback when file is selected
- **Shows**: "✓ File Selected: filename.txt"
- **Added**: "Clear Selection" button to reset

### 2. Removed preventDefault Bug

- **Issue**: `e.preventDefault()` in onChange was blocking file selection
- **Fixed**: Removed preventDefault from file input onChange handler
- **Result**: File selection now works properly

### 3. Added Comprehensive Logging

All upload steps now log to browser console:

```javascript
// When file is selected:
"handleFileUpload called, files: FileList";
"File selected: test.txt";

// When upload button clicked:
"handleUpload called";
"Input element: <input>";
"Input element files: FileList";
"Number of files: 1";
"Selected file: File {name: 'test.txt', ...}";
"Starting upload for file: test.txt Size: 1234 PIN: No";
"Upload result: {success: true, ...}";
```

## How to Debug Upload Issues

### Step 1: Open Browser Console

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Clear console (trash icon)
4. Keep it open while testing

### Step 2: Test File Selection

1. Click on the upload zone
2. Select a small file (e.g., .txt file)
3. **Check Console** - Should see:
   ```
   handleFileUpload called, files: FileList {0: File, length: 1}
   File selected: yourfile.txt
   Files selected: 1
   ```
4. **Check UI** - Should see:
   ```
   ✓ File Selected:
   yourfile.txt
   [Clear Selection]
   ```

### Step 3: Test Upload

1. With file selected, click "Upload" button
2. **Check Console** - Should see:
   ```
   handleUpload called
   Input element: <input type="file" ...>
   Input element files: FileList {0: File, length: 1}
   Number of files: 1
   Selected file: File {name: "yourfile.txt", size: 1234, ...}
   Starting upload for file: yourfile.txt Size: 1234 PIN: No
   ```

### Step 4: Check Network Request

1. Go to **Network** tab in DevTools
2. Filter by "upload"
3. Look for POST request to `/upload`
4. Check:
   - **Status**: Should be 201 (Created)
   - **Response**: Should have `filename` and `url`
   - **Request Payload**: Should show FormData with file

## Common Issues & Solutions

### Issue 1: "Please select a file first" Error

**Symptoms**:

- File appears selected in UI
- Click Upload → Error modal appears
- Console shows: "No file selected!"

**Debug**:

```javascript
// Check console logs:
Input element: <input>
Input element files: null  ← PROBLEM!
Number of files: 0         ← PROBLEM!
```

**Causes**:

1. File input ref not properly initialized
2. File input cleared before upload
3. Browser security restriction

**Solutions**:

1. Refresh page and try again
2. Try different file
3. Check if antivirus is blocking
4. Try incognito mode

### Issue 2: Upload Fails with Network Error

**Symptoms**:

- File selected successfully
- Upload starts but fails
- Console shows: "Upload error: Network error"

**Debug**:

1. Check Network tab for failed request
2. Look for CORS errors in console
3. Check if backend is running

**Solutions**:

```powershell
# Check if Python server is running
Get-Process python

# Check if port 5000 is listening
Get-NetTCPConnection -LocalPort 5000

# If not running, start backend:
cd d:\Projects\WifiX
python backend/app.py
```

### Issue 3: 401 Unauthorized Error

**Symptoms**:

- Upload fails with 401 status
- Console shows: "Upload failed: 401"

**Cause**: Server has ACCESS_PIN enabled

**Solution**:

1. Check if ACCESS_PIN environment variable is set
2. If yes, you need to authenticate first
3. Or temporarily disable ACCESS_PIN:
   ```powershell
   # Remove ACCESS_PIN
   $env:ACCESS_PIN = $null
   python backend/app.py
   ```

### Issue 4: File Size Error

**Symptoms**:

- Error: "File size exceeds 1GB limit"

**Solution**:

- Use smaller file for testing (< 100MB recommended)
- Backend limit: 1GB
- Frontend limit: 1GB
- For large files, increase limits in both frontend and backend

### Issue 5: CORS Error

**Symptoms**:

- Console shows: "CORS policy: No 'Access-Control-Allow-Origin'"
- Network request shows CORS error

**Debug**:

```javascript
// Check backend/app.py ALLOWED_ORIGINS:
ALLOWED_ORIGINS = os.environ
  .get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173"
  )
  .split(",");
```

**Solution**:

1. Ensure frontend is running on port 5173
2. Ensure backend is running on port 5000
3. Check CORS_ORIGINS includes your frontend URL
4. Restart backend after CORS changes

## Testing Checklist

### ✅ File Selection Test

- [ ] Click upload zone opens file picker
- [ ] Select file shows "✓ File Selected"
- [ ] Filename displays correctly
- [ ] "Clear Selection" button works
- [ ] Console shows file selection logs

### ✅ Upload Test (No PIN)

- [ ] PIN protection checkbox is UNCHECKED
- [ ] Select file
- [ ] Click "Upload" button
- [ ] No PIN modal appears
- [ ] Upload completes successfully
- [ ] File appears in list
- [ ] No 🔒 icon on file
- [ ] Selected file clears after upload

### ✅ Upload Test (With PIN)

- [ ] CHECK PIN protection checkbox
- [ ] Select file
- [ ] Click "Upload" button
- [ ] PIN modal appears
- [ ] Enter PIN "1234" twice
- [ ] Click "Set PIN"
- [ ] Upload completes
- [ ] File appears with 🔒 icon

### ✅ Drag & Drop Test

- [ ] Drag file over upload zone
- [ ] Zone highlights (blue background)
- [ ] Drop file
- [ ] File selected successfully
- [ ] Upload works

## Console Log Reference

### Successful Upload Flow:

```
1. handleFileUpload called, files: FileList {0: File, length: 1}
2. File selected: test.txt
3. Files selected: 1
4. handleUpload called
5. Input element: <input type="file" ...>
6. Input element files: FileList {0: File, length: 1}
7. Number of files: 1
8. Selected file: File {name: "test.txt", size: 1234, type: "text/plain"}
9. Starting upload for file: test.txt Size: 1234 PIN: No
10. Upload result: {success: true, filename: "20251029095900_test.txt", url: "http://...", has_pin: false}
```

### Failed Upload (No File):

```
1. handleUpload called
2. Input element: <input type="file" ...>
3. Input element files: null
4. Number of files: 0
5. Selected file: undefined
6. No file selected!  ← ERROR
```

## Quick Fix Commands

### Restart Backend:

```powershell
# Stop Python
Get-Process python | Stop-Process

# Start fresh
cd d:\Projects\WifiX
python backend/app.py
```

### Restart Frontend:

```powershell
# In frontend/react directory
npm run dev
```

### Clear Browser Cache:

- Press Ctrl+Shift+Delete
- Clear cached files
- Refresh page (Ctrl+F5)

## Still Not Working?

If upload still fails after all debugging:

1. **Check Browser**: Try different browser (Chrome, Firefox, Edge)
2. **Check Antivirus**: Temporarily disable antivirus
3. **Check Firewall**: Allow Python and Node.js
4. **Check Ports**: Ensure 5000 and 5173 are not blocked
5. **Check Logs**: Look at Python terminal for backend errors
6. **Try Simple File**: Use a tiny .txt file (< 1KB)
7. **Restart Everything**: Restart backend, frontend, and browser

## Success Indicators

Upload is working correctly when:

- ✅ File selection shows visual feedback
- ✅ Console logs show all steps
- ✅ Upload completes without errors
- ✅ File appears in list immediately
- ✅ Download button works
- ✅ No console errors
- ✅ Network tab shows 201 status
