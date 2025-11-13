Security Guide
==============

Understanding and implementing security best practices for WifiX.

Security Model
--------------

WifiX Security Layers
~~~~~~~~~~~~~~~~~~~~~

1. **Network Isolation** - LAN-only by default
2. **Authentication** - PIN-based access control
3. **Session Management** - Secure session cookies
4. **Rate Limiting** - Abuse prevention
5. **File Protection** - Optional per-file PINs
6. **CORS** - Cross-origin protection

Threat Model
~~~~~~~~~~~~

**Protected Against:**

- Unauthorized LAN access (PIN required)
- Brute force attacks (rate limiting)
- Cross-site requests (CORS)
- Session hijacking (secure cookies)
- File enumeration (authentication required)

**Not Protected Against (by default):**

- Network sniffing (no HTTPS by default)
- Insider threats (trusted network assumed)
- Physical access to server
- Compromised network devices
- Man-in-the-middle attacks (without HTTPS)

Authentication
--------------

Room PIN
~~~~~~~~

**Purpose:** Control access to the room

**Configuration:**

.. code-block:: bash

   # backend/.env
   ACCESS_PIN=your-secure-pin

**Best Practices:**

✅ **Do:**

- Use 6+ character PINs
- Mix letters and numbers
- Change regularly
- Don't use obvious codes (1234, 0000)
- Keep PIN confidential

❌ **Don't:**

- Use default PIN (1234)
- Share publicly
- Reuse across sessions
- Write on public boards
- Use personal info (birthdays, etc.)

**PIN Strength Examples:**

.. code-block:: text

   ❌ Weak:   1234, 0000, admin, password
   ⚠️ Medium: class2024, meet123, room42
   ✅ Strong: K7mP2n, X9kL4v, R3bT8s

File PIN
~~~~~~~~

**Purpose:** Additional protection for sensitive files

**Usage:**

1. Set PIN when uploading file
2. File marked with 🔒 icon
3. Clients need both room PIN and file PIN

**When to Use:**

- Confidential documents
- Financial information
- Personal data
- Sensitive presentations
- Private photos/videos

**Example:**

.. code-block:: text

   Room: HELLO6
   Room PIN: secure123
   
   Files:
   📄 public_notes.pdf (no file PIN)
   📊 budget_2024.xlsx (file PIN: fin2024)
   📄 meeting_notes.pdf (no file PIN)

Network Security
----------------

LAN-Only Operation
~~~~~~~~~~~~~~~~~~

WifiX operates on local network only by default.

**Advantages:**

- No internet exposure
- Fast transfers
- Privacy maintained
- No cloud storage

**Limitations:**

- Devices must be on same network
- Cannot access remotely
- Network security = your security

Firewall Configuration
~~~~~~~~~~~~~~~~~~~~~~

**Windows Firewall:**

1. Control Panel → Windows Defender Firewall
2. "Allow an app through firewall"
3. Add Python (backend) and Node.js (frontend)
4. Enable for Private networks only

**macOS Firewall:**

1. System Preferences → Security & Privacy → Firewall
2. Enable Firewall
3. Firewall Options
4. Add Python and Node.js
5. Allow incoming connections

**Linux (ufw):**

.. code-block:: bash

   # Allow specific ports
   sudo ufw allow 5000/tcp
   sudo ufw allow 5173/tcp
   
   # Or allow from specific subnet only
   sudo ufw allow from 192.168.1.0/24 to any port 5000
   sudo ufw allow from 192.168.1.0/24 to any port 5173

Network Isolation
~~~~~~~~~~~~~~~~~

**Recommended Setup:**

- Use separate VLAN for file sharing
- Enable guest network isolation
- Disable internet access on file sharing network
- Use WPA3 WiFi encryption

HTTPS/TLS
---------

Enabling HTTPS
~~~~~~~~~~~~~~

For production or sensitive data:

**Option 1: Self-Signed Certificate**

.. code-block:: bash

   # Generate certificate
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   
   # Update Flask to use HTTPS
   # app.py
   if __name__ == '__main__':
       socketio.run(app, 
                   host='0.0.0.0', 
                   port=5000,
                   ssl_context=('cert.pem', 'key.pem'))

**Option 2: Let's Encrypt** (for public deployments)

See :doc:`../development/deployment` for full HTTPS setup.

**Impact:**

- Encrypted traffic
- Prevents network sniffing
- Required for sensitive data
- Browser warnings (self-signed)

Session Security
----------------

Session Management
~~~~~~~~~~~~~~~~~~

WifiX uses Flask sessions with:

- Secure session cookies
- HTTP-only flag (prevents XSS)
- SameSite attribute
- Configurable expiration

**Configuration:**

.. code-block:: python

   # app.py
   app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only
   app.config['SESSION_COOKIE_HTTPONLY'] = True
   app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
   app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

Secret Key
~~~~~~~~~~

**Critical:** Change the secret key from default!

.. code-block:: bash

   # Generate secure secret key
   python -c "import secrets; print(secrets.token_hex(32))"
   
   # Add to backend/.env
   SECRET_KEY=<generated-key-here>

**Never:**

- Commit secret key to git
- Share secret key publicly
- Use default/weak keys
- Reuse keys across projects

Rate Limiting
-------------

Protection Against Abuse
~~~~~~~~~~~~~~~~~~~~~~~~

Built-in rate limits:

.. code-block:: text

   Upload:  10 requests per minute
   Delete:  20 requests per minute
   Global:  200 requests per day
   Global:  50 requests per hour

**Configuration:**

.. code-block:: bash

   # backend/.env
   RATELIMIT_ENABLED=true
   RATELIMIT_STORAGE_URL=memory://

**Redis (recommended for production):**

.. code-block:: bash

   RATELIMIT_STORAGE_URL=redis://localhost:6379

Bypass Rate Limits
~~~~~~~~~~~~~~~~~~

For trusted IPs (production only):

.. code-block:: python

   # app.py
   @limiter.request_filter
   def ip_whitelist():
       return request.remote_addr in ['192.168.1.10', '192.168.1.11']

Data Protection
---------------

File Storage
~~~~~~~~~~~~

**Default Storage:**

- Files stored in ``backend/uploads/``
- Temporary storage
- Auto-deletion supported (TTL)

**Best Practices:**

✅ **Do:**

- Enable FILE_TTL_SECONDS
- Delete files after session
- Use encrypted filesystem
- Regular cleanup
- Set appropriate permissions

❌ **Don't:**

- Store permanently without cleanup
- Use world-readable permissions
- Keep sensitive files indefinitely
- Share upload directory

**Linux Permissions:**

.. code-block:: bash

   chmod 700 backend/uploads/    # Owner only
   chmod 600 backend/uploads/*   # Files owner-only

File Encryption
~~~~~~~~~~~~~~~

**Current:** Not encrypted at rest by default

**Options:**

1. **Filesystem Encryption:** Use encrypted partition
2. **Application Encryption:** Encrypt before upload
3. **Future Feature:** Built-in encryption (planned)

Sensitive Data Handling
~~~~~~~~~~~~~~~~~~~~~~~

For sensitive files:

1. **Enable per-file PIN**
2. **Use strong file PINs**
3. **Enable HTTPS**
4. **Short TTL** (auto-delete quickly)
5. **Verify recipient** before sharing
6. **Delete immediately** after transfer

Audit & Monitoring
------------------

Logging
~~~~~~~

**Enable Logging:**

.. code-block:: python

   # app.py
   import logging
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
       filename='wifix.log'
   )

**What to Log:**

- Authentication attempts
- File uploads/downloads
- Client connections
- Errors and exceptions
- Rate limit violations

**Example Log:**

.. code-block:: text

   2025-11-13 10:30:15 - INFO - Client connected: 192.168.1.105
   2025-11-13 10:30:20 - INFO - File uploaded: document.pdf (2.5 MB)
   2025-11-13 10:30:45 - WARNING - Failed auth attempt from 192.168.1.110
   2025-11-13 10:31:00 - INFO - File downloaded: document.pdf by 192.168.1.105

Monitoring
~~~~~~~~~~

**Monitor:**

- Connected client count
- Active downloads
- Failed authentication attempts
- Rate limit hits
- Disk space usage
- Server resource usage

**Alerts:**

- Multiple failed auth attempts
- Unusual client count
- Disk space low
- High CPU/memory usage

Security Checklist
------------------

Pre-Deployment
~~~~~~~~~~~~~~

.. code-block:: text

   ☐ Change SECRET_KEY from default
   ☐ Set strong ACCESS_PIN
   ☐ Configure FILE_TTL_SECONDS
   ☐ Enable rate limiting
   ☐ Configure CORS_ORIGINS appropriately
   ☐ Set up firewall rules
   ☐ Test authentication
   ☐ Review file permissions
   ☐ Enable logging
   ☐ Test HTTPS (if used)

During Operation
~~~~~~~~~~~~~~~~

.. code-block:: text

   ☐ Monitor connected clients
   ☐ Check failed auth attempts
   ☐ Review logs regularly
   ☐ Monitor disk space
   ☐ Delete old files
   ☐ Verify room codes not leaked
   ☐ Check for unusual activity

After Session
~~~~~~~~~~~~~

.. code-block:: text

   ☐ Stop server
   ☐ Delete uploaded files
   ☐ Review logs
   ☐ Change PIN for next session
   ☐ Clear old sessions
   ☐ Check no files remain

Common Security Scenarios
-------------------------

Classroom Use
~~~~~~~~~~~~~

**Security Setup:**

- Moderate PIN (written on board)
- No file PINs (public materials)
- Short TTL (class duration)
- Monitor student connections
- Delete files after class

**Risk Level:** Low (public educational content)

Corporate Meeting
~~~~~~~~~~~~~~~~~

**Security Setup:**

- Strong room PIN (shared via invite)
- File PINs for confidential docs
- HTTPS enabled
- Longer TTL (24 hours)
- Delete sensitive files immediately

**Risk Level:** Medium (some sensitive content)

Executive Briefing
~~~~~~~~~~~~~~~~~~

**Security Setup:**

- Very strong room PIN
- File PIN on ALL documents
- HTTPS required
- Very short TTL (1 hour)
- Encrypted filesystem
- Monitor all access
- Delete all files after meeting

**Risk Level:** High (highly sensitive content)

Reporting Security Issues
-------------------------

Found a security vulnerability?

**DO:**

1. **Email:** Report privately (don't open public issue)
2. **Details:** Provide steps to reproduce
3. **Wait:** Allow time for fix before disclosure
4. **Credit:** Get acknowledged in changelog

**DON'T:**

- Post on GitHub Issues
- Share on social media
- Exploit the vulnerability
- Disclose before fix

**Contact:** See repository for security contact

See Also
--------

- :doc:`configuration` - Security configuration options
- :doc:`../development/deployment` - Production deployment with HTTPS
- :doc:`../troubleshooting` - Security-related issues
