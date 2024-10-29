import { MongoClient, Db } from 'mongodb';
import { env } from '../utils/env';

class Database {
  private static instance: Database;
  private client: MongoClient;
  private db: Db | null = null;

  private constructor() {
    this.client = new MongoClient(env.MONGODB_URI);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<Db> {
    try {
      if (this.db) return this.db;
      
      await this.client.connect();
      this.db = this.client.db(env.MONGODB_DATABASE);
      console.log('Connected to MongoDB');
      return this.db;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    this.db = null;
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }
}

export const db = Database.getInstance();