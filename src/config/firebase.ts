// config/firebase.config.ts
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth } from 'firebase/auth';
import { env } from '../utils/env';

class Firebase {
  private static instance: Firebase;
  private adminAuth;
  private clientAuth;

  private constructor() {
    // Initialize Admin SDK
    const serviceAccount: ServiceAccount = {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY ? env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : ''
    };

    initializeApp({
      credential: cert(serviceAccount)
    });
    this.adminAuth = getAdminAuth();    

    // Initialize Client SDK
    const clientConfig = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_PROJECT_ID,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_PROJECT_ID,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID
    };

    const clientApp = initializeClientApp(clientConfig);
    this.clientAuth = getClientAuth(clientApp);
  }

  public static getInstance(): Firebase {
    if (!Firebase.instance) {
      Firebase.instance = new Firebase();
    }
    return Firebase.instance;
  }

  public getAdminAuth() {    
    return this.adminAuth;
  }

  public getClientAuth() {
    return this.clientAuth;
  }
}

export const firebase = Firebase.getInstance();
export const adminAuth = firebase.getAdminAuth();
export const clientAuth = firebase.getClientAuth();