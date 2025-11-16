#!/bin/bash

# Email Notification Setup Script for NibJobs Scraping

echo "🐝 NibJobs - Email Notification Setup"
echo "======================================"
echo ""

# Check if we're in the functions directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the functions directory."
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install nodemailer@^6.9.7
npm install --save-dev @types/nodemailer@^6.4.14

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "📧 Step 2: Configure Gmail credentials"
echo ""
echo "You need to set up a Gmail account with an App Password."
echo "Follow these steps:"
echo ""
echo "1. Create or use a Gmail account (e.g., nibjobs.scraper@gmail.com)"
echo "2. Enable 2-Factor Authentication:"
echo "   https://myaccount.google.com/security"
echo "3. Generate an App Password:"
echo "   https://myaccount.google.com/apppasswords"
echo "4. Copy the 16-character password"
echo ""
read -p "Press Enter when you're ready to set Firebase secrets..."

echo ""
echo "Setting GMAIL_USER secret..."
firebase functions:secrets:set GMAIL_USER

if [ $? -ne 0 ]; then
    echo "❌ Failed to set GMAIL_USER secret"
    exit 1
fi

echo ""
echo "Setting GMAIL_APP_PASSWORD secret..."
firebase functions:secrets:set GMAIL_APP_PASSWORD

if [ $? -ne 0 ]; then
    echo "❌ Failed to set GMAIL_APP_PASSWORD secret"
    exit 1
fi

echo ""
echo "✅ Firebase secrets configured successfully"
echo ""
echo "🔨 Step 3: Building functions..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Deploy functions: firebase deploy --only functions"
echo "2. Test by triggering a manual scrape"
echo "3. Check your email inbox"
echo ""
echo "📚 For more details, see EMAIL_SETUP.md"
