# NibJobs - Automated Job Aggregation Platform

A comprehensive job aggregation platform that automatically scrapes job postings from Telegram channels using AI-powered extraction and delivers them through a React Native mobile app with push notifications.

## 🚀 Features

- **Automated Job Scraping**: Daily scraping from Telegram channels using Cloud Functions
- **AI-Powered Extraction**: OpenAI GPT integration for structured job data extraction
- **Cross-Platform App**: React Native app supporting iOS, Android, and Web
- **Smart Notifications**: Firebase Cloud Messaging with user preference filtering
- **Guest-Friendly**: Full functionality without registration, optional login for notifications
- **Real-time Updates**: Live job feed with search and filtering capabilities

## 🏗️ Architecture

```
Telegram Channels → Cloud Function (Scraper) → OpenAI API → Firestore
                                                                  ↓
                                                    Cloud Function (Notifier)
                                                                  ↓
                                                    FCM → Mobile/Web App
```

## 📁 Project Structure

```
nibjobs/
├── functions/                  # Firebase Cloud Functions (TypeScript)
│   ├── src/
│   │   ├── scrapeJobs.ts      # Main job scraping function
│   │   ├── sendNotifications.ts # FCM notification handler
│   │   ├── models/            # Data models and interfaces
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── mobile/                    # React Native application
│   ├── src/
│   │   ├── screens/           # App screens
│   │   ├── components/        # Reusable components
│   │   ├── services/          # Firebase and API services
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   ├── ios/                   # iOS-specific files
│   ├── android/               # Android-specific files
│   └── package.json
├── shared/                    # Shared types and utilities
│   └── types/                 # Common TypeScript interfaces
├── firebase/                  # Firebase configuration
│   ├── firestore.rules        # Firestore security rules
│   ├── firestore.indexes.json # Firestore indexes
│   └── firebase.json          # Firebase project configuration
└── docs/                     # Documentation
    └── requirements.md        # Technical requirements document
```

## 🛠️ Technology Stack

- **Backend**: Firebase (Firestore, Auth, Cloud Functions, FCM, Cloud Scheduler)
- **Cloud Functions**: Node.js 18+ with TypeScript
- **AI Processing**: OpenAI API (GPT-4/GPT-3.5-turbo)
- **Frontend**: React Native with Web support
- **External APIs**: Telegram Bot API
- **State Management**: React Context API
- **Navigation**: React Navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase CLI
- React Native development environment
- OpenAI API key
- Telegram Bot token

### Installation

1. **Clone and setup workspace**
   ```bash
   cd "NibJobs 2.0"
   npm install -g firebase-tools @react-native-community/cli
   ```

2. **Setup Firebase project**
   ```bash
   firebase login
   firebase init
   ```

3. **Install Cloud Functions dependencies**
   ```bash
   cd functions
   npm install
   ```

4. **Setup React Native app**
   ```bash
   cd mobile
   npm install
   cd ios && pod install && cd ..  # iOS only
   ```

5. **Configure environment variables**
   ```bash
   # Create .env files in functions/ and mobile/
   # Add your API keys and Firebase config
   ```

### Development

1. **Start Firebase emulators**
   ```bash
   firebase emulators:start
   ```

2. **Run React Native app**
   ```bash
   cd mobile
   npx react-native run-ios     # iOS
   npx react-native run-android # Android
   npm run web                  # Web
   ```

## 📱 App Screens

1. **Home Screen**: Job listing with search and filters
2. **Job Detail**: Complete job information with apply button
3. **Category Selection**: Notification preference configuration
4. **Profile/Settings**: User account management
5. **Onboarding**: Welcome screen for first-time users

## 🔧 Configuration

### Firebase Collections

- `jobs`: Extracted job postings
- `users`: User preferences and FCM tokens
- `telegram_sources`: Telegram channels to scrape
- `failed_extractions`: Failed AI extractions for review

### Environment Variables

**Cloud Functions (`functions/.env`)**
```
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=...
ENVIRONMENT=development
```

**React Native (`mobile/.env`)**
```
FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...
```

## 🚀 Deployment

### Cloud Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

### Mobile App
```bash
cd mobile
# iOS
npx react-native run-ios --configuration Release
# Android
npx react-native run-android --variant=release
```

## 📊 Monitoring

- Cloud Functions logs: Firebase Console
- App analytics: Firebase Analytics
- Error tracking: Built-in error logging
- Performance: Firebase Performance Monitoring

## 🔒 Security

- Firestore security rules for data protection
- API keys stored in Firebase Functions config
- User data privacy compliance (GDPR/CCPA ready)
- Rate limiting on external API calls

## 📈 Success Metrics

- Scraper success rate: > 95%
- AI extraction accuracy: > 90%
- Notification delivery rate: > 95%
- App crash rate: < 1%

## 🛣️ Development Phases

1. **Phase 1**: Backend setup (Cloud Functions + Firebase)
2. **Phase 2**: Notification system (FCM integration)
3. **Phase 3**: React Native app core (screens + navigation)
4. **Phase 4**: Notification features (user preferences)
5. **Phase 5**: Polish & testing (UI/UX + cross-platform testing)
6. **Phase 6**: Deployment (production deployment)

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the development team for contribution guidelines.

---

**Last Updated**: November 11, 2025