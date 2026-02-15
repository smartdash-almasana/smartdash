# 🔐 SECURITY: API Key Rotation Required

## ⚠️ IMMEDIATE ACTION REQUIRED

**Date:** 2026-02-14  
**Severity:** HIGH  
**Status:** PENDING ROTATION

---

## Compromised Credentials

The following API key was exposed in git history:

- **Service:** Google Stitch API
- **Key Pattern:** `AQ.REDACTED`
- **Exposed in:** `.agent/antigravity/mcp_config.json` (commit history)
- **Risk:** Unauthorized access to Stitch project, quota abuse

---

## Remediation Steps

### 1. Rotate Stitch API Key (URGENT)
1. Go to [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Locate the compromised key
3. Click **Delete** or **Regenerate**
4. Copy the new key

### 2. Update Local Environment
Add to `.env.local`:
```bash
STITCH_API_KEY=<NEW_KEY_HERE>
```

### 3. Update MCP Config
The sanitized `mcp_config.json` now reads from environment:
```json
{
  "stitch": {
    "env": {
      "STITCH_API_KEY": "${STITCH_API_KEY}"
    }
  }
}
```

### 4. Verify No Other Leaks
```bash
git log -p | grep -E "AQ\.|sk-|gsk_|ntn_" | head -20
```

---

## Prevention

- ✅ `.gitignore` updated to exclude `mcp_config.json`
- ✅ All API keys moved to `.env.local` (already in `.gitignore`)
- ✅ Pre-commit hook recommended: `detect-secrets` or `gitleaks`

---

## Checklist

- [ ] Stitch API key rotated
- [ ] New key added to `.env.local`
- [ ] Old key confirmed revoked in Google Cloud Console
- [ ] Team notified (if applicable)
- [ ] This file deleted after rotation complete

---

**Owner:** DevOps / Security Lead  
**Next Review:** After rotation complete

Note 2026-02-14: Rotate all exposed tokens immediately and replace repo-stored secrets with environment-variable references only.
