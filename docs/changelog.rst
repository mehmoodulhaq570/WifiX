Changelog
=========

All notable changes to WifiX will be documented in this file.

The format is based on `Keep a Changelog <https://keepachangelog.com/en/1.0.0/>`_,
and this project adheres to `Semantic Versioning <https://semver.org/spec/v2.0.0.html>`_.

[1.0.0] - 2025-11-13
--------------------

Initial Release 🎉

Added
~~~~~

**Core Features**

- Flask backend server with RESTful API
- React frontend with Vite build system
- Real-time WebSocket communication via Socket.IO
- File upload and download functionality
- Room-based access with 6-character codes
- mDNS/Bonjour automatic network discovery
- PIN-based authentication system

**Security**

- Global room PIN protection
- Per-file PIN protection (optional)
- Session management
- Rate limiting (10 uploads/min, 20 deletes/min)
- CORS protection
- Secure file storage

**User Interface**

- Modern React-based UI
- Drag-and-drop file upload
- Real-time upload/download progress
- File list with metadata display
- Connected clients counter (host view)
- Responsive design for mobile devices
- Dark mode support

**Network Features**

- Automatic LAN IP detection
- mDNS service advertising
- Room code generation and management
- Multiple client support
- Simultaneous downloads

**Configuration**

- Environment variable configuration
- Customizable file size limits
- Configurable file TTL (time-to-live)
- CORS origins configuration
- Port and host configuration
- Rate limit customization

**Documentation**

- Complete Read the Docs documentation
- Installation guide for Windows, macOS, Linux
- Quick start guide
- Configuration reference
- API documentation (REST and WebSocket)
- Troubleshooting guide
- FAQ section

**Developer Tools**

- Docker support with docker-compose
- Development environment setup
- Testing infrastructure
- CI/CD pipeline ready
- Contributing guidelines

Security
~~~~~~~~

- Implemented Flask session security
- Added rate limiting to prevent abuse
- Secure random secret key generation
- File access control with PINs

Known Issues
~~~~~~~~~~~~

- HTTPS not enabled by default (requires manual setup)
- Client upload not supported (host-only upload)
- File previews not available
- No built-in compression for large files

[Unreleased]
------------

Planned
~~~~~~~

**Features Under Consideration**

- QR code generation for easy room joining
- File preview for images and PDFs
- Built-in HTTPS support
- Multi-room support (multiple servers on one host)
- File compression before transfer
- Transfer speed optimization
- Resume interrupted downloads
- Batch file operations
- Search and filter files
- File expiration notifications

**Improvements Being Evaluated**

- Client upload capability (with permissions)
- Mobile app (React Native)
- Desktop app (Electron)
- Built-in file encryption
- Transfer history and analytics
- Bandwidth throttling options
- Custom room names (instead of random codes)
- Integration with cloud storage
- API rate limit per user
- WebRTC peer-to-peer transfers

**Community Requests**

*Submit your feature requests on* `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_

Version History Summary
-----------------------

.. list-table::
   :header-rows: 1
   :widths: 15 20 65

   * - Version
     - Release Date
     - Highlights
   * - 1.0.0
     - 2025-11-13
     - Initial release with core functionality
   * - 0.9.0
     - 2025-11-10
     - Beta release for testing
   * - 0.5.0
     - 2025-11-05
     - Alpha release - internal testing
   * - 0.1.0
     - 2025-11-01
     - Proof of concept

Migration Guides
----------------

From 0.9.0 to 1.0.0
~~~~~~~~~~~~~~~~~~~

**Breaking Changes:**

None - first stable release

**New Features:**

- Added comprehensive documentation
- Improved error handling
- Enhanced security with rate limiting
- Better mobile responsiveness

**Upgrade Steps:**

.. code-block:: bash

   # Pull latest code
   git pull origin main
   
   # Update backend dependencies
   cd backend
   pip install --upgrade -r requirements.txt
   
   # Update frontend dependencies
   cd ../frontend
   npm install
   
   # Restart services
   # Backend
   python app.py
   
   # Frontend
   npm run dev

Development Roadmap
-------------------

Q1 2026
~~~~~~~

- QR code room joining
- File preview functionality
- Mobile app development starts
- Performance optimizations

Q2 2026
~~~~~~~

- Client upload with permissions
- Built-in HTTPS support
- File compression
- Transfer resume capability

Q3 2026
~~~~~~~

- Desktop application (Electron)
- Multi-room support
- Advanced analytics
- Built-in encryption

Q4 2026
~~~~~~~

- WebRTC peer-to-peer mode
- Cloud storage integration
- Enterprise features
- API v2 release

Contributing
------------

We welcome contributions! See :doc:`development/contributing` for how to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

Release Process
---------------

1. **Version Bump:** Update version in ``package.json`` and ``conf.py``
2. **Changelog:** Document all changes in this file
3. **Testing:** Run full test suite
4. **Tag:** Create git tag ``git tag v1.x.x``
5. **Release:** Push to GitHub and create release notes
6. **Deploy:** Update documentation on Read the Docs

Versioning
----------

WifiX uses `Semantic Versioning <https://semver.org/>`_:

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

Example:
- ``1.0.0`` → ``1.1.0`` (new features, backwards-compatible)
- ``1.1.0`` → ``1.1.1`` (bug fixes)
- ``1.1.1`` → ``2.0.0`` (breaking changes)

Support
-------

**Supported Versions:**

.. list-table::
   :header-rows: 1
   :widths: 20 20 60

   * - Version
     - Supported
     - Notes
   * - 1.0.x
     - ✅ Yes
     - Current stable release
   * - 0.9.x
     - ⚠️ Limited
     - Upgrade recommended
   * - < 0.9
     - ❌ No
     - Please upgrade

**Getting Support:**

- 📚 Documentation: https://wifix.readthedocs.io
- 🐛 Bug Reports: `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_
- 💬 Questions: `GitHub Discussions <https://github.com/mehmoodulhaq570/WifiX/discussions>`_
- 📧 Contact: mehmoodulhaq570

Acknowledgments
---------------

Special thanks to:

- The Flask and React communities
- Socket.IO team for real-time capabilities
- All contributors and testers
- Open source libraries we depend on

Dependencies
------------

**Backend:**

- Flask 3.0+
- Flask-SocketIO 5.3+
- Flask-CORS 4.0+
- python-socketio 5.9+
- Zeroconf 0.120+
- Flask-Limiter 3.5+

**Frontend:**

- React 18.2+
- Vite 5.0+
- Socket.IO Client 4.5+

**Full dependency list:** See ``requirements.txt`` and ``package.json``

License
-------

WifiX is released under the **MIT License**.

Copyright © 2025 mehmoodulhaq570

See :doc:`license` for full license text.
