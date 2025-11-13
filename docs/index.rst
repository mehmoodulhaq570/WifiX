WifiX Documentation
===================

.. image:: https://img.shields.io/badge/version-1.0.0-blue.svg
   :alt: Version 1.0.0

.. image:: https://img.shields.io/badge/python-3.8+-brightgreen.svg
   :alt: Python 3.8+

.. image:: https://img.shields.io/badge/license-MIT-green.svg
   :alt: MIT License

**WifiX** is a powerful and user-friendly LAN file sharing application that enables seamless file transfers between devices on the same network. Built with modern web technologies, it combines a robust Flask backend with an intuitive React frontend.

✨ Key Features
---------------

🚀 **Lightning Fast**
   Share files instantly over your local network without internet dependency

🔒 **Secure by Design**
   Built-in PIN protection, optional file-level encryption, and secure session management

📱 **Cross-Platform**
   Works on Windows, macOS, Linux - access via web browser from any device

🎯 **Zero Configuration**
   Automatic network discovery with mDNS/Bonjour, no manual IP configuration needed

💡 **Smart Room Codes**
   6-character memorable codes for easy connection sharing

⚡ **Real-Time Updates**
   WebSocket-powered live notifications for uploads, downloads, and client activity

🎨 **Beautiful Interface**
   Modern, responsive UI with drag-and-drop support and dark mode

📊 **Progress Tracking**
   Real-time upload/download progress with speed indicators

Quick Start
-----------

Get WifiX running in under 5 minutes:

.. code-block:: bash

   # Clone the repository
   git clone https://github.com/mehmoodulhaq570/WifiX.git
   cd WifiX

   # Install backend dependencies
   cd backend
   pip install -r requirements.txt

   # Start the server
   python app.py

   # In another terminal, start the frontend
   cd ../frontend
   npm install
   npm run dev

Visit ``http://localhost:5173`` in your browser and start sharing files! 🎉

.. toctree::
   :maxdepth: 2
   :caption: Getting Started
   :hidden:

   user-guide/installation
   user-guide/quickstart
   user-guide/configuration

.. toctree::
   :maxdepth: 2
   :caption: User Guide
   :hidden:

   user-guide/host-workflow
   user-guide/client-workflow
   user-guide/features
   user-guide/security

.. toctree::
   :maxdepth: 2
   :caption: API Reference
   :hidden:

   api/rest-api
   api/websocket-events
   api/python-sdk
   api/examples

.. toctree::
   :maxdepth: 2
   :caption: Development
   :hidden:

   development/architecture
   development/contributing
   development/testing
   development/deployment

.. toctree::
   :maxdepth: 1
   :caption: Help & Support
   :hidden:

   troubleshooting
   faq
   changelog
   license

Use Cases
---------

🎓 **Education**
   Teachers can quickly distribute files to students' devices in classroom settings

💼 **Business**
   Share presentations, documents, and files during meetings without email attachments

👨‍💻 **Development**
   Transfer builds, logs, and assets between development machines

🏠 **Home Network**
   Share photos, videos, and files between family devices

📸 **Content Creation**
   Quick transfer of large media files between editing workstations

Why WifiX?
----------

Traditional file sharing methods have limitations:

- **Email:** File size restrictions, inbox clutter
- **Cloud Storage:** Requires internet, privacy concerns, upload/download delays
- **USB Drives:** Physical access needed, can be lost or infected
- **Bluetooth:** Slow speeds, pairing hassles

WifiX solves these problems by leveraging your existing local network for fast, secure, direct file transfers.

Technology Stack
----------------

**Backend**

- **Flask 3.0+** - Lightweight Python web framework
- **Flask-SocketIO** - Real-time bidirectional communication
- **Flask-CORS** - Cross-origin resource sharing
- **Zeroconf** - mDNS/Bonjour service discovery
- **Flask-Limiter** - Rate limiting and abuse prevention

**Frontend**

- **React 18** - Modern UI component library
- **Vite** - Next-generation frontend tooling
- **Socket.IO Client** - Real-time event handling
- **TailwindCSS** - Utility-first styling (optional)

**Infrastructure**

- **WebSocket** - Real-time bi-directional communication
- **REST API** - Standard HTTP endpoints
- **mDNS** - Zero-configuration networking

Community & Support
-------------------

📚 **Documentation:** You're reading it! Comprehensive guides for all features

🐛 **Issue Tracker:** `GitHub Issues <https://github.com/mehmoodulhaq570/WifiX/issues>`_

💬 **Discussions:** `GitHub Discussions <https://github.com/mehmoodulhaq570/WifiX/discussions>`_

⭐ **Star on GitHub:** `mehmoodulhaq570/WifiX <https://github.com/mehmoodulhaq570/WifiX>`_

🤝 **Contributing:** See :doc:`development/contributing` for contribution guidelines

License
-------

WifiX is released under the **MIT License**. See :doc:`license` for details.

Copyright © 2025 mehmoodulhaq570

Indices and Tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
