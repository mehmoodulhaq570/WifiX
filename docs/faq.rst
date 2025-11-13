Frequently Asked Questions
==========================

General Questions
-----------------

What is WifiX?
~~~~~~~~~~~~~~

WifiX is a local area network (LAN) file sharing application that allows you to quickly and securely share files between devices on the same network without requiring internet access. It features a Flask backend and React frontend with real-time updates via WebSockets.

Do I need internet to use WifiX?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**No!** WifiX works entirely on your local network (LAN). You don't need internet connectivity - just devices connected to the same WiFi network or wired LAN.

Is WifiX free?
~~~~~~~~~~~~~~

Yes, WifiX is completely free and open source under the MIT License. You can use, modify, and distribute it freely.

What platforms does WifiX support?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **Server:** Windows, macOS, Linux (any platform running Python 3.8+)
- **Client:** Any device with a modern web browser (Chrome, Firefox, Safari, Edge)
- **Mobile:** iOS Safari, Android Chrome

Features
--------

What's the maximum file size I can share?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Default is 100 MB, but you can configure it up to your available disk space by setting ``MAX_CONTENT_LENGTH`` in the configuration. Many users successfully share files up to 1 GB or larger.

How many files can I share at once?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

There's no hard limit. You can share as many files as your disk space allows.

Can multiple people download simultaneously?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! Multiple clients can download different (or the same) files at the same time.

How fast are transfers?
~~~~~~~~~~~~~~~~~~~~~~~~

Speed depends on your network:

- **WiFi 5 (802.11ac):** Up to 300-400 Mbps (~40 MB/s)
- **WiFi 6 (802.11ax):** Up to 600-900 Mbps (~75-110 MB/s)
- **Gigabit Ethernet:** Up to 1000 Mbps (~125 MB/s)

Typical speeds: 20-50 MB/s on good WiFi, 80-120 MB/s on wired.

Can clients upload files?
~~~~~~~~~~~~~~~~~~~~~~~~~~

Currently, only the host can upload files. Clients can only download. This is a security design choice to prevent unauthorized file uploads.

Security
--------

Is WifiX secure?
~~~~~~~~~~~~~~~~

WifiX includes several security features:

- PIN-based access control (room PIN)
- Per-file PIN protection (optional)
- Session management
- Rate limiting to prevent abuse
- CORS protection
- No internet exposure (LAN only)

However, traffic is not encrypted by default. For sensitive data, consider:

- Using HTTPS (see deployment guide)
- VPN for added security
- Strong PINs
- Per-file PIN protection

Can others on my network see my files?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Only users who know your:
1. Server IP address or room code
2. Room PIN (if set)
3. File PIN (if set for specific files)

Without these, files are not accessible.

How do I change the PIN?
~~~~~~~~~~~~~~~~~~~~~~~~~

Edit ``backend/.env``:

.. code-block:: bash

   ACCESS_PIN=your-new-pin

Then restart the backend server.

What happens to my files?
~~~~~~~~~~~~~~~~~~~~~~~~~~

Files are stored in the ``backend/uploads/`` directory. They remain until:

- You manually delete them
- They expire (if ``FILE_TTL_SECONDS`` is set)
- You stop the server and delete the folder

Files are **not** uploaded to the cloud or internet.

Usage
-----

How do I connect from my phone?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Ensure phone is on the **same WiFi network** as the server
2. Open any web browser (Safari, Chrome)
3. Navigate to the server's network URL (e.g., ``http://192.168.1.100:5173``)
4. Enter room code and PIN
5. Download files directly to your phone

Do clients need to install anything?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**No!** Clients only need a web browser. No installation, no accounts, no downloads required.

Can I use WifiX in a classroom?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Absolutely! WifiX is perfect for classrooms:

- Teacher hosts and uploads materials
- Students join with room code
- Everyone downloads simultaneously
- No email, USB drives, or cloud storage needed

Typical use: Share PDFs, presentations, videos with 20-50 students.

How long does my room code last?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Room codes expire after 24 hours by default (configurable via ``ROOM_CODE_TTL``). You can generate a new one by restarting the server or through the admin interface.

Can I password protect individual files?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! When uploading a file, you can set a per-file PIN. Clients will need to enter both the room PIN and the file PIN to download.

Technical
---------

What technologies does WifiX use?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Backend:**
- Flask (Python web framework)
- Flask-SocketIO (real-time communication)
- Zeroconf (mDNS/Bonjour)
- Flask-Limiter (rate limiting)

**Frontend:**
- React 18
- Vite (build tool)
- Socket.IO Client
- Modern JavaScript (ES6+)

Can I run WifiX on a Raspberry Pi?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! WifiX works great on Raspberry Pi:

.. code-block:: bash

   # Install dependencies
   sudo apt update
   sudo apt install python3 python3-pip nodejs npm
   
   # Clone and run WifiX
   git clone https://github.com/mehmoodulhaq570/WifiX.git
   cd WifiX/backend
   pip3 install -r requirements.txt
   python3 app.py

Does WifiX work offline?
~~~~~~~~~~~~~~~~~~~~~~~~~

Yes, completely offline. You just need a local network (router/switch). Even without internet, as long as devices are on the same LAN, WifiX works perfectly.

Can I access WifiX from outside my network?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

By default, no. WifiX is designed for LAN use only. To access externally, you would need to:

1. Set up port forwarding on your router
2. Configure HTTPS
3. Use a VPN

**Warning:** Exposing to internet increases security risks.

What's mDNS/Bonjour?
~~~~~~~~~~~~~~~~~~~~

mDNS (Multicast DNS) / Bonjour allows devices to discover services on a local network without needing to know IP addresses. WifiX advertises itself via mDNS, so clients can connect using room codes or ``.local`` addresses instead of IP addresses.

Troubleshooting
---------------

Why can't other devices connect?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Common causes:

1. **Different network:** Ensure all devices on same WiFi/LAN
2. **Firewall:** Allow ports 5000 and 5173
3. **HOST setting:** Must be ``0.0.0.0``, not ``127.0.0.1``
4. **IP address:** Use server's LAN IP, not localhost

See :doc:`troubleshooting` for detailed solutions.

Upload/download is very slow. Why?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Check:

1. **Network speed:** WiFi distance, interference
2. **Other traffic:** Close bandwidth-heavy apps
3. **Device performance:** Older devices may be slower
4. **Wired vs wireless:** Ethernet is always faster

Files disappear after a while. Why?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Check ``FILE_TTL_SECONDS`` in your configuration. If set, files auto-delete after that time. Set to ``0`` to disable auto-deletion:

.. code-block:: bash

   FILE_TTL_SECONDS=0

Can I use a different port?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes:

.. code-block:: bash

   # Backend
   PORT=8080
   
   # Frontend: Edit vite.config.js
   server: { port: 3000 }

Comparison
----------

WifiX vs Cloud Storage (Dropbox, Google Drive)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1

   * - Feature
     - WifiX
     - Cloud Storage
   * - Speed
     - LAN speed (fast)
     - Internet speed (slower)
   * - Internet required
     - No
     - Yes
   * - File size limits
     - Configurable (100 MB - 1 GB+)
     - Often 15 GB free tier
   * - Privacy
     - Files stay on LAN
     - Stored on remote servers
   * - Setup
     - Quick (5 minutes)
     - Account creation needed
   * - Cost
     - Free
     - Free tier limited

WifiX vs USB Drives
~~~~~~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1

   * - Feature
     - WifiX
     - USB Drive
   * - Physical access
     - Not needed
     - Required
   * - Multiple recipients
     - Simultaneous
     - One at a time
   * - Speed
     - Network dependent
     - USB 3.0: ~100 MB/s
   * - Virus risk
     - Lower
     - Higher (common vector)
   * - Convenience
     - High (wireless)
     - Medium (physical)

WifiX vs Email
~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1

   * - Feature
     - WifiX
     - Email
   * - File size
     - 100 MB - 1 GB+
     - Usually 25 MB limit
   * - Speed
     - LAN speed
     - Internet + email processing
   * - Recipients
     - Unlimited
     - Can clog inboxes
   * - Setup
     - Quick
     - Need email addresses
   * - Clutter
     - No inbox clutter
     - Email overload

Contributing
------------

Can I contribute to WifiX?
~~~~~~~~~~~~~~~~~~~~~~~~~~

Absolutely! WifiX is open source. Check out :doc:`development/contributing` for guidelines.

How do I report bugs?
~~~~~~~~~~~~~~~~~~~~~

Open an issue on `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_ with:

- Operating system
- Python & Node.js versions
- Steps to reproduce
- Error messages

Can I request features?
~~~~~~~~~~~~~~~~~~~~~~~~

Yes! Open a feature request on GitHub Issues. Popular requests:

- Client upload capability
- QR code room joining
- File previews
- Built-in HTTPS support
- Multi-room support

Licensing
---------

Can I use WifiX commercially?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! The MIT License allows commercial use. You can:

- Use it in your company
- Charge for hosting services
- Include it in commercial products
- Modify for commercial purposes

See :doc:`license` for full details.

Can I modify WifiX?
~~~~~~~~~~~~~~~~~~~

Yes! You can freely modify the source code. If you make improvements, consider contributing back to the project.

Still Have Questions?
---------------------

- Check :doc:`troubleshooting` for technical issues
- Read the full documentation: :doc:`index`
- Ask on `GitHub Discussions <https://github.com/mehmoodulhaq570/WifiX/discussions>`_
- Open an issue: `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_
