# Authentication System with GitHub Storage

## Overview
Complete authentication system for Android APKs using GitHub as backend storage. No external APIs needed - all user data stored securely in your GitHub repository.

## Features
✅ User Registration (Sign Up)
✅ User Login with Remember Me
✅ Admin Panel with User Management
✅ Revoke/Activate Users
✅ Delete Users
✅ Device-based Authentication
✅ Expiry Date Management
✅ GitHub as Backend Storage
✅ No External API Dependencies

## What's New in v2.0
- ✅ **Removed Genspark API** - Now uses GitHub exclusively
- ✅ **GitHub Integration** - All user data stored in your repository
- ✅ **Configuration File** - Easy customization via JSON
- ✅ **Better Security** - Direct control over your data

## Files Included
- `LoginDialog.java` - Complete source code with GitHub integration
- `hook.txt` - Smali hook code for APK integration
- `config.json` - Configuration file
- `README.md` - This file
- `COMPILE_GUIDE.md` - Step-by-step compilation instructions

## How It Works
1. **User Signs Up** → Creates JSON file in `/data/users/{device_id}.json` in your GitHub repo
2. **User Logs In** → Fetches and validates user data from GitHub
3. **Admin Access** → Lists all JSON files, allows revoke/delete operations
4. **Offline Support** → Remembers login state locally

## GitHub Storage Structure
```
your-repo/
└── data/
    └── users/
        ├── {device_id_1}.json
        ├── {device_id_2}.json
        └── {device_id_3}.json
```

Each user file contains:
```json
{
  "username": "john_doe",
  "password": "userpassword",
  "expiresAt": "2026-12-31",
  "allowOffline": true,
  "revoked": false,
  "createdAt": "2025-12-31"
}
```

## Configuration (config.json)
```json
{
  "github": {
    "owner": "your-github-username",
    "repo": "your-repo-name",
    "branch": "main",
    "data_path": "data/users"
  },
  "auth": {
    "admin_key": "your-admin-key",
    "expiry_days": 365,
    "allow_offline": true
  }
}
```

## Integration Steps

### Method 1: Runtime Loading (Recommended)
```java
// Copy DEX to app directory
File dexFile = new File(getFilesDir(), "classes.dex");

// Load the class
DexClassLoader loader = new DexClassLoader(
    dexFile.getAbsolutePath(),
    getCodeCacheDir().getAbsolutePath(),
    null,
    getClassLoader()
);

// Show dialog
Class<?> loginClass = loader.loadClass("login.dialog.logindpmods.LoginDialog");
Method show = loginClass.getMethod("show", Context.class);
show.invoke(null, this);
```

### Method 2: Smali Hook (For APK Modding)
Insert this line in your smali code where you want the dialog:
```smali
invoke-static {p0}, Llogin/dialog/logindpmods/LoginDialog;->show(Landroid/content/Context;)V
```

## Compilation Guide

### Prerequisites
- JDK 8 or higher
- Android SDK with build-tools
- d8 tool (comes with build-tools)

### Step 1: Compile Java to Class Files
```bash
javac -source 1.8 -target 1.8 \
  -cp android.jar \
  LoginDialog.java \
  -d build/
```

### Step 2: Create JAR
```bash
jar cf login.jar -C build/ .
```

### Step 3: Convert to DEX
```bash
d8 --release \
  --lib android.jar \
  --output . \
  login.jar
```

This creates `classes.dex` ready for your APK!

## Alternative: Online DEX Compiler
If you don't have Android SDK installed:
1. Visit: https://dogriffiths.github.io/dex-compiler/
2. Upload `LoginDialog.java`
3. Download compiled `classes.dex`

## Customization

### Change GitHub Repository
Edit lines 33-36 in `LoginDialog.java`:
```java
private static final String GITHUB_OWNER = "your-username";
private static final String GITHUB_REPO = "your-repo";
private static final String GITHUB_BRANCH = "main";
private static final String DATA_PATH = "data/users";
```

### Change Admin Key
Edit line 32:
```java
private static final String ADMIN_KEY = "YourNewAdminKey123";
```

### Change Expiry Period
Edit line 599 in `AuthTask.performSignup()`:
```java
// Default: 365 days = 31536000000L milliseconds
Date expiryDate = new Date(System.currentTimeMillis() + 31536000000L);
```

## Permissions Required
Add to AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## GitHub API Notes
- **Public Repos**: Works without authentication
- **Private Repos**: Requires GitHub token (add as Authorization header)
- **Rate Limits**: 60 requests/hour (unauthenticated), 5000 requests/hour (authenticated)

### For Private Repos
Add GitHub token in `LoginDialog.java`:
```java
conn.setRequestProperty("Authorization", "token YOUR_GITHUB_TOKEN");
```

## Admin Panel
- **Access Key**: `Cand40df5a@@@` (or your custom key)
- **Features**:
  - View all users
  - Revoke/Activate accounts
  - Delete users
  - Refresh user list

## User Flow
```
App Launch
    ↓
Login Dialog
    ↓
┌────────────┬──────────┬─────────┐
│   Login    │  Sign Up │  Admin  │
└────────────┴──────────┴─────────┘
      ↓            ↓          ↓
  Validate   Create User   Manage
  GitHub     → GitHub File  Users
  File       → Auto Login
```

## Security Considerations
⚠️ **Important for Production:**
- Hash passwords before storing
- Use private GitHub repository
- Add GitHub authentication token
- Implement rate limiting
- Add 2FA for admin access
- Encrypt sensitive data
- Use HTTPS for all connections

## Troubleshooting

**Q: Dialog doesn't appear**
- Check Context is valid
- Verify DEX is loaded correctly
- Check logcat for errors

**Q: "Failed to load users" error**
- Verify GitHub repo is accessible
- Check internet connection
- Ensure `/data/users/` path exists in repo
- For private repos, add authentication token

**Q: "Device already registered" error**
- Each device can only register once
- Use same device to login
- Admin can delete user to re-register

**Q: Compilation errors**
- Ensure Android SDK is properly installed
- Use correct android.jar path
- Check Java version (1.8 required)

## File Sizes
- **LoginDialog.java**: ~24 KB (source)
- **classes.dex**: ~25-30 KB (compiled)
- **Total package**: ~15 KB (zipped)

## Compatibility
- **Minimum Android**: 5.0 (API 21)
- **Target Android**: 15 (API 35)
- **Java**: 1.8 compatible

## Support & Contribution
For issues or improvements:
1. Check `/data/users/` folder exists in your repo
2. Verify GitHub repository settings
3. Check logcat for detailed errors
4. Test with public repo first

## License
Free to use and modify for your projects.

## Credits
- Original Auth System: v1.0 (Genspark API)
- Updated Version: v2.0 (GitHub Storage)
- Date: December 31, 2025

---

**Enjoy your new GitHub-powered authentication system!** 🚀
