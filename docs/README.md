# WifiX Documentation

This directory contains the complete documentation for WifiX built with Sphinx and hosted on Read the Docs.

## 📚 Documentation Structure

```
docs/
├── conf.py                 # Sphinx configuration
├── index.rst              # Documentation homepage
├── requirements.txt       # Documentation dependencies
├── Makefile              # Unix/macOS build commands
├── make.bat              # Windows build commands
├── _static/              # Static files (CSS, images)
│   └── custom.css        # Custom styling
├── _templates/           # Custom HTML templates
├── user-guide/           # User documentation
│   ├── installation.rst
│   ├── quickstart.rst
│   ├── configuration.rst
│   ├── host-workflow.rst
│   ├── client-workflow.rst
│   ├── features.rst
│   └── security.rst
├── api/                  # API documentation
│   ├── rest-api.rst
│   ├── websocket-events.rst
│   ├── python-sdk.rst
│   └── examples.rst
├── development/          # Developer guides
│   ├── architecture.rst
│   ├── contributing.rst
│   ├── testing.rst
│   └── deployment.rst
├── troubleshooting.rst   # Common issues & solutions
├── faq.rst              # Frequently asked questions
├── changelog.rst        # Version history
└── license.rst          # License information
```

## 🚀 Building Documentation Locally

### Prerequisites

- Python 3.8+
- pip

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Build HTML Documentation

**Unix/macOS/Linux:**

```bash
make html
```

**Windows:**

```batch
make.bat html
```

The built documentation will be in `_build/html/`. Open `_build/html/index.html` in your browser.

### Other Build Formats

```bash
# Build PDF (requires LaTeX)
make latexpdf

# Build EPUB
make epub

# Build plain text
make text

# Clean build directory
make clean
```

## 🌐 Publishing to Read the Docs

### Initial Setup

1. **Create Read the Docs account** at https://readthedocs.org/
2. **Connect GitHub repository:**

   - Go to "Import a Project"
   - Select "mehmoodulhaq570/WifiX"
   - Click "Import"

3. **Configure project:**
   - Admin → Advanced Settings
   - Python version: 3.13
   - Check "Build documentation with Sphinx"

### Configuration File

The `.readthedocs.yaml` in the root directory handles automatic builds:

```yaml
version: 2

build:
  os: ubuntu-24.04
  tools:
    python: "3.13"

python:
  install:
    - requirements: docs/requirements.txt

sphinx:
  configuration: docs/conf.py
```

### Automatic Builds

Read the Docs automatically builds documentation when you:

- Push to `main` branch
- Create a new tag
- Open a pull request (PR builds)

### Versioning

Read the Docs automatically creates versions for:

- **Latest:** Main branch (development)
- **Stable:** Latest git tag
- **Branches:** Feature branches (if enabled)
- **Tags:** Release versions (v1.0.0, v1.1.0, etc.)

## 📝 Writing Documentation

### reStructuredText (RST) Basics

**Headers:**

```rst
Chapter Title
=============

Section Title
-------------

Subsection Title
~~~~~~~~~~~~~~~~

Subsubsection Title
^^^^^^^^^^^^^^^^^^^
```

**Links:**

```rst
External link: `Read the Docs <https://readthedocs.org/>`_
Internal link: :doc:`installation`
```

**Code Blocks:**

```rst
.. code-block:: python

   def hello():
       print("Hello, WifiX!")
```

**Admonitions:**

```rst
.. note::
   This is a note.

.. warning::
   This is a warning.

.. tip::
   This is a helpful tip.
```

**Lists:**

```rst
- Bullet item 1
- Bullet item 2

1. Numbered item 1
2. Numbered item 2
```

**Tables:**

```rst
.. list-table::
   :header-rows: 1

   * - Column 1
     - Column 2
   * - Data 1
     - Data 2
```

### Markdown Support

Thanks to `myst-parser`, you can also write in Markdown (`.md` files):

````markdown
# Header

**Bold text**

[Link](https://example.com)

```python
code_block()
```
````

````

## 🎨 Customization

### Theme Configuration

Edit `conf.py` to customize the theme:

```python
html_theme_options = {
    'logo_only': False,
    'display_version': True,
    'style_nav_header_background': '#2980B9',
    'navigation_depth': 4,
}
````

### Custom CSS

Add styles to `_static/custom.css`:

```css
/* Custom colors */
:root {
  --wifix-primary: #2980b9;
}

/* Custom styling */
.rst-content pre.literal-block {
  border-left: 4px solid var(--wifix-primary);
}
```

### Logo and Favicon

Add logo and favicon to `_static/`:

```python
# In conf.py
html_logo = '_static/logo.png'
html_favicon = '_static/favicon.ico'
```

## 🔍 Sphinx Extensions

Currently enabled extensions:

- **sphinx.ext.autodoc** - Auto-generate docs from docstrings
- **sphinx.ext.napoleon** - Support Google/NumPy docstring styles
- **sphinx.ext.viewcode** - Add source code links
- **sphinx.ext.githubpages** - Publish to GitHub Pages
- **sphinx.ext.intersphinx** - Link to other projects' docs
- **sphinx.ext.todo** - TODO items support
- **myst_parser** - Markdown support

Add more in `conf.py`:

```python
extensions = [
    # ... existing extensions
    'sphinx.ext.graphviz',  # Graph diagrams
    'sphinx.ext.coverage',  # Documentation coverage
    'sphinx_copybutton',    # Copy button on code blocks
]
```

## 🧪 Testing Documentation

### Check for Warnings

```bash
make html SPHINXOPTS="-W"
```

This treats warnings as errors.

### Link Checking

```bash
make linkcheck
```

Verifies all external links are valid.

### Spell Checking

Install `sphinxcontrib-spelling`:

```bash
pip install sphinxcontrib-spelling
```

Add to `conf.py`:

```python
extensions.append('sphinxcontrib.spelling')
```

Run:

```bash
make spelling
```

## 📊 Documentation Metrics

### Coverage Report

```bash
make coverage
```

Shows which modules/functions lack documentation.

### Build Statistics

After building, check:

```
_build/html/
├── genindex.html      # Generated index
├── search.html        # Search page
└── py-modindex.html   # Python module index
```

## 🔧 Troubleshooting

### Build Fails

**Issue:** `sphinx-build: command not found`

**Solution:**

```bash
pip install --upgrade sphinx
```

### Read the Docs Build Fails

1. Check `.readthedocs.yaml` syntax
2. Verify `docs/requirements.txt` has all dependencies
3. Check Read the Docs build logs
4. Test locally first: `make html`

### Links Don't Work

**Issue:** `:doc:` links break

**Solution:**

- Use relative paths: `:doc:`installation``
- Don't include `.rst` extension
- Check file exists in same directory

### Theme Not Applied

**Issue:** Custom CSS not loading

**Solution:**

```python
# In conf.py
html_static_path = ['_static']
html_css_files = ['custom.css']
```

## 📖 Documentation Best Practices

### ✅ Do:

- Use clear, concise language
- Include code examples
- Add cross-references to related sections
- Keep headers consistent
- Use admonitions for warnings/tips
- Test all code examples

### ❌ Don't:

- Use very long code blocks (break into smaller sections)
- Forget to update changelog
- Leave broken links
- Use inconsistent terminology
- Skip version numbers in examples

## 🤝 Contributing to Documentation

1. **Fork the repository**
2. **Create a branch:**

   ```bash
   git checkout -b docs/improve-quickstart
   ```

3. **Make changes** to `.rst` files
4. **Test locally:**

   ```bash
   make html
   ```

5. **Commit and push:**

   ```bash
   git add docs/
   git commit -m "Improve quickstart guide"
   git push origin docs/improve-quickstart
   ```

6. **Open Pull Request** on GitHub

## 📚 Resources

- **Sphinx Documentation:** https://www.sphinx-doc.org/
- **Read the Docs Guide:** https://docs.readthedocs.io/
- **reStructuredText Primer:** https://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html
- **Sphinx RTD Theme:** https://sphinx-rtd-theme.readthedocs.io/
- **MyST Parser:** https://myst-parser.readthedocs.io/

## 📞 Need Help?

- Open an issue: https://github.com/mehmoodulhaq570/WifiX/issues
- Discussions: https://github.com/mehmoodulhaq570/WifiX/discussions
- Read the Docs support: https://docs.readthedocs.io/page/support.html

## 📄 License

Documentation is licensed under MIT License, same as the WifiX project.

Copyright © 2025 mehmoodulhaq570
