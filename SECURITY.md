# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of WifiX seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Open a Public Issue

Security vulnerabilities should not be reported publicly to protect users.

### 2. Report Privately

Send details to: **[Your Email or Security Contact]**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next release

### 4. Disclosure

- We will work with you to understand and resolve the issue
- Credit will be given to reporters (unless anonymity is requested)
- Public disclosure after fix is deployed

## Security Best Practices

### For Users

#### Network Security

- **Only run WifiX on trusted networks**
- **Never expose to the internet without proper security**
- Use firewall rules to restrict access
- Monitor who connects to your server

#### Authentication

- **Enable PIN protection** for sensitive files:
  ```bash
  ACCESS_PIN=your-secure-pin python backend/app.py
  ```
- Use strong, unique PINs
- Don't share PINs over insecure channels
- Use per-file PIN protection for extra security

#### File Safety

- **Scan uploaded files** with antivirus
- Be cautious about what files you upload
- Review file list regularly
- Delete files when no longer needed

#### Updates

- Keep WifiX updated to latest version
- Monitor security announcements
- Update dependencies regularly

### For Developers

#### Code Security

**Input Validation**

```python
# Always validate and sanitize user input
filename = secure_filename(file.filename)
if not allowed_file(filename):
    return jsonify({'error': 'invalid file type'}), 400
```

**Path Traversal Prevention**

```python
# Ensure file paths are within upload directory
dest = (uploads / filename).resolve()
if not str(dest).startswith(str(uploads.resolve())):
    return jsonify({'error': 'invalid path'}), 400
```

**Rate Limiting**

```python
# Protect endpoints from abuse
@app.route('/upload', methods=['POST'])
@limiter.limit("20 per minute")
def upload_file():
    # Implementation
```

**Session Security**

```python
# Use secure session keys
app.secret_key = os.urandom(24)  # Or from environment
```

#### Dependency Security

- Regularly update dependencies
- Review security advisories
- Use `pip audit` to check for vulnerabilities
- Pin dependency versions in production

```bash
# Check for vulnerabilities
pip install pip-audit
pip-audit
```

#### WebSocket Security

- Validate all Socket.IO events
- Implement proper authentication
- Sanitize broadcast data
- Rate limit socket connections

```python
@socketio.on('request_connect')
def handle_request(data):
    # Validate data
    if not isinstance(data, dict):
        return
    # Sanitize
    name = data.get('name', 'Anonymous')[:50]
    # Process safely
```

## Known Security Considerations

### Current Limitations

#### 1. **Local Network Only**

- WifiX is designed for local network use
- **Not secure** for internet-facing deployments
- No HTTPS support by default
- Lacks advanced authentication

#### 2. **File Access Control**

- Host has full control over all files
- Clients can download any file (once approved)
- No granular file permissions

#### 3. **Session Management**

- Sessions are memory-based (lost on restart)
- No persistent user accounts
- PIN verification cached per session

### Mitigation Strategies

#### For Production Use

**1. Use HTTPS**

```python
# Run with SSL/TLS
socketio.run(app,
    host='0.0.0.0',
    port=443,
    ssl_context=('cert.pem', 'key.pem'))
```

**2. Restrict Network Access**

```bash
# Firewall rules (Linux example)
sudo ufw allow from 192.168.1.0/24 to any port 5000
sudo ufw deny 5000
```

**3. Use Reverse Proxy**

```nginx
# nginx configuration
server {
    listen 443 ssl;
    server_name wifix.local;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**4. Environment Configuration**

```bash
# Use environment variables for secrets
export SECRET_KEY="$(openssl rand -hex 32)"
export ACCESS_PIN="$(openssl rand -hex 16)"
export CORS_ORIGINS="https://yourdomain.com"
```

## Vulnerability Response

### Severity Levels

**Critical**

- Remote code execution
- Unauthorized file system access
- Authentication bypass
- Data exfiltration

**High**

- XSS vulnerabilities
- CSRF vulnerabilities
- Information disclosure
- Denial of service

**Medium**

- Session fixation
- Weak cryptography
- Missing security headers
- Rate limiting bypass

**Low**

- Information leakage (minor)
- Missing best practices
- Non-exploitable bugs

### Patch Process

1. **Vulnerability Confirmed**
2. **Patch Developed & Tested**
3. **Security Advisory Published**
4. **Patch Released**
5. **Users Notified**
6. **CVE Assigned** (if applicable)

## Security Checklist

### Deployment

- [ ] PIN authentication enabled
- [ ] Running on trusted network
- [ ] Firewall rules configured
- [ ] Latest version installed
- [ ] Dependencies updated
- [ ] SSL/TLS configured (if needed)
- [ ] Logs monitored
- [ ] Backup strategy in place

### Code Review

- [ ] Input validation present
- [ ] Path traversal prevented
- [ ] Rate limiting enabled
- [ ] Error handling proper
- [ ] Secrets in environment variables
- [ ] CORS configured correctly
- [ ] WebSocket events validated
- [ ] File size limits enforced

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security](https://flask.palletsprojects.com/en/2.3.x/security/)
- [Socket.IO Security](https://socket.io/docs/v4/server-api/)
- [Python Security](https://python.readthedocs.io/en/latest/library/security_warnings.html)

## Contact

For security concerns: **[Security Contact Email]**

---

**Remember**: Security is a shared responsibility. Stay vigilant and report issues responsibly.
