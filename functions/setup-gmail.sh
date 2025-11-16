#!/bin/bash

# Gmail Setup Guide for NibJobs Email Notifications
# ================================================

echo "🐝 NibJobs - Gmail Configuration Setup"
echo "======================================"
echo ""
echo "Follow these steps to set up Gmail for email notifications:"
echo ""

# Step 1: Create Gmail Account
echo "📧 STEP 1: Create or Use a Gmail Account"
echo "----------------------------------------"
echo ""
echo "Option A: Create a new dedicated account (Recommended)"
echo "  1. Go to: https://accounts.google.com/signup"
echo "  2. Create account with name like: nibjobs.scraper@gmail.com"
echo "  3. Complete the signup process"
echo ""
echo "Option B: Use an existing Gmail account"
echo "  - Not recommended for production (use dedicated account)"
echo ""
read -p "Press Enter when you have a Gmail account ready..."

# Step 2: Enable 2FA
echo ""
echo "🔐 STEP 2: Enable 2-Factor Authentication"
echo "----------------------------------------"
echo ""
echo "1. Go to: https://myaccount.google.com/security"
echo "2. Find '2-Step Verification' section"
echo "3. Click 'Get Started' and follow the setup wizard"
echo "4. You'll need your phone to receive verification codes"
echo ""
read -p "Press Enter when 2FA is enabled..."

# Step 3: Generate App Password
echo ""
echo "🔑 STEP 3: Generate App Password"
echo "--------------------------------"
echo ""
echo "1. Go to: https://myaccount.google.com/apppasswords"
echo "2. You may need to sign in again"
echo "3. Under 'Select app' choose 'Mail'"
echo "4. Under 'Select device' choose 'Other (Custom name)'"
echo "5. Enter 'NibJobs Scraper' as the name"
echo "6. Click 'Generate'"
echo "7. Copy the 16-character password (e.g., 'abcd efgh ijkl mnop')"
echo "   Note: Remove spaces when entering it"
echo ""
read -p "Press Enter when you have your app password..."

# Step 4: Update .env file
echo ""
echo "📝 STEP 4: Configure Environment Variables"
echo "------------------------------------------"
echo ""
echo "Now let's update your .env file with the credentials:"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "Please enter your Gmail credentials:"
echo ""
read -p "Gmail address (e.g., nibjobs.scraper@gmail.com): " GMAIL_USER
read -p "App password (16 chars, no spaces): " GMAIL_APP_PASSWORD

# Update or add to .env file
if grep -q "GMAIL_USER" .env; then
    # Update existing
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|GMAIL_USER=.*|GMAIL_USER=$GMAIL_USER|g" .env
        sed -i '' "s|GMAIL_APP_PASSWORD=.*|GMAIL_APP_PASSWORD=$GMAIL_APP_PASSWORD|g" .env
    else
        # Linux
        sed -i "s|GMAIL_USER=.*|GMAIL_USER=$GMAIL_USER|g" .env
        sed -i "s|GMAIL_APP_PASSWORD=.*|GMAIL_APP_PASSWORD=$GMAIL_APP_PASSWORD|g" .env
    fi
    echo "✅ Updated existing credentials in .env"
else
    # Append new
    echo "" >> .env
    echo "# Email Configuration" >> .env
    echo "GMAIL_USER=$GMAIL_USER" >> .env
    echo "GMAIL_APP_PASSWORD=$GMAIL_APP_PASSWORD" >> .env
    echo "✅ Added credentials to .env"
fi

# Step 5: Set Firebase Secrets for Production
echo ""
echo "☁️  STEP 5: Set Firebase Secrets (for production)"
echo "------------------------------------------------"
echo ""
echo "For production deployment, you also need to set Firebase secrets:"
echo ""
echo "Run these commands:"
echo ""
echo "  firebase functions:secrets:set GMAIL_USER"
echo "  (Enter: $GMAIL_USER)"
echo ""
echo "  firebase functions:secrets:set GMAIL_APP_PASSWORD"
echo "  (Enter: $GMAIL_APP_PASSWORD)"
echo ""
read -p "Do you want to set Firebase secrets now? (y/n): " SET_SECRETS

if [ "$SET_SECRETS" = "y" ] || [ "$SET_SECRETS" = "Y" ]; then
    echo ""
    echo "Setting GMAIL_USER..."
    echo "$GMAIL_USER" | firebase functions:secrets:set GMAIL_USER
    
    echo ""
    echo "Setting GMAIL_APP_PASSWORD..."
    echo "$GMAIL_APP_PASSWORD" | firebase functions:secrets:set GMAIL_APP_PASSWORD
    
    echo "✅ Firebase secrets configured"
fi

# Step 6: Test Configuration
echo ""
echo "🧪 STEP 6: Test Configuration (Optional)"
echo "---------------------------------------"
echo ""
echo "To test the email configuration:"
echo ""
echo "1. Build functions: npm run build"
echo "2. Deploy: firebase deploy --only functions"
echo "3. Trigger a manual scrape from the admin panel"
echo "4. Check your email inbox for the report"
echo ""

# Summary
echo ""
echo "✅ SETUP COMPLETE!"
echo "=================="
echo ""
echo "Summary of what was configured:"
echo "  • Gmail Account: $GMAIL_USER"
echo "  • App Password: ${GMAIL_APP_PASSWORD:0:4}************"
echo "  • Local .env file: Updated"
echo ""
echo "Next steps:"
echo "  1. npm run build"
echo "  2. firebase deploy --only functions"
echo "  3. Test by triggering a manual scrape"
echo ""
echo "📚 For more details, see EMAIL_SETUP.md"
echo ""
