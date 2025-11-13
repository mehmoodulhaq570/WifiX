Installation Guide
==================

This guide will walk you through installing WifiX on your system.

System Requirements
-------------------

**Minimum Requirements**

- **OS:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+, Fedora 34+)
- **Python:** 3.8 or higher
- **Node.js:** 16.0 or higher
- **RAM:** 512 MB available
- **Disk Space:** 200 MB for installation
- **Network:** Active LAN connection

**Recommended Requirements**

- **Python:** 3.11+
- **Node.js:** 18.0+
- **RAM:** 1 GB available
- **Disk Space:** 500 MB for installation and file storage

Prerequisites
-------------

Before installing WifiX, ensure you have the following installed:

Python Installation
~~~~~~~~~~~~~~~~~~~

**Windows:**

1. Download Python from `python.org <https://www.python.org/downloads/>`_
2. Run the installer and check "Add Python to PATH"
3. Verify installation:

.. code-block:: powershell

   python --version
   # Should output: Python 3.11.x or higher

**macOS:**

.. code-block:: bash

   # Using Homebrew
   brew install python@3.11
   
   # Verify
   python3 --version

**Linux (Ubuntu/Debian):**

.. code-block:: bash

   sudo apt update
   sudo apt install python3.11 python3.11-venv python3-pip
   
   # Verify
   python3 --version

Node.js Installation
~~~~~~~~~~~~~~~~~~~~

**Windows:**

1. Download Node.js from `nodejs.org <https://nodejs.org/>`_
2. Run the installer (choose LTS version)
3. Verify:

.. code-block:: powershell

   node --version
   npm --version

**macOS:**

.. code-block:: bash

   # Using Homebrew
   brew install node
   
   # Verify
   node --version
   npm --version

**Linux:**

.. code-block:: bash

   # Using NodeSource repository
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify
   node --version
   npm --version

Git Installation
~~~~~~~~~~~~~~~~

**Windows:**

Download and install from `git-scm.com <https://git-scm.com/download/win>`_

**macOS:**

.. code-block:: bash

   brew install git

**Linux:**

.. code-block:: bash

   sudo apt install git

Installation Steps
------------------

Step 1: Clone the Repository
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   git clone https://github.com/mehmoodulhaq570/WifiX.git
   cd WifiX

Step 2: Backend Setup
~~~~~~~~~~~~~~~~~~~~~

Navigate to the backend directory and install dependencies:

.. code-block:: bash

   cd backend
   pip install -r requirements.txt

**Alternative: Using Virtual Environment (Recommended)**

.. code-block:: bash

   # Windows
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt

   # macOS/Linux
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

Step 3: Frontend Setup
~~~~~~~~~~~~~~~~~~~~~~

Navigate to the frontend directory and install dependencies:

.. code-block:: bash

   cd ../frontend
   npm install

Step 4: Configuration
~~~~~~~~~~~~~~~~~~~~~

Create a ``.env`` file in the ``backend`` directory:

.. code-block:: bash

   # backend/.env
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-here
   ACCESS_PIN=1234
   CORS_ORIGINS=http://localhost:5173,http://localhost:5174
   MAX_CONTENT_LENGTH=104857600

See :doc:`configuration` for detailed configuration options.

Step 5: Verify Installation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Test Backend:**

.. code-block:: bash

   cd backend
   python app.py

You should see:

.. code-block:: text

   🚀 WifiX Server Starting...
   📡 Network: 192.168.1.100:5000
   🔗 Room Code: ABC123
   ✅ Server running at http://192.168.1.100:5000

**Test Frontend (in a new terminal):**

.. code-block:: bash

   cd frontend
   npm run dev

You should see:

.. code-block:: text

   VITE v5.0.0  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.100:5173/

Step 6: Access WifiX
~~~~~~~~~~~~~~~~~~~~

Open your browser and navigate to:

- **Local:** ``http://localhost:5173``
- **Network:** ``http://192.168.1.100:5173``

You should see the WifiX interface! 🎉

Docker Installation (Alternative)
----------------------------------

If you prefer using Docker:

.. code-block:: bash

   # Clone repository
   git clone https://github.com/mehmoodulhaq570/WifiX.git
   cd WifiX

   # Build and run with Docker Compose
   docker-compose up -d

   # Access at http://localhost:5173

Platform-Specific Notes
-----------------------

Windows
~~~~~~~

**Firewall Configuration:**

Windows Firewall may block network access. Allow Python and Node.js:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Python (``python.exe``) and Node.js (``node.exe``)
4. Check both "Private" and "Public" networks

**Running on Startup:**

Create a batch script ``start-wifix.bat``:

.. code-block:: batch

   @echo off
   cd /d "C:\path\to\WifiX\backend"
   start cmd /k "venv\Scripts\activate && python app.py"
   cd /d "C:\path\to\WifiX\frontend"
   start cmd /k "npm run dev"

macOS
~~~~~

**Bonjour Service:**

macOS includes Bonjour (mDNS) by default, so automatic discovery works out of the box.

**Running on Startup:**

Create a Launch Agent at ``~/Library/LaunchAgents/com.wifix.plist``:

.. code-block:: xml

   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.wifix</string>
       <key>ProgramArguments</key>
       <array>
           <string>/path/to/WifiX/start.sh</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
   </dict>
   </plist>

Linux
~~~~~

**Avahi (mDNS):**

Install Avahi for automatic discovery:

.. code-block:: bash

   # Ubuntu/Debian
   sudo apt install avahi-daemon avahi-utils

   # Fedora
   sudo dnf install avahi avahi-tools

   # Start service
   sudo systemctl start avahi-daemon
   sudo systemctl enable avahi-daemon

**Systemd Service:**

Create ``/etc/systemd/system/wifix.service``:

.. code-block:: ini

   [Unit]
   Description=WifiX File Sharing Server
   After=network.target

   [Service]
   Type=simple
   User=your-username
   WorkingDirectory=/path/to/WifiX/backend
   ExecStart=/path/to/WifiX/backend/venv/bin/python app.py
   Restart=always

   [Install]
   WantedBy=multi-user.target

Enable and start:

.. code-block:: bash

   sudo systemctl daemon-reload
   sudo systemctl enable wifix
   sudo systemctl start wifix

Troubleshooting Installation
-----------------------------

Port Already in Use
~~~~~~~~~~~~~~~~~~~

If port 5000 or 5173 is already in use:

**Backend (change port):**

.. code-block:: bash

   # Set PORT environment variable
   export PORT=5001  # macOS/Linux
   set PORT=5001     # Windows CMD
   $env:PORT=5001    # Windows PowerShell

**Frontend (change port):**

Edit ``frontend/vite.config.js``:

.. code-block:: javascript

   export default {
     server: {
       port: 5174  // Change to desired port
     }
   }

Python Module Not Found
~~~~~~~~~~~~~~~~~~~~~~~~

If you get ``ModuleNotFoundError``:

.. code-block:: bash

   # Ensure you're in virtual environment
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows

   # Reinstall dependencies
   pip install --upgrade -r requirements.txt

npm Install Fails
~~~~~~~~~~~~~~~~~

If ``npm install`` fails:

.. code-block:: bash

   # Clear npm cache
   npm cache clean --force

   # Delete node_modules and package-lock.json
   rm -rf node_modules package-lock.json

   # Reinstall
   npm install

Permission Denied
~~~~~~~~~~~~~~~~~

On macOS/Linux, if you get permission errors:

.. code-block:: bash

   # Don't use sudo with pip, use virtual environment instead
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

Network Not Detected
~~~~~~~~~~~~~~~~~~~~

If mDNS/Bonjour isn't working:

1. **Check firewall settings** - Allow UDP port 5353
2. **Verify mDNS service:**

   - **Windows:** Bonjour Service should be running
   - **macOS:** Built-in, should work automatically
   - **Linux:** Check ``sudo systemctl status avahi-daemon``

3. **Use manual IP:** If discovery fails, connect via IP address directly

Verification Checklist
----------------------

After installation, verify everything works:

.. code-block:: bash

   # 1. Backend is running
   curl http://localhost:5000/api/info
   # Should return JSON with server info

   # 2. Frontend is accessible
   # Open browser to http://localhost:5173
   # You should see WifiX interface

   # 3. WebSocket connection
   # In browser console, check for "Connected" message

   # 4. File upload/download works
   # Try uploading a test file

✅ **Installation Complete!**

Next Steps
----------

- Read :doc:`quickstart` to learn basic usage
- Configure :doc:`configuration` for your needs
- Learn about :doc:`features` and capabilities
- Set up :doc:`security` options

Need Help?
----------

- Check :doc:`../troubleshooting` for common issues
- Visit `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_
- Read :doc:`../faq` for frequently asked questions
