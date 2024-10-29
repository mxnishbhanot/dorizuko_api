import { Db, type WithId, type Document, ObjectId } from 'mongodb';
import type { User } from '../types/user';

export class UserService {
  private collection: string = 'users';

  constructor(private db: Db) {}

  private mapUser(doc: WithId<Document>): User {
    return {
      uid: doc.uid as string,
      name: doc.name as string,
      email: doc.email as string,
      bio: doc.bio as string | undefined,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date
    };
  }

  async findByUid(uid: string): Promise<User | null> {
    const doc = await this.db.collection(this.collection).findOne({ uid });
    return doc ? this.mapUser(doc) : null;
  }

  async create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const insertDoc = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };

    await this.db.collection(this.collection).insertOne(insertDoc);
    return this.mapUser({ _id: new ObjectId(), ...insertDoc } as WithId<Document>);
  }

  async update(uid: string, userData: Partial<Omit<User, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const result = await this.db.collection(this.collection).findOneAndUpdate(
      { uid },
      {
        $set: {
          ...userData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? this.mapUser(result) : null;
  }

  async delete(uid: string): Promise<boolean> {
    const result = await this.db.collection(this.collection).deleteOne({ uid });
    return result.deletedCount > 0;
  }
}
