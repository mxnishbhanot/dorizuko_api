import { Db, type Document, type WithId } from 'mongodb';
import { adminAuth, clientAuth } from '../config/firebase';
import type { User } from '../types/user';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { hash } from 'bun';

export class AuthService {
  private collection: string = 'users';

  constructor(private db: Db) {}

  private mapUser(doc: WithId<Document>): User {
    return {
      uid: doc.uid as string,
      name: doc.name as string,
      email: doc.email as string,
      password: doc.password as string,
      bio: doc.bio as string | undefined,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    };
  }

  private handleAuthError(error: any): Error {
    console.error('Auth error:', error);
    const errorMessage = error.message || 'Authentication failed';
    
    switch (error.code) {
      case 'auth/email-already-exists':
        return new Error('Email is already registered');
      case 'auth/invalid-email':
        return new Error('Invalid email format');
      case 'auth/operation-not-allowed':
        return new Error('Email/password accounts are not enabled');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters');
      case 'auth/user-not-found':
        return new Error('User not found');
      case 'auth/invalid-credential':
        return new Error('Invalid credentials');
      default:
        return new Error(`Authentication failed: ${errorMessage}`);
    }
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    try {
      // Create user in Firebase
      const userRecord = await adminAuth.createUser({email, password})

      const userDoc = {
        uid: userRecord.uid,
        email: userRecord.email,
        name: name,
        password: hash(password),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert user into MongoDB
      await this.db.collection(this.collection).insertOne(userDoc);

      // Create custom claims if needed
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        role: 'user'
      });

      return this.mapUser(userDoc as unknown as WithId<Document>);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      // Get Firebase user
      const userRecord = await adminAuth.getUserByEmail(email);
      
      // Get user from MongoDB
      const userDoc = await this.db.collection(this.collection)
        .findOne({ uid: userRecord.uid });
      
      if (!userDoc) {
        throw new Error('User data not found');
      }

      // Create custom token for client
      const customToken = await adminAuth.createCustomToken(userRecord.uid);

      // Return user data with token
      return {
        ...this.mapUser(userDoc),
        token: customToken // You might want to add this to your User type
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      const userDoc = await this.db.collection(this.collection)
        .findOne({ uid: decodedToken.uid });
      
      if (!userDoc) {
        throw new Error('User data not found');
      }

      return this.mapUser(userDoc);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async logout(uid: string): Promise<boolean> {
    try {
      // Revoke all refresh tokens for user
      await adminAuth.revokeRefreshTokens(uid);
      
      // Update last logout time in MongoDB if needed
      await this.db.collection(this.collection).updateOne(
        { uid },
        { 
          $set: { 
            lastLogout: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      return true;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async getUserById(uid: string): Promise<User | null> {
    try {
      const userDoc = await this.db.collection(this.collection)
        .findOne({ uid });
      
      return userDoc ? this.mapUser(userDoc) : null;
    } catch (error: any) {
      throw new Error('Failed to get user: ' + error.message);
    }
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<User> {
    try {
      // Update Firebase user if needed
      if (updates.email || updates.name) {
        await adminAuth.updateUser(uid, {
          email: updates.email,
          displayName: updates.name
        });
      }

      // Update MongoDB user
      const result = await this.db.collection(this.collection).findOneAndUpdate(
        { uid },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      ) as any;

      if (!result?.value) {
        throw new Error('User not found');
      }

      return this.mapUser(result.value);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }
}