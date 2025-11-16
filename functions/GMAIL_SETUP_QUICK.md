# Quick Gmail Setup for Email Notifications

## Step-by-Step Instructions

### 1️⃣ Create Gmail Account
- Go to https://accounts.google.com/signup
- Create account: `nibjobs.scraper@gmail.com` (or any name you prefer)
- Remember the password you set

### 2️⃣ Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Click "Get Started"
4. Follow wizard (need phone for verification codes)

### 3️⃣ Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" under app
3. Select "Other (Custom name)" under device
4. Enter name: "NibJobs Scraper"
5. Click "Generate"
6. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)
7. **Remove spaces**: `abcdefghijklmnop`

### 4️⃣ Update .env File

Open `/functions/.env` and update these lines:

```bash
GMAIL_USER=nibjobs.scraper@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

Replace with your actual:
- Gmail address
- 16-character app password (no spaces)

### 5️⃣ Set Firebase Secrets (for production)

Run these commands in the terminal:

```bash
cd functions

# Set Gmail user
firebase functions:secrets:set GMAIL_USER
# When prompted, enter: nibjobs.scraper@gmail.com

# Set Gmail app password  
firebase functions:secrets:set GMAIL_APP_PASSWORD
# When prompted, enter: abcdefghijklmnop
```

### 6️⃣ Deploy

```bash
npm run build
firebase deploy --only functions
```

### 7️⃣ Test

1. Log in to admin panel
2. Go to Telegram Channels
3. Click "Manual Scrape"
4. Wait for completion
5. Check your email inbox!

---

## Quick Commands

```bash
# Navigate to functions directory
cd "/home/nathan/Documents/Workspace/NibJobs 2.0/functions"

# Run automated setup (interactive)
./setup-gmail.sh

# Or set manually:
# 1. Edit .env file
nano .env

# 2. Add these lines:
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=your-16-char-password

# 3. Set Firebase secrets
firebase functions:secrets:set GMAIL_USER
firebase functions:secrets:set GMAIL_APP_PASSWORD

# 4. Deploy
npm run build
firebase deploy --only functions
```

---

## Important Notes

⚠️ **Security:**
- ✅ Never commit `.env` file to git (already in .gitignore)
- ✅ Use app password, NOT your regular Gmail password
- ✅ Use a dedicated email account (not personal)
- ✅ App password is different from Gmail password

📧 **Email Account:**
- Recommended: Create dedicated account like `nibjobs.scraper@gmail.com`
- Free Gmail accounts have limit: 500 emails/day
- Consider Google Workspace for higher limits

🔐 **App Password vs Regular Password:**
- Regular password: Used to log into Gmail
- App password: 16-character code for applications
- App passwords bypass 2FA for specific apps
- More secure than using regular password

---

## Current Status

Your `.env` file has been updated with placeholders:

```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password-here
```

**Next step:** Replace these with your actual credentials!

---

## Troubleshooting

**"App passwords" option not showing?**
- Make sure 2FA is enabled first
- Try signing out and back in
- Check at https://myaccount.google.com/apppasswords

**Emails not being sent?**
- Verify credentials in `.env` are correct
- Check Firebase function logs: `firebase functions:log`
- Check Gmail account hasn't been locked
- Verify superadmin users exist in Firestore

**Where to check logs?**
```bash
firebase functions:log --only scheduledTelegramScrapingV2,runTelegramScrapingNowV2
```

Look for:
- `📧 Found X superadmin emails`
- `📧 Scraping report sent`
- Any error messages

---

## What Happens When You're Done

After setup, email reports will automatically be sent to all superadmins when:
- ✅ Scheduled scraping completes (daily 9 AM UTC)
- ✅ Manual scraping completes (admin-triggered)
- ❌ Scraping fails (with error details)

The emails include:
- Status (success/failure)
- Jobs extracted count
- Channels processed
- Duration
- Error details (if any)
- Beautiful HTML formatting with NibJobs branding
