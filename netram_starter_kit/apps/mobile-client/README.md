
# Vision Care Plus Mobile Client (React Native)

This directory contains the React Native application for the Vision Care Plus Eye Health Platform.

## Technology Choice

This application is built using **React Native** with TypeScript. This allows for cross-platform development (iOS and Android) using JavaScript/TypeScript and React.

## Key Features (Mobile Specific)

-   Secure login with biometric authentication.
-   Access to upcoming appointments and basic EMR summary, potentially with offline capabilities.
-   Push notifications for reminders (appointments, medication) and alerts.
-   Camera integration for document scanning or patient photos (with user consent).
-   Optimized UI/UX for touchscreens.
-   Secure storage for sensitive data.
-   Telemedicine (video call) functionality.

## 🚀 Getting Started

### Prerequisites

-   Node.js (latest LTS version)
-   Yarn or npm
-   React Native development environment setup (Xcode for iOS, Android Studio for Android). Follow the [official React Native environment setup guide](https://reactnative.dev/docs/environment-setup).
-   Watchman (recommended for macOS users)
-   An Android emulator or physical device / an iOS simulator or physical device.

### Setup

1.  **Navigate to the mobile client directory:**
    ```bash
    cd netram_starter_kit/apps/mobile-client
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # OR
    # yarn install
    ```

3.  **Install Pods (for iOS):**
    ```bash
    cd ios
    pod install
    cd ..
    ```

4.  **Environment Variables:**
    *   Create a `.env` file in this directory (`netram_starter_kit/apps/mobile-client/.env`).
    *   Add necessary Firebase configurations (similar to the web client, but ensure they are for your mobile app if using a separate Firebase app). Example:
        ```env
        FIREBASE_API_KEY=YOUR_MOBILE_APP_FIREBASE_API_KEY
        FIREBASE_AUTH_DOMAIN=YOUR_MOBILE_APP_FIREBASE_AUTH_DOMAIN
        FIREBASE_PROJECT_ID=YOUR_MOBILE_APP_FIREBASE_PROJECT_ID
        FIREBASE_STORAGE_BUCKET=YOUR_MOBILE_APP_FIREBASE_STORAGE_BUCKET
        FIREBASE_MESSAGING_SENDER_ID=YOUR_MOBILE_APP_FIREBASE_MESSAGING_SENDER_ID
        FIREBASE_APP_ID=YOUR_MOBILE_APP_FIREBASE_APP_ID
        ```
    *   You'll need a library like `react-native-dotenv` to access these variables in your app.

### Running the Application

1.  **Start the Metro Bundler:**
    In one terminal, from the `netram_starter_kit/apps/mobile-client` directory:
    ```bash
    npm start
    # OR
    # yarn start
    ```

2.  **Run on Android:**
    In another terminal:
    ```bash
    npm run android
    # OR
    # yarn android
    ```

3.  **Run on iOS:**
    In another terminal:
    ```bash
    npm run ios
    # OR
    # yarn ios
    ```

### Integration

-   Integrate with backend services (API Gateway, Auth Service, etc.) using appropriate HTTP client libraries (e.g., Axios, Fetch API).
-   Utilize Firebase SDK for React Native for authentication, Firestore, Storage, and Cloud Messaging.

Refer to the main project README and the React Native documentation for more details.
