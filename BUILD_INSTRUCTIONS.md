# TestFlight Build Guide

## Prerequisites
- Apple Developer Account
- App created in App Store Connect
- EAS CLI installed (already installed ✓)

## Steps

### 1. Get Your Apple Team ID
```bash
eas credentials:list
```

### 2. Update eas.json
Replace these values in eas.json:
- `YOUR_APPLE_ID_EMAIL` - Your Apple ID email
- `YOUR_APP_STORE_CONNECT_APP_ID` - App ID from App Store Connect URL
- `YOUR_APPLE_TEAM_ID` - Your Apple Team ID

### 3. Build for TestFlight
```bash
eas build --platform ios --profile production
```

### 4. Submit to TestFlight
```bash
eas submit --platform ios --profile production
```

## Current Configuration
- Bundle ID: com.hanford2026.fraction-calculator
- Version: 1.0.0
- App Name: Fraction Calculator

## Links
- App Store Connect: https://appstoreconnect.apple.com
- EAS Builds: https://expo.dev/accounts/hanford2026/projects/abcdefghijklmnopqrstuvwxyz/builds
