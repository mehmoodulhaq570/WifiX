Quick Start Guide
=================

Get WifiX up and running in just 5 minutes! This guide will help you share your first file.

Your First File Share
---------------------

Step 1: Start the Server (Host)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Navigate to backend directory
   cd WifiX/backend
   
   # Activate virtual environment (if using)
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows
   
   # Start server
   python app.py

You'll see output like this:

.. code-block:: text

   🚀 WifiX Server Starting...
   📊 Configuration:
      • Port: 5000
      • PIN Protection: Enabled
      • Max File Size: 100 MB
   
   📡 Network Information:
      • Local IP: 192.168.1.100
      • Local URL: http://localhost:5000
      • Network URL: http://192.168.1.100:5000
   
   🔗 Connection Options:
      • Room Code: HELLO6
      • mDNS: wifix-hello6.local
   
   ✅ Server running successfully!

.. note::
   **Important:** Keep this terminal window open while using WifiX.

Step 2: Start the Frontend
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Open a **new terminal window**:

.. code-block:: bash

   # Navigate to frontend directory
   cd WifiX/frontend
   
   # Start development server
   npm run dev

You'll see:

.. code-block:: text

   VITE v5.0.0  ready in 450 ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.100:5173/
   ➜  press h to show help

Step 3: Access the Interface
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Open your browser and go to:

- **Local:** http://localhost:5173
- **Network:** http://192.168.1.100:5173

You'll see the WifiX homepage with two options:

.. code-block:: text

   ╔════════════════════════════════════════╗
   ║           Welcome to WifiX             ║
   ║    Seamless LAN File Sharing           ║
   ╠════════════════════════════════════════╣
   ║                                        ║
   ║  [🏠 Host Files]  [📱 Join Room]      ║
   ║                                        ║
   ║  • Share files with others on LAN     ║
   ║  • Secure with PIN protection         ║
   ║  • Real-time progress tracking        ║
   ║                                        ║
   ╚════════════════════════════════════════╝

Step 4: Upload a File (Host)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Click **"Host Files"** button
2. Enter your PIN (default: ``1234``)
3. You'll see the host dashboard with:
   - Your room code (e.g., ``HELLO6``)
   - Upload area
   - Connected clients counter
4. **Drag and drop** a file or click to browse
5. Watch the upload progress bar
6. File appears in the shared files list

.. tip::
   You can set a **per-file PIN** for extra security during upload!

Step 5: Join and Download (Client)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

On another device connected to the **same network**:

1. Open http://192.168.1.100:5173 (use host's IP)
2. Click **"Join Room"**
3. Enter the **room code** (e.g., ``HELLO6``)
4. Enter the **room PIN** (default: ``1234``)
5. You'll see all shared files
6. Click **"Download"** on any file
7. Watch the download progress

🎉 **Congratulations!** You've successfully shared your first file with WifiX!

Common Workflows
----------------

Classroom File Distribution
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Scenario:** Teacher shares lecture materials with 30 students

**Teacher (Host):**

.. code-block:: text

   1. Start WifiX server
   2. Write room code on whiteboard: LECTURE
   3. Upload files:
      • lecture_notes.pdf (2 MB)
      • assignment.docx (1 MB)
      • reference_book.pdf (15 MB)
   4. Monitor downloads in real-time

**Students (Clients):**

.. code-block:: text

   1. Connect to school WiFi
   2. Open browser → teacher's URL
   3. Enter room code: LECTURE
   4. Download needed files
   5. ✅ All 30 students get files in < 2 minutes

**Time saved:** Instead of 30 USB transfers or emailing 30 people!

Team Meeting File Sharing
~~~~~~~~~~~~~~~~~~~~~~~~~~

**Scenario:** Share presentation and documents during meeting

.. code-block:: text

   ╔═══════════════════════════════════════════════╗
   ║  Meeting: Q4 Planning (Room: MEET42)         ║
   ╠═══════════════════════════════════════════════╣
   ║  📁 Files Available:                          ║
   ║  • Q4_Strategy.pptx         (8 MB)   [PIN]   ║
   ║  • Budget_2024.xlsx         (2 MB)           ║
   ║  • Marketing_Plan.pdf       (5 MB)           ║
   ║  • Meeting_Agenda.docx      (1 MB)           ║
   ║                                               ║
   ║  👥 Connected: 8 participants                 ║
   ║  📊 Downloads: 24 completed                   ║
   ╚═══════════════════════════════════════════════╝

**Workflow:**

1. Host creates room before meeting
2. Shares room code via meeting invite
3. Participants join and download during meeting
4. Sensitive files (Budget) protected with additional PIN
5. Host can delete files after meeting ends

Quick Transfer Between Devices
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Scenario:** Transfer files from laptop to desktop quickly

.. code-block:: text

   Laptop (Host)          →     Desktop (Client)
   ═══════════════             ═══════════════════
   
   1. Start WifiX             1. Open browser
   2. Room: QUICK7            2. Enter: QUICK7
   3. Upload files            3. Download all
   4. Monitor progress        4. ✅ Complete
   
   Time: 30 seconds for 500 MB

Interface Overview
------------------

Host Dashboard
~~~~~~~~~~~~~~

.. code-block:: text

   ┌─────────────────────────────────────────────────┐
   │ WifiX Host - Room: HELLO6                       │
   ├─────────────────────────────────────────────────┤
   │                                                 │
   │ 📡 Connection Info:                             │
   │    Room Code: HELLO6                            │
   │    Network: http://192.168.1.100:5173           │
   │    mDNS: wifix-hello6.local                     │
   │                                                 │
   │ 👥 Connected Clients: 3                         │
   │    • 192.168.1.105 (Active)                     │
   │    • 192.168.1.107 (Downloading)                │
   │    • 192.168.1.110 (Active)                     │
   │                                                 │
   ├─────────────────────────────────────────────────┤
   │ 📤 Upload Files                                 │
   │ ┌─────────────────────────────────────────────┐ │
   │ │  Drag & drop files here                     │ │
   │ │  or click to browse                         │ │
   │ └─────────────────────────────────────────────┘ │
   │                                                 │
   │ 📁 Shared Files (3):                            │
   │                                                 │
   │ ┌─────────────────────────────────────────────┐ │
   │ │ 📄 document.pdf           2.5 MB    [🔒]    │ │
   │ │ Downloads: 2 • Uploaded: 5 min ago          │ │
   │ │ [Delete]                                    │ │
   │ └─────────────────────────────────────────────┘ │
   │                                                 │
   │ ┌─────────────────────────────────────────────┐ │
   │ │ 📷 photo.jpg              5.1 MB            │ │
   │ │ Downloads: 1 • Uploaded: 3 min ago          │ │
   │ │ [Delete]                                    │ │
   │ └─────────────────────────────────────────────┘ │
   │                                                 │
   │ ┌─────────────────────────────────────────────┐ │
   │ │ 📊 presentation.pptx     15.3 MB    [🔒]    │ │
   │ │ ⬇️ Downloading by 192.168.1.107 (45%)       │ │
   │ │ [Delete]                                    │ │
   │ └─────────────────────────────────────────────┘ │
   │                                                 │
   │ [Stop Server]                                   │
   └─────────────────────────────────────────────────┘

Client Dashboard
~~~~~~~~~~~~~~~~

.. code-block:: text

   ┌─────────────────────────────────────────────────┐
   │ WifiX Client - Room: HELLO6                     │
   ├─────────────────────────────────────────────────┤
   │                                                 │
   │ 🏠 Host: 192.168.1.100                          │
   │ 👥 Other Clients: 2 online                      │
   │                                                 │
   ├─────────────────────────────────────────────────┤
   │ 📁 Available Files (3):                         │
   │                                                 │
   │ ┌─────────────────────────────────────────────┐ │
   │ │ 📄 document.pdf           2.5 MB    [🔒]    │ │
   │ │ Uploaded: 5 min ago                         │ │
   │ │ [Download]                                  │ │
   │ └─────────────────────────────────────────────┘ │
   │                                                 │
   │ ┌─────────────────────────────────────────────┐ │
   │ │ 📷 photo.jpg              5.1 MB            │ │
   │ │ ✅ Downloaded                                │ │
   │ │ [Download Again]                            │ │
   │ └─────────────────────────────────────────────┘ │
   │                                                 │
   │ ┌─────────────────────────────────────────────┐ │
   │ │ 📊 presentation.pptx     15.3 MB    [🔒]    │ │
   │ │ ⬇️ Downloading... 45% (6.9/15.3 MB)         │ │
   │ │ Speed: 2.3 MB/s • ETA: 4 seconds            │ │
   │ │ [███████████░░░░░░░░░░░░░]                  │ │
   │ └─────────────────────────────────────────────┘ │
   │                                                 │
   │ [Refresh] [Leave Room]                          │
   └─────────────────────────────────────────────────┘

Key Features in Action
----------------------

Real-Time Notifications
~~~~~~~~~~~~~~~~~~~~~~~

Watch live updates as events happen:

.. code-block:: text

   🔔 Notifications:
   • 📤 New file uploaded: photo.jpg
   • 👤 Client joined (192.168.1.105)
   • ⬇️ Download started: document.pdf
   • ✅ Download completed: document.pdf
   • 👋 Client disconnected (192.168.1.105)
   • 🗑️ File deleted: old_file.txt

Progress Tracking
~~~~~~~~~~~~~~~~~

Monitor uploads and downloads in real-time:

.. code-block:: text

   Uploading: presentation.pptx
   [████████████████░░░░] 78% (11.9/15.3 MB)
   Speed: 3.2 MB/s
   Time remaining: 1 second

   Downloading: video.mp4
   [████████░░░░░░░░░░░░] 35% (17.5/50.0 MB)
   Speed: 5.8 MB/s
   Time remaining: 6 seconds

PIN Protection Levels
~~~~~~~~~~~~~~~~~~~~~

**Global Room PIN:** Required to enter the room

.. code-block:: text

   Enter Room Code: HELLO6
   Enter PIN: ••••
   [Join Room]

**Per-File PIN:** Optional extra security for sensitive files

.. code-block:: text

   📄 confidential_report.pdf [🔒]
   This file requires an additional PIN
   Enter File PIN: ••••
   [Download]

Tips & Tricks
-------------

⚡ **Speed Tips:**

- Use wired Ethernet for maximum speed (1 Gbps capable)
- Close other network-heavy applications
- Modern WiFi (802.11ac/ax) gives 300+ Mbps

🔒 **Security Tips:**

- Change default PIN before sharing
- Use per-file PINs for sensitive documents
- Stop server immediately after file sharing session
- Don't share room codes publicly

📱 **Multi-Device Tips:**

- Save room URL as browser bookmark on all devices
- Use QR code for easy mobile access
- mDNS works without remembering IP addresses

🎯 **Best Practices:**

- Name files clearly before uploading
- Delete files after recipients download them
- Monitor "Connected Clients" count
- Use room codes that are easy to communicate (avoid confusing characters)

Common Questions
----------------

**Q: How many files can I share at once?**

A: No limit! Share as many as you need.

**Q: What's the maximum file size?**

A: Default is 100 MB, configurable up to your available disk space.

**Q: Can clients upload files?**

A: Currently, only the host can upload. Clients can only download.

**Q: Do I need internet?**

A: No! WifiX works on local network only.

**Q: Is it encrypted?**

A: WebSocket traffic is encrypted. For HTTPS, see :doc:`../development/deployment`.

**Q: Can I use it on mobile?**

A: Yes! Open the URL in any mobile browser.

Next Steps
----------

Now that you know the basics:

- Learn about :doc:`host-workflow` for advanced hosting
- Explore :doc:`client-workflow` for client features
- Discover all :doc:`features` available
- Configure :doc:`configuration` options
- Understand :doc:`security` best practices

Need Help?
----------

- Check :doc:`../troubleshooting` for solutions
- Read :doc:`../faq` for common questions
- Visit `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_
