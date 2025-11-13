Troubleshooting
===============

Common issues and their solutions.

Installation Issues
-------------------

Python Module Not Found
~~~~~~~~~~~~~~~~~~~~~~~~

**Error:**

.. code-block:: text

   ModuleNotFoundError: No module named 'flask'

**Solution:**

.. code-block:: bash

   # Ensure virtual environment is activated
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows
   
   # Reinstall dependencies
   pip install -r requirements.txt

Port Already in Use
~~~~~~~~~~~~~~~~~~~

**Error:**

.. code-block:: text

   OSError: [Errno 48] Address already in use

**Solution:**

.. code-block:: bash

   # Find and kill process using port 5000
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Or use different port
   PORT=5001 python app.py

npm Install Fails
~~~~~~~~~~~~~~~~~

**Error:**

.. code-block:: text

   npm ERR! code ELIFECYCLE

**Solution:**

.. code-block:: bash

   # Clear cache
   npm cache clean --force
   
   # Delete and reinstall
   rm -rf node_modules package-lock.json
   npm install

Network Issues
--------------

Cannot Access from Other Devices
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Server works on localhost but not from other devices

**Solutions:**

1. **Check firewall:**

   .. code-block:: bash
   
      # Windows: Allow Python through firewall
      # Go to Windows Defender Firewall → Allow an app
      
      # macOS: System Preferences → Security → Firewall
      
      # Linux
      sudo ufw allow 5000
      sudo ufw allow 5173

2. **Verify HOST setting:**

   .. code-block:: bash
   
      # backend/.env
      HOST=0.0.0.0  # NOT 127.0.0.1

3. **Check network connectivity:**

   .. code-block:: bash
   
      # From client device, ping server
      ping 192.168.1.100

mDNS Not Working
~~~~~~~~~~~~~~~~

**Symptoms:** Cannot connect via room code or .local address

**Solutions:**

**Windows:**

.. code-block:: bash

   # Install Bonjour Print Services
   # Download from Apple
   # Or install iTunes (includes Bonjour)

**macOS:**

Bonjour is built-in and should work automatically.

**Linux:**

.. code-block:: bash

   # Install Avahi
   sudo apt install avahi-daemon avahi-utils
   
   # Start service
   sudo systemctl start avahi-daemon
   sudo systemctl enable avahi-daemon
   
   # Test
   avahi-browse -a

CORS Errors
~~~~~~~~~~~

**Error in browser console:**

.. code-block:: text

   Access to fetch at 'http://192.168.1.100:5000/api/files' 
   from origin 'http://192.168.1.100:5173' has been blocked by CORS policy

**Solution:**

.. code-block:: bash

   # backend/.env - Add your frontend URL
   CORS_ORIGINS=http://localhost:5173,http://192.168.1.100:5173
   
   # Restart backend server

Upload/Download Issues
----------------------

Upload Fails
~~~~~~~~~~~~

**Error:**

.. code-block:: text

   413 Request Entity Too Large

**Solution:**

.. code-block:: bash

   # Increase max file size in backend/.env
   MAX_CONTENT_LENGTH=524288000  # 500 MB

**Error:**

.. code-block:: text

   File type not allowed

**Solution:**

Check that file type is not restricted. By default, all file types are allowed.

Download Stuck at 0%
~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Download never progresses

**Solutions:**

1. **Check browser console** for JavaScript errors
2. **Verify WebSocket connection:**

   .. code-block:: javascript
   
      // In browser console
      console.log('Socket connected:', socket.connected)

3. **Clear browser cache** and reload
4. **Try different browser**

File Not Found After Upload
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** File uploads but doesn't appear in list

**Solutions:**

1. **Check upload folder permissions:**

   .. code-block:: bash
   
      # Linux/macOS
      chmod 755 backend/uploads
      
      # Windows: Ensure user has write permissions

2. **Verify file was uploaded:**

   .. code-block:: bash
   
      ls backend/uploads/

3. **Check backend logs** for errors

WebSocket Issues
----------------

Connection Failed
~~~~~~~~~~~~~~~~~

**Error in console:**

.. code-block:: text

   WebSocket connection to 'ws://localhost:5000/socket.io/' failed

**Solutions:**

1. **Check backend is running**
2. **Verify Socket.IO versions match:**

   .. code-block:: bash
   
      # backend/requirements.txt
      flask-socketio==5.3.0
      
      # frontend/package.json
      "socket.io-client": "^4.5.0"

3. **Check proxy configuration** in ``vite.config.js``

Real-Time Updates Not Working
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Files uploaded but clients don't see them immediately

**Solutions:**

1. **Refresh page** (force reload: Ctrl+Shift+R)
2. **Check WebSocket connection:**

   .. code-block:: javascript
   
      // Browser console
      socket.on('connect', () => console.log('Connected!'))
      socket.on('disconnect', () => console.log('Disconnected!'))

3. **Restart both backend and frontend**

Authentication Issues
---------------------

Incorrect PIN Error
~~~~~~~~~~~~~~~~~~~

**Error:**

.. code-block:: text

   Invalid PIN

**Solutions:**

1. **Check ACCESS_PIN in backend/.env**
2. **Ensure no extra spaces:**

   .. code-block:: bash
   
      ACCESS_PIN=1234  # Correct
      ACCESS_PIN= 1234  # Wrong (extra space)

3. **Restart backend after changing PIN**

Session Expired
~~~~~~~~~~~~~~~

**Error:**

.. code-block:: text

   Session expired, please log in again

**Solutions:**

1. **Clear browser cookies**
2. **Check SECRET_KEY hasn't changed**
3. **Re-enter PIN to create new session**

Performance Issues
------------------

Slow Upload/Download
~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Transfer speeds slower than expected

**Solutions:**

1. **Use wired connection** instead of WiFi
2. **Close other network applications**
3. **Check network speed:**

   .. code-block:: bash
   
      # Test with iperf3
      # Server
      iperf3 -s
      
      # Client
      iperf3 -c 192.168.1.100

4. **Reduce MAX_CONTENT_LENGTH** if system has limited memory

High Memory Usage
~~~~~~~~~~~~~~~~~

**Symptoms:** Backend using excessive RAM

**Solutions:**

1. **Enable FILE_TTL_SECONDS** for auto-deletion:

   .. code-block:: bash
   
      FILE_TTL_SECONDS=3600  # Delete after 1 hour

2. **Manually delete old files**
3. **Reduce MAX_CONTENT_LENGTH**
4. **Restart backend periodically**

Browser Issues
--------------

Files Not Displaying
~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Blank file list

**Solutions:**

1. **Check browser console** (F12) for errors
2. **Try incognito/private mode**
3. **Clear cache and cookies**
4. **Update browser to latest version**

Drag & Drop Not Working
~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Cannot drag files to upload area

**Solutions:**

1. **Click to browse** instead
2. **Check browser supports File API**
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Disable browser extensions** temporarily

Advanced Troubleshooting
------------------------

Enable Debug Logging
~~~~~~~~~~~~~~~~~~~~

**Backend:**

.. code-block:: python

   # app.py - Add at top
   import logging
   logging.basicConfig(level=logging.DEBUG)

**Frontend:**

.. code-block:: javascript

   // Enable Socket.IO debug
   localStorage.debug = '*';

Check Server Logs
~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Backend logs show in terminal where you ran:
   python app.py
   
   # Look for errors, warnings, or stack traces

Test API Endpoints
~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Test server is responding
   curl http://localhost:5000/api/info
   
   # Test file list
   curl http://localhost:5000/api/files

Network Diagnostics
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Check if port is open
   telnet 192.168.1.100 5000
   
   # Check connectivity
   ping 192.168.1.100
   
   # Trace route
   traceroute 192.168.1.100  # macOS/Linux
   tracert 192.168.1.100     # Windows

Reset Everything
~~~~~~~~~~~~~~~~

If all else fails:

.. code-block:: bash

   # 1. Stop all services
   # Press Ctrl+C in backend and frontend terminals
   
   # 2. Clear uploads
   rm -rf backend/uploads/*
   
   # 3. Delete virtual environment
   rm -rf backend/venv
   
   # 4. Recreate environment
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # 5. Clear frontend cache
   cd ../frontend
   rm -rf node_modules package-lock.json
   npm install
   
   # 6. Restart everything
   # Terminal 1
   cd backend
   python app.py
   
   # Terminal 2
   cd frontend
   npm run dev

Getting Help
------------

If you're still experiencing issues:

1. **Search existing issues:** `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_
2. **Create new issue:** Include:
   - Operating system and version
   - Python version (``python --version``)
   - Node.js version (``node --version``)
   - Error messages (full text)
   - Steps to reproduce
3. **Check FAQ:** :doc:`faq` for common questions
4. **Join discussions:** `GitHub Discussions <https://github.com/mehmoodulhaq570/WifiX/discussions>`_

Error Reference
---------------

.. list-table::
   :header-rows: 1
   :widths: 20 40 40

   * - Error Code
     - Meaning
     - Solution
   * - 400
     - Bad Request
     - Check request parameters
   * - 401
     - Unauthorized
     - Enter correct PIN
   * - 403
     - Forbidden
     - Check file permissions
   * - 404
     - Not Found
     - Verify file exists
   * - 413
     - Payload Too Large
     - Increase MAX_CONTENT_LENGTH
   * - 429
     - Too Many Requests
     - Wait before retrying
   * - 500
     - Server Error
     - Check backend logs
