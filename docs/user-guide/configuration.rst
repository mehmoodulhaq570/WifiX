Configuration Guide
===================

WifiX can be configured through environment variables and configuration files.

Environment Variables
---------------------

Backend Configuration
~~~~~~~~~~~~~~~~~~~~~

Create a ``.env`` file in the ``backend`` directory:

.. code-block:: bash

   # Server Configuration
   PORT=5000
   HOST=0.0.0.0
   FLASK_ENV=development
   
   # Security
   SECRET_KEY=your-secret-key-change-this
   ACCESS_PIN=1234
   
   # File Upload
   MAX_CONTENT_LENGTH=104857600  # 100 MB in bytes
   UPLOAD_FOLDER=uploads
   FILE_TTL_SECONDS=3600  # 1 hour
   
   # CORS
   CORS_ORIGINS=http://localhost:5173,http://localhost:5174
   
   # Rate Limiting
   RATELIMIT_ENABLED=true
   RATELIMIT_STORAGE_URL=memory://
   
   # mDNS/Bonjour
   MDNS_ENABLED=true
   SERVICE_NAME=WifiX
   
   # Room Codes
   ROOM_CODE_LENGTH=6
   ROOM_CODE_TTL=86400  # 24 hours

Core Settings
~~~~~~~~~~~~~

PORT
^^^^

**Description:** Port number for the Flask server

**Default:** ``5000``

**Values:** Any available port (1024-65535 recommended)

.. code-block:: bash

   PORT=5000

**Example:** Use port 8080 instead:

.. code-block:: bash

   PORT=8080

HOST
^^^^

**Description:** Host address to bind the server

**Default:** ``0.0.0.0`` (all network interfaces)

**Values:** 
- ``0.0.0.0`` - Listen on all interfaces (LAN accessible)
- ``127.0.0.1`` - Localhost only (not accessible from network)
- Specific IP - Bind to specific interface

.. code-block:: bash

   HOST=0.0.0.0

FLASK_ENV
^^^^^^^^^

**Description:** Flask environment mode

**Default:** ``development``

**Values:** 
- ``development`` - Debug mode, auto-reload
- ``production`` - Optimized, no debug info

.. code-block:: bash

   FLASK_ENV=production

Security Settings
~~~~~~~~~~~~~~~~~

SECRET_KEY
^^^^^^^^^^

**Description:** Flask session encryption key

**Default:** None (must be set!)

**Values:** Random string (32+ characters recommended)

.. code-block:: bash

   SECRET_KEY=your-very-long-random-secret-key-here

**Generate secure key:**

.. code-block:: python

   python -c "import secrets; print(secrets.token_hex(32))"

.. warning::
   Never commit the secret key to version control! Use ``.env`` file.

ACCESS_PIN
^^^^^^^^^^

**Description:** Global PIN for room access

**Default:** ``1234``

**Values:** Any string (4-10 digits recommended)

.. code-block:: bash

   ACCESS_PIN=secure123

**Disable PIN (not recommended):**

.. code-block:: bash

   ACCESS_PIN=

File Upload Settings
~~~~~~~~~~~~~~~~~~~~

MAX_CONTENT_LENGTH
^^^^^^^^^^^^^^^^^^

**Description:** Maximum upload file size in bytes

**Default:** ``104857600`` (100 MB)

**Values:** Any positive integer

.. code-block:: bash

   # 100 MB (default)
   MAX_CONTENT_LENGTH=104857600
   
   # 500 MB
   MAX_CONTENT_LENGTH=524288000
   
   # 1 GB
   MAX_CONTENT_LENGTH=1073741824

**Conversion table:**

.. list-table::
   :header-rows: 1
   :widths: 30 40 30

   * - Size
     - Bytes
     - Configuration
   * - 50 MB
     - 52,428,800
     - ``MAX_CONTENT_LENGTH=52428800``
   * - 100 MB
     - 104,857,600
     - ``MAX_CONTENT_LENGTH=104857600``
   * - 250 MB
     - 262,144,000
     - ``MAX_CONTENT_LENGTH=262144000``
   * - 500 MB
     - 524,288,000
     - ``MAX_CONTENT_LENGTH=524288000``
   * - 1 GB
     - 1,073,741,824
     - ``MAX_CONTENT_LENGTH=1073741824``

UPLOAD_FOLDER
^^^^^^^^^^^^^

**Description:** Directory to store uploaded files

**Default:** ``uploads``

**Values:** Relative or absolute path

.. code-block:: bash

   UPLOAD_FOLDER=uploads
   
   # Absolute path
   UPLOAD_FOLDER=/var/wifix/uploads
   
   # Windows
   UPLOAD_FOLDER=C:\WifiX\uploads

FILE_TTL_SECONDS
^^^^^^^^^^^^^^^^

**Description:** Time before files are automatically deleted

**Default:** ``3600`` (1 hour)

**Values:** Seconds (0 = never delete automatically)

.. code-block:: bash

   # 1 hour
   FILE_TTL_SECONDS=3600
   
   # 24 hours
   FILE_TTL_SECONDS=86400
   
   # Disable auto-deletion
   FILE_TTL_SECONDS=0

CORS Settings
~~~~~~~~~~~~~

CORS_ORIGINS
^^^^^^^^^^^^

**Description:** Allowed origins for CORS requests

**Default:** ``http://localhost:5173``

**Values:** Comma-separated list of URLs

.. code-block:: bash

   CORS_ORIGINS=http://localhost:5173,http://localhost:5174
   
   # Allow specific IP
   CORS_ORIGINS=http://192.168.1.100:5173
   
   # Multiple origins
   CORS_ORIGINS=http://localhost:5173,http://192.168.1.100:5173,http://10.0.0.50:5173

Rate Limiting
~~~~~~~~~~~~~

RATELIMIT_ENABLED
^^^^^^^^^^^^^^^^^

**Description:** Enable/disable rate limiting

**Default:** ``true``

**Values:** ``true`` or ``false``

.. code-block:: bash

   RATELIMIT_ENABLED=true

RATELIMIT_STORAGE_URL
^^^^^^^^^^^^^^^^^^^^^

**Description:** Storage backend for rate limit data

**Default:** ``memory://``

**Values:**
- ``memory://`` - In-memory (simple, lost on restart)
- ``redis://localhost:6379`` - Redis (persistent, scalable)

.. code-block:: bash

   # In-memory (development)
   RATELIMIT_STORAGE_URL=memory://
   
   # Redis (production)
   RATELIMIT_STORAGE_URL=redis://localhost:6379

**Rate Limit Rules:**

.. code-block:: python

   # Default limits (in app.py)
   - Upload: 10 per minute
   - Delete: 20 per minute
   - Global: 200 per day, 50 per hour

Network Discovery
~~~~~~~~~~~~~~~~~

MDNS_ENABLED
^^^^^^^^^^^^

**Description:** Enable mDNS/Bonjour service discovery

**Default:** ``true``

**Values:** ``true`` or ``false``

.. code-block:: bash

   MDNS_ENABLED=true

SERVICE_NAME
^^^^^^^^^^^^

**Description:** Service name for mDNS advertising

**Default:** ``WifiX``

**Values:** Any string (alphanumeric recommended)

.. code-block:: bash

   SERVICE_NAME=WifiX
   
   # Custom name
   SERVICE_NAME=OfficeFileShare

Room Code Settings
~~~~~~~~~~~~~~~~~~

ROOM_CODE_LENGTH
^^^^^^^^^^^^^^^^

**Description:** Length of generated room codes

**Default:** ``6``

**Values:** 4-10 (6 recommended for balance)

.. code-block:: bash

   ROOM_CODE_LENGTH=6

ROOM_CODE_TTL
^^^^^^^^^^^^^

**Description:** Room code expiration time in seconds

**Default:** ``86400`` (24 hours)

**Values:** Seconds

.. code-block:: bash

   # 24 hours
   ROOM_CODE_TTL=86400
   
   # 1 week
   ROOM_CODE_TTL=604800

Frontend Configuration
----------------------

Vite Configuration
~~~~~~~~~~~~~~~~~~

Edit ``frontend/vite.config.js``:

.. code-block:: javascript

   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 5173,
       host: '0.0.0.0',  // Listen on all interfaces
       proxy: {
         '/api': {
           target: 'http://localhost:5000',
           changeOrigin: true,
         },
         '/socket.io': {
           target: 'http://localhost:5000',
           changeOrigin: true,
           ws: true,
         }
       }
     }
   })

Environment Variables
~~~~~~~~~~~~~~~~~~~~~

Create ``frontend/.env``:

.. code-block:: bash

   VITE_API_URL=http://localhost:5000
   VITE_WS_URL=http://localhost:5000

Configuration Examples
----------------------

Development Environment
~~~~~~~~~~~~~~~~~~~~~~~

**backend/.env:**

.. code-block:: bash

   PORT=5000
   HOST=0.0.0.0
   FLASK_ENV=development
   SECRET_KEY=dev-secret-key-not-for-production
   ACCESS_PIN=1234
   MAX_CONTENT_LENGTH=104857600
   CORS_ORIGINS=http://localhost:5173,http://localhost:5174
   MDNS_ENABLED=true
   FILE_TTL_SECONDS=3600

**frontend/.env:**

.. code-block:: bash

   VITE_API_URL=http://localhost:5000
   VITE_WS_URL=http://localhost:5000

Production Environment
~~~~~~~~~~~~~~~~~~~~~~

**backend/.env:**

.. code-block:: bash

   PORT=5000
   HOST=0.0.0.0
   FLASK_ENV=production
   SECRET_KEY=<generate-with-secrets-token-hex>
   ACCESS_PIN=<strong-pin-here>
   MAX_CONTENT_LENGTH=524288000  # 500 MB
   CORS_ORIGINS=http://192.168.1.100:5173
   MDNS_ENABLED=true
   FILE_TTL_SECONDS=0  # Manual deletion only
   RATELIMIT_ENABLED=true

Classroom/Educational
~~~~~~~~~~~~~~~~~~~~~

Optimized for teachers sharing with many students:

.. code-block:: bash

   PORT=5000
   HOST=0.0.0.0
   FLASK_ENV=production
   SECRET_KEY=<secret-key>
   ACCESS_PIN=class2024
   MAX_CONTENT_LENGTH=262144000  # 250 MB for PDFs/videos
   FILE_TTL_SECONDS=7200  # 2 hours (class duration)
   ROOM_CODE_LENGTH=5  # Shorter codes for whiteboards
   MDNS_ENABLED=true
   SERVICE_NAME=ClassroomShare

Office/Corporate
~~~~~~~~~~~~~~~~

Enterprise-focused with security:

.. code-block:: bash

   PORT=5000
   HOST=0.0.0.0
   FLASK_ENV=production
   SECRET_KEY=<strong-secret-key>
   ACCESS_PIN=<company-pin>
   MAX_CONTENT_LENGTH=1073741824  # 1 GB for large files
   FILE_TTL_SECONDS=0  # Keep until manually deleted
   RATELIMIT_ENABLED=true
   RATELIMIT_STORAGE_URL=redis://localhost:6379
   MDNS_ENABLED=false  # Explicit IP only for security
   CORS_ORIGINS=http://192.168.10.50:5173

Security Best Practices
-----------------------

Production Checklist
~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

   ✅ Change SECRET_KEY from default
   ✅ Set strong ACCESS_PIN (not 1234!)
   ✅ Use FLASK_ENV=production
   ✅ Enable HTTPS (see deployment guide)
   ✅ Configure firewall rules
   ✅ Enable rate limiting
   ✅ Restrict CORS_ORIGINS to known hosts
   ✅ Set reasonable MAX_CONTENT_LENGTH
   ✅ Configure FILE_TTL_SECONDS appropriately
   ✅ Regular security updates
   ✅ Monitor server logs

Strong Secret Key
~~~~~~~~~~~~~~~~~

Generate a cryptographically secure secret key:

.. code-block:: bash

   # Python
   python -c "import secrets; print(secrets.token_hex(32))"
   
   # Output example:
   # 8f7a9b2c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9

   # OpenSSL
   openssl rand -hex 32

Strong PIN
~~~~~~~~~~

.. code-block:: bash

   # Good PINs:
   ACCESS_PIN=secure789
   ACCESS_PIN=team2024!
   ACCESS_PIN=proj_alpha
   
   # Bad PINs:
   ACCESS_PIN=1234  # Too common
   ACCESS_PIN=0000  # Too simple
   ACCESS_PIN=admin  # Easily guessed

Troubleshooting
---------------

Configuration Not Loading
~~~~~~~~~~~~~~~~~~~~~~~~~

**Issue:** Environment variables not being used

**Solutions:**

.. code-block:: bash

   # Verify .env file location
   ls backend/.env
   
   # Check file contents
   cat backend/.env
   
   # Ensure python-dotenv is installed
   pip install python-dotenv
   
   # Load environment variables explicitly
   export $(cat backend/.env | xargs)  # Linux/macOS
   Get-Content backend/.env | ForEach-Object { $args = $_.Split('='); [Environment]::SetEnvironmentVariable($args[0], $args[1]) }  # Windows PowerShell

Port Already in Use
~~~~~~~~~~~~~~~~~~~

**Issue:** ``Address already in use``

**Solutions:**

.. code-block:: bash

   # Find process using port
   netstat -ano | findstr :5000  # Windows
   lsof -i :5000  # macOS/Linux
   
   # Kill the process or change port
   PORT=5001 python app.py

CORS Errors
~~~~~~~~~~~

**Issue:** ``Access-Control-Allow-Origin`` errors in browser

**Solutions:**

.. code-block:: bash

   # Add your frontend URL to CORS_ORIGINS
   CORS_ORIGINS=http://localhost:5173,http://192.168.1.100:5173
   
   # Check frontend is using correct API URL
   # frontend/.env
   VITE_API_URL=http://localhost:5000

See Also
--------

- :doc:`../development/deployment` - Production deployment guide
- :doc:`security` - Security configuration details
- :doc:`../troubleshooting` - Common issues and solutions
