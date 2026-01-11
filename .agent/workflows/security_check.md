---
description: Security Checklist before pushing or releasing
---

# Security Checklist

Run this checklist before pushing code or creating releases to prevent sensitive data leaks.

## 🚨 Critical Checks

### 1. Check for Sensitive Files
Run these commands to verify no secrets are being tracked:

```bash
# Check for environment files
git ls-files .env *.env

# Check for keys and certificates
git ls-files "*.key" "*.pem" "*.p12" "*.pfx" "id_rsa*"

# Check for other sensitive data folders
git ls-files "release/" "dist/" "node_modules/"
```
✅ **Expected Output:** Should be empty.

### 2. Verify .gitignore
Ensure `.gitignore` contains at least:

```gitignore
# Security
.env
*.env
*.pem
*.key
*.p12
*.pfx
*.keystore

# Build Artifacts
node_modules
dist
release
build
```

### 3. Scan for Keywords
Search your codebase for potential leaked keys (excluding lockfiles):

```bash
grep -r "KEY" . --exclude-dir={node_modules,dist,release,.git} --exclude=package-lock.json
grep -r "SECRET" . --exclude-dir={node_modules,dist,release,.git} --exclude=package-lock.json
grep -r "PASSWORD" . --exclude-dir={node_modules,dist,release,.git} --exclude=package-lock.json
```

## 🛡️ Remediation
If you find you have accidentally committed a secret:

1. **Remove from history immediately:**
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch YOUR_FILE' --prune-empty --tag-name-filter cat -- --all
   ```
2. **Force push:**
   ```bash
   git push origin main --force
   ```
3. **Rotate the leaked key:** Assume the key is compromised and generate a new one immediately.
