Host Workflow
=============

Complete guide for hosting files with WifiX.

Starting as a Host
------------------

Initial Setup
~~~~~~~~~~~~~

1. **Navigate to backend directory:**

   .. code-block:: bash

      cd WifiX/backend

2. **Activate virtual environment (if using):**

   .. code-block:: bash

      # Windows
      venv\Scripts\activate
      
      # macOS/Linux
      source venv/bin/activate

3. **Start the server:**

   .. code-block:: bash

      python app.py

4. **Note the connection information:**

   .. code-block:: text

      📡 Network Information:
         • Local IP: 192.168.1.100
         • Network URL: http://192.168.1.100:5000
      
      🔗 Connection Options:
         • Room Code: HELLO6
         • mDNS: wifix-hello6.local

5. **Start frontend (new terminal):**

   .. code-block:: bash

      cd WifiX/frontend
      npm run dev

6. **Open browser** to ``http://localhost:5173``

Managing Files
--------------

Uploading Files
~~~~~~~~~~~~~~~

**Drag and Drop:**

1. Drag file(s) from file explorer
2. Drop onto upload area
3. Watch upload progress
4. File appears in list when complete

**Click to Browse:**

1. Click upload area
2. Select file(s) from dialog
3. Click "Open"
4. Monitor upload progress

**With File PIN:**

1. Upload file as normal
2. Enter optional PIN before upload
3. Clients need this PIN to download
4. Useful for sensitive files

Viewing Uploaded Files
~~~~~~~~~~~~~~~~~~~~~~

Files display with:

- 📄 File icon and name
- File size
- Upload timestamp
- Download count
- 🔒 Lock icon (if PIN protected)
- Active download indicators

Deleting Files
~~~~~~~~~~~~~~

**Single File:**

1. Click "Delete" button on file
2. Confirm deletion
3. File removed from all clients immediately

**All Files:**

Use "Clear All" button to delete all files at once.

**Automatic Deletion:**

If ``FILE_TTL_SECONDS`` is set, files auto-delete after the specified time.

Monitoring Activity
-------------------

Connected Clients
~~~~~~~~~~~~~~~~~

View in real-time:

- Number of connected clients
- Client IP addresses
- Connection status (active/downloading)
- Connection timestamps

Download Activity
~~~~~~~~~~~~~~~~~

Monitor:

- Active downloads (which client, which file)
- Download progress (percentage)
- Completed downloads
- Download history

Real-Time Notifications
~~~~~~~~~~~~~~~~~~~~~~~

Receive instant updates for:

- New client connections
- Client disconnections
- Download started events
- Download completed events
- File upload completion

Sharing Connection Info
-----------------------

Share with Clients
~~~~~~~~~~~~~~~~~~

**Option 1: Room Code**

.. code-block:: text

   "Join room HELLO6 at http://192.168.1.100:5173"
   PIN: 1234

**Option 2: Direct URL**

.. code-block:: text

   http://192.168.1.100:5173

**Option 3: mDNS Address**

.. code-block:: text

   http://wifix-hello6.local:5173

**Option 4: QR Code** (if implemented)

Generate QR code containing connection URL for mobile scanning.

Communication Methods
~~~~~~~~~~~~~~~~~~~~~

- Write room code on whiteboard (classroom)
- Send via chat/email
- Display on projector screen
- Share via meeting invite
- Post on shared document

Advanced Features
-----------------

Rate Limiting
~~~~~~~~~~~~~

Built-in rate limits protect your server:

- 10 uploads per minute per IP
- 20 deletes per minute per IP
- 200 requests per day per IP
- 50 requests per hour per IP

Exceeded clients see error messages.

Session Management
~~~~~~~~~~~~~~~~~~

Host session remains active until:

- Server is stopped
- Session expires (24 hours default)
- Manual logout

File TTL (Time-to-Live)
~~~~~~~~~~~~~~~~~~~~~~~

Configure automatic deletion:

.. code-block:: bash

   # backend/.env
   FILE_TTL_SECONDS=3600  # 1 hour

Files delete automatically after TTL expires.

Best Practices
--------------

Security
~~~~~~~~

✅ **Do:**

- Change default PIN (not 1234)
- Use per-file PINs for sensitive data
- Stop server after sharing session
- Monitor connected clients
- Delete files after distribution

❌ **Don't:**

- Share room code publicly
- Leave server running unattended
- Use weak/obvious PINs
- Expose to internet without HTTPS
- Keep sensitive files after session

Performance
~~~~~~~~~~~

✅ **Do:**

- Use wired Ethernet when possible
- Close bandwidth-heavy applications
- Monitor connected client count
- Set reasonable MAX_CONTENT_LENGTH
- Enable FILE_TTL for auto-cleanup

❌ **Don't:**

- Share files larger than configured limit
- Allow unlimited connections without monitoring
- Run on slow/congested networks
- Keep very large files indefinitely

Organization
~~~~~~~~~~~~

✅ **Do:**

- Name files clearly before uploading
- Group related files together
- Delete old files regularly
- Document room codes for later use
- Plan file distribution strategy

❌ **Don't:**

- Upload duplicate files
- Use confusing file names
- Mix unrelated content
- Forget to communicate changes

Common Scenarios
----------------

Classroom Teaching
~~~~~~~~~~~~~~~~~~

**Setup:**

1. Start server before class
2. Write room code on board
3. Share room PIN verbally
4. Upload lesson materials

**During Class:**

- Students join and download
- Monitor download progress
- Add materials as needed
- Answer student questions

**After Class:**

- Verify all students downloaded
- Delete sensitive materials
- Keep public resources
- Stop server

Team Meeting
~~~~~~~~~~~~

**Preparation:**

1. Start server
2. Include room code in meeting invite
3. Upload presentation deck
4. Upload supporting documents

**During Meeting:**

- Share screen showing room code
- Participants download materials
- Add documents as discussion progresses
- Monitor participant access

**Wrap-up:**

- Ensure all attendees have files
- Delete drafts/confidential items
- Keep final versions available
- Send follow-up with room code

Event File Distribution
~~~~~~~~~~~~~~~~~~~~~~~~

**Before Event:**

1. Set up server on reliable hardware
2. Configure for large user count
3. Test with sample files
4. Prepare backup method

**During Event:**

- Display room code prominently
- Monitor server performance
- Watch for issues
- Provide assistance as needed

**After Event:**

- Keep files available briefly
- Set TTL for automatic cleanup
- Collect feedback
- Document metrics (downloads, clients)

Troubleshooting
---------------

Upload Failures
~~~~~~~~~~~~~~~

**Issue:** Upload fails or gets stuck

**Solutions:**

- Check disk space
- Verify file size under MAX_CONTENT_LENGTH
- Check network connectivity
- Review server logs
- Try smaller file first

No Clients Connecting
~~~~~~~~~~~~~~~~~~~~~

**Issue:** Clients can't connect to room

**Solutions:**

- Verify server is running
- Check firewall allows ports 5000, 5173
- Ensure HOST=0.0.0.0 in .env
- Verify all devices on same network
- Share correct URL/room code

Server Performance Issues
~~~~~~~~~~~~~~~~~~~~~~~~~

**Issue:** Slow or unresponsive

**Solutions:**

- Check system resources (CPU, RAM)
- Limit concurrent clients
- Reduce MAX_CONTENT_LENGTH
- Enable rate limiting
- Use wired connection
- Restart server

See Also
--------

- :doc:`client-workflow` - Client perspective
- :doc:`features` - Complete feature list
- :doc:`security` - Security best practices
- :doc:`configuration` - Configuration options
