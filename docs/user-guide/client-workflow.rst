Client Workflow
===============

Complete guide for clients connecting to and downloading files from WifiX.

Connecting to a Room
--------------------

Prerequisites
~~~~~~~~~~~~~

- Connected to the **same network** as the host
- Web browser (Chrome, Firefox, Safari, Edge)
- Room code and PIN from host

Connection Methods
~~~~~~~~~~~~~~~~~~

**Method 1: Room Code**

1. Open browser to frontend URL (e.g., ``http://192.168.1.100:5173``)
2. Click "Join Room"
3. Enter room code (e.g., ``HELLO6``)
4. Enter room PIN (provided by host)
5. Click "Join"

**Method 2: Direct URL**

1. Open URL shared by host
2. Enter room PIN when prompted
3. Access file list immediately

**Method 3: mDNS/Bonjour**

1. Open ``http://wifix-<roomcode>.local:5173``
2. Enter PIN
3. Connect automatically

First Connection
~~~~~~~~~~~~~~~~

When joining a room, you'll see:

.. code-block:: text

   ┌─────────────────────────────────────┐
   │ Enter Room Code                     │
   ├─────────────────────────────────────┤
   │ Room Code: [______]                 │
   │ Room PIN:  [______]                 │
   │                                     │
   │ [Join Room]                         │
   └─────────────────────────────────────┘

Enter the information provided by the host.

Browsing Files
--------------

File List View
~~~~~~~~~~~~~~

After connecting, you'll see available files:

.. code-block:: text

   ┌─────────────────────────────────────────────┐
   │ WifiX Client - Room: HELLO6                 │
   ├─────────────────────────────────────────────┤
   │ 📁 Available Files (5):                     │
   │                                             │
   │ ┌─────────────────────────────────────────┐ │
   │ │ 📄 lecture_notes.pdf      2.5 MB        │ │
   │ │ Uploaded: 10 min ago                    │ │
   │ │ [Download]                              │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ ┌─────────────────────────────────────────┐ │
   │ │ 📊 presentation.pptx     15.3 MB  [🔒]  │ │
   │ │ Uploaded: 5 min ago                     │ │
   │ │ [Download]                              │ │
   │ └─────────────────────────────────────────┘ │
   └─────────────────────────────────────────────┘

File Information
~~~~~~~~~~~~~~~~

Each file shows:

- **Icon:** Type indicator (📄 document, 📷 image, 📊 presentation)
- **Name:** Original filename
- **Size:** File size in MB/KB
- **Timestamp:** When uploaded
- **Lock icon (🔒):** Protected with per-file PIN
- **Status:** Download status (available, downloading, downloaded)

Real-Time Updates
~~~~~~~~~~~~~~~~~

File list updates automatically when:

- Host uploads new files
- Files are deleted by host
- Other clients download files
- Your download completes

Downloading Files
-----------------

Basic Download
~~~~~~~~~~~~~~

1. **Locate file** in list
2. **Click "Download"** button
3. **Watch progress** bar
4. **File saves** to browser's download folder

Progress Indicator
~~~~~~~~~~~~~~~~~~

During download:

.. code-block:: text

   📊 presentation.pptx
   ⬇️ Downloading... 45% (6.9/15.3 MB)
   Speed: 2.3 MB/s • ETA: 4 seconds
   [███████████░░░░░░░░░░░░░]

Shows:

- Percentage complete
- Downloaded / Total size
- Current speed
- Estimated time remaining
- Visual progress bar

Protected Files
~~~~~~~~~~~~~~~

For files with 🔒 icon:

1. Click "Download"
2. Enter **file PIN** when prompted:

   .. code-block:: text

      📄 confidential_report.pdf [🔒]
      This file requires an additional PIN
      File PIN: [______]
      [Download]

3. Correct PIN allows download
4. Incorrect PIN shows error

Download Multiple Files
~~~~~~~~~~~~~~~~~~~~~~~

**Option 1: One at a time**

- Download each file individually
- Simple, straightforward

**Option 2: Select multiple** (if UI supports)

- Check boxes for desired files
- Click "Download Selected"
- Files download sequentially

Download Location
~~~~~~~~~~~~~~~~~

Files save to:

- **Windows:** ``C:\Users\YourName\Downloads\``
- **macOS:** ``/Users/YourName/Downloads/``
- **Linux:** ``~/Downloads/``
- **Mobile:** Device's download folder

Change location in browser settings.

Managing Downloads
------------------

Download Queue
~~~~~~~~~~~~~~

Multiple downloads queue automatically:

.. code-block:: text

   Download Queue:
   1. ✅ lecture_notes.pdf (Complete)
   2. ⬇️ presentation.pptx (Downloading - 45%)
   3. ⏳ video.mp4 (Queued)
   4. ⏳ assignment.docx (Queued)

Pausing/Canceling
~~~~~~~~~~~~~~~~~

- **Pause:** Browser's download manager (Ctrl+J)
- **Cancel:** Click stop button or close tab
- **Resume:** May not be supported (depends on browser)

Failed Downloads
~~~~~~~~~~~~~~~~

If download fails:

1. Check network connection
2. Verify file still exists (not deleted by host)
3. Re-enter file PIN if applicable
4. Try again

Common failure reasons:

- Network disconnected
- Host stopped server
- File was deleted
- Session expired
- File PIN changed

Mobile Experience
-----------------

Accessing from Phone/Tablet
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Connect to WiFi** (same network as host)
2. **Open browser** (Safari, Chrome)
3. **Navigate to URL** or enter room code
4. **Use as normal** - interface adapts to mobile

Mobile-Specific Features
~~~~~~~~~~~~~~~~~~~~~~~~~

- Touch-optimized interface
- Responsive layout
- Swipe gestures
- Native download integration
- Share downloaded files via system share sheet

Tablet Considerations
~~~~~~~~~~~~~~~~~~~~~

- Larger screen = desktop-like experience
- Better for viewing file lists
- Easier to download multiple files
- Split-screen multitasking possible

Best Practices
--------------

Connection
~~~~~~~~~~

✅ **Do:**

- Save room URL as bookmark
- Keep PIN secure
- Verify you're on correct network
- Check room code with host if unsure

❌ **Don't:**

- Share room code with unauthorized users
- Connect on public WiFi (security risk)
- Guess room codes/PINs
- Stay connected longer than needed

Downloading
~~~~~~~~~~~

✅ **Do:**

- Download files you need
- Verify file names before downloading
- Check file sizes (especially on mobile/metered)
- Delete downloaded files when done with them

❌ **Don't:**

- Download everything without review
- Re-download files you already have
- Download over metered connections (check file sizes)
- Leave downloads incomplete

Etiquette
~~~~~~~~~

✅ **Do:**

- Notify host if files are missing
- Report issues promptly
- Disconnect when finished
- Thank the host

❌ **Don't:**

- Overwhelm host with requests
- Complain about download speeds (network dependent)
- Share connection info without permission
- Stay connected unnecessarily

Common Scenarios
----------------

Classroom Student
~~~~~~~~~~~~~~~~~

**Joining:**

1. Host writes room code on board
2. Connect to classroom WiFi
3. Enter room code and PIN
4. Browse available materials

**During Class:**

- Download lecture notes
- Save assignments locally
- Reference materials as needed
- Download supplementary resources

**After Class:**

- Verify all files downloaded
- Organize in folders
- Disconnect from room

Meeting Participant
~~~~~~~~~~~~~~~~~~~

**Before Meeting:**

1. Receive room code in meeting invite
2. Join room when meeting starts
3. Download agenda/presentation

**During Meeting:**

- Follow along with shared docs
- Download updates as posted
- Save reference materials
- Note any password-protected files

**After Meeting:**

- Download any missed files
- Save meeting notes
- Archive important documents

Event Attendee
~~~~~~~~~~~~~~

**At Event:**

1. Note room code from screen/board
2. Connect during event
3. Download event materials
4. Save photos/videos shared

**Advantages:**

- No email needed
- Instant access
- No file size limits (configured)
- Works offline (LAN only)

Troubleshooting
---------------

Can't Connect
~~~~~~~~~~~~~

**Issue:** Cannot join room

**Solutions:**

1. Verify on same network as host
2. Check room code is correct
3. Ensure PIN is accurate (no spaces)
4. Try host's direct IP URL
5. Ask host to restart server

Room Not Found
~~~~~~~~~~~~~~

**Issue:** "Room does not exist"

**Solutions:**

- Double-check room code
- Ask host for current code
- Verify server is running
- Try mDNS URL instead
- Check for typos

Download Fails
~~~~~~~~~~~~~~

**Issue:** Download doesn't start or fails

**Solutions:**

- Check network connection
- Verify disk space available
- Re-enter file PIN (if protected)
- Try different browser
- Ask host if file was deleted

Slow Downloads
~~~~~~~~~~~~~~

**Issue:** Very slow download speed

**Solutions:**

- Move closer to WiFi router
- Disconnect other devices
- Close other tabs/apps
- Switch to wired connection (if possible)
- Ask host about server load

Advanced Tips
-------------

Browser Settings
~~~~~~~~~~~~~~~~

**Enable parallel downloads:**

- Chrome: chrome://flags/#enable-parallel-downloading
- Firefox: Network settings → Enable parallel downloads

**Change download location:**

- Settings → Downloads → Location
- Set to SSD for better performance
- Create project-specific folders

Keyboard Shortcuts
~~~~~~~~~~~~~~~~~~

- **Ctrl+J** (Cmd+J Mac): Open downloads
- **Ctrl+Shift+R** (Cmd+Shift+R Mac): Hard refresh
- **F12**: Developer console (troubleshooting)
- **Ctrl+S** (Cmd+S Mac): Save current page

Using Developer Tools
~~~~~~~~~~~~~~~~~~~~~

Press F12 to open console and:

- Check for JavaScript errors
- Verify WebSocket connection
- Monitor network requests
- Debug download issues

.. code-block:: javascript

   // Check connection status
   console.log('Connected:', socket.connected);
   
   // View available files
   console.log('Files:', files);

See Also
--------

- :doc:`host-workflow` - Host perspective
- :doc:`features` - Complete feature list
- :doc:`../troubleshooting` - Common issues
- :doc:`../faq` - Frequently asked questions
