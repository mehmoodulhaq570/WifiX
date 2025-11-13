# Contributing to WifiX

Thank you for considering contributing to WifiX! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Python version)

### Suggesting Features

Feature requests are welcome! Please include:

- Clear description of the feature
- Use case and benefits
- Any implementation ideas (optional)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**: `git commit -m "Add amazing feature"`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📝 Code Style

### Python (Backend)

- Follow [PEP 8](https://pep8.org/) style guide
- Use meaningful variable and function names
- Add docstrings to functions and classes
- Keep functions focused and small

```python
def upload_file(file_obj, pin=None):
    """
    Upload a file to the server.

    Args:
        file_obj: File object to upload
        pin: Optional PIN for file protection

    Returns:
        dict: Upload result with filename and URL
    """
    # Implementation
```

### JavaScript/React (Frontend)

- Use ES6+ features
- Functional components with hooks
- PropTypes for component props
- Descriptive component and function names

```jsx
import React, { useState } from "react";

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);

  // Component logic
}
```

### CSS (Tailwind)

- Use Tailwind utility classes
- Follow responsive design principles
- Use dark mode classes (`dark:`)
- Keep custom CSS minimal

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd frontend/react
npm test
```

### Manual Testing Checklist

- [ ] File upload works
- [ ] File download works
- [ ] File deletion works with confirmation
- [ ] Host/client connection flow
- [ ] QR code generation
- [ ] Dark mode toggle
- [ ] PIN authentication (if enabled)
- [ ] WebSocket real-time updates
- [ ] Mobile responsiveness

## 📂 Project Structure

```
WifiX/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── uploads/           # File storage
├── frontend/react/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json       # Node dependencies
└── docs/                  # Documentation
```

## 🎯 Development Workflow

1. **Set up development environment**

   ```bash
   # Backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r backend/requirements.txt

   # Frontend
   cd frontend/react
   npm install
   ```

2. **Run development servers**

   ```bash
   # Terminal 1: Backend
   python backend/app.py

   # Terminal 2: Frontend
   cd frontend/react
   npm run dev
   ```

3. **Make changes**

   - Backend: Edit Python files in `backend/`
   - Frontend: Edit React files in `frontend/react/src/`

4. **Test your changes**

   - Manual testing in browser
   - Run automated tests
   - Check console for errors

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin your-branch-name
   ```

## 🐛 Debugging Tips

### Backend Issues

- Check Flask logs in terminal
- Use `logger.info()` and `logger.error()` for debugging
- Test API endpoints with curl or Postman

### Frontend Issues

- Open browser DevTools (F12)
- Check Console tab for errors
- Use React DevTools extension
- Check Network tab for API calls

### WebSocket Issues

- Check Socket.IO connection status
- Monitor WebSocket frames in Network tab
- Verify CORS settings

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

- `feat: Add per-file PIN protection`
- `fix: Resolve duplicate file upload issue`
- `docs: Update installation instructions`
- `style: Format code with prettier`
- `refactor: Simplify file upload logic`
- `test: Add tests for file deletion`
- `chore: Update dependencies`

## 🔍 Code Review Process

Pull requests will be reviewed for:

- Code quality and style
- Functionality and correctness
- Test coverage
- Documentation updates
- Breaking changes (require major version bump)

## 📖 Documentation

When adding features:

- Update `README.md` if setup/usage changes
- Update `FEATURES.md` with feature description
- Add comments for complex code
- Update API documentation if endpoints change

## 🚀 Release Process

1. Update version in `package.json` and documentation
2. Update `CHANGELOG.md` with changes
3. Create release tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with notes

## 💬 Communication

- **Issues**: For bug reports and feature requests
- **Pull Requests**: For code contributions
- **Discussions**: For questions and ideas

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## ❓ Questions?

If you have questions about contributing, feel free to:

- Open an issue with the `question` label
- Check existing documentation
- Review closed issues for similar questions

---

Thank you for contributing to WifiX! 🎉
