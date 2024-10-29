export const env = {
    PORT: process.env.PORT || '3000',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    MONGODB_DATABASE: process.env.MONGODB_DATABASE || 'your_database',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    FIREBASE_APP_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  };