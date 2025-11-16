# Email Notification Setup for Scraping Reports

## Overview
The NibJobs scraping system now sends detailed email reports to all superadmins when scraping (manual or scheduled) completes.

## Setup Instructions

### 1. Install Dependencies

Navigate to the functions directory and install nodemailer:

```bash
cd functions
npm install nodemailer@^6.9.7
npm install --save-dev @types/nodemailer@^6.4.14
```

### 2. Configure Gmail App Password

To send emails, you need to set up a Gmail account with an App Password:

1. **Create or use a Gmail account** for sending emails (e.g., `nibjobs.scraper@gmail.com`)

2. **Enable 2-Factor Authentication** on the Gmail account:
   - Go to https://myaccount.google.com/security
   - Turn on 2-Step Verification

3. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

### 3. Set Firebase Secrets

Set the Gmail credentials as Firebase secrets:

```bash
# Set the Gmail email address
firebase functions:secrets:set GMAIL_USER

# When prompted, enter: nibjobs.scraper@gmail.com (or your email)

# Set the Gmail app password
firebase functions:secrets:set GMAIL_APP_PASSWORD

# When prompted, paste the 16-character app password
```

### 4. Verify Secrets are Set

```bash
firebase functions:secrets:access GMAIL_USER
firebase functions:secrets:access GMAIL_APP_PASSWORD
```

### 5. Deploy Functions

Deploy the updated functions with the new secrets:

```bash
npm run build
firebase deploy --only functions
```

## How It Works

### Email Triggers

Email reports are automatically sent to all superadmins when:

1. **Scheduled Scraping Completes** (daily at 9 AM UTC)
   - Sends report with all scraping results
   - Includes success/failure status

2. **Manual Scraping Completes** (triggered by admin)
   - Sends report with scraping session details
   - Includes session ID for tracking

### Report Contents

Each email report includes:

- **Status**: Success or Failure indicator
- **Type**: Manual or Scheduled scraping
- **Statistics**:
  - Total jobs extracted
  - Channels processed
  - Messages processed
  - Duration
- **Timing**:
  - Start time
  - Completion time
  - Session ID (for manual scraping)
- **Errors**: List of any errors encountered (up to 10 shown)

### Recipient Selection

- Emails are sent to all users with `role: 'superadmin'` in Firestore
- The system queries the `users` collection and filters by role
- Only valid email addresses are included

## Email Template

The emails are beautifully formatted HTML with:
- NibJobs branding (🐝 bee theme)
- Color-coded status indicators
- Responsive grid layout for statistics
- Professional styling matching the NibJobs design

## Testing

### Test Email Sending

You can test the email functionality by:

1. **Trigger Manual Scraping**:
   - Log in as superadmin
   - Go to Telegram Channels page
   - Click "Manual Scrape"
   - Check your email inbox

2. **Check Logs**:
```bash
firebase functions:log --only scheduledTelegramScrapingV2,runTelegramScrapingNowV2
```

Look for:
- `📧 Found X superadmin emails`
- `📧 Scraping report sent to X superadmin(s)`

### Troubleshooting

**No emails received:**
- Verify secrets are set correctly
- Check Gmail account hasn't disabled "Less secure app access"
- Verify 2FA and App Password are configured
- Check spam/junk folder
- Review Firebase function logs for errors

**Authentication errors:**
- Regenerate Gmail App Password
- Re-set the GMAIL_APP_PASSWORD secret
- Ensure the Gmail account allows SMTP access

**Rate limiting:**
- Gmail has sending limits (500 emails/day for free accounts)
- Consider upgrading to Google Workspace if needed

## Environment Variables

The system uses these secrets:

| Secret | Purpose | Example |
|--------|---------|---------|
| `GMAIL_USER` | Sender email address | nibjobs.scraper@gmail.com |
| `GMAIL_APP_PASSWORD` | Gmail app-specific password | abcd efgh ijkl mnop |

## Alternative Email Providers

If you prefer to use a different email provider, you can modify `emailService.ts`:

### SendGrid
```typescript
// Use @sendgrid/mail instead of nodemailer
```

### AWS SES
```typescript
// Use aws-sdk or nodemailer with SES transport
```

### Mailgun
```typescript
// Use mailgun-js or nodemailer-mailgun-transport
```

## Security Notes

- **Never commit** email credentials to version control
- Use Firebase secrets for all sensitive data
- App passwords are more secure than regular passwords
- Consider using a dedicated email account for system notifications
- Monitor email sending logs for suspicious activity

## Future Enhancements

Potential improvements:
- [ ] Add email templates for different event types
- [ ] Include charts/graphs in email reports
- [ ] Support multiple email providers
- [ ] Add email preferences per superadmin
- [ ] Send summary emails (weekly/monthly)
- [ ] Add email unsubscribe functionality
