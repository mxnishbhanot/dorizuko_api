import { Db, ObjectId, type WithId, type Document } from 'mongodb';
import type { Product } from '../types/product';

export class ProductService {
  private collection: string = 'products';

  constructor(private db: Db) {}

  private mapProduct(doc: WithId<Document>): Product {
    return {
      id: doc._id.toString(),
      name: doc.name as string,
      description: doc.description as string,
      price: doc.price as number,
      category: doc.category as string,
      stock: doc.stock as number,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date
    };
  }

  async findAll(): Promise<Product[]> {
    const docs = await this.db.collection(this.collection)
      .find()
      .toArray();
    return docs.map(doc => this.mapProduct(doc));
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await this.db.collection(this.collection).findOne({
      _id: new ObjectId(id)
    });
    return doc ? this.mapProduct(doc) : null;
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = new Date();
    const insertDoc = {
      ...productData,
      createdAt: now,
      updatedAt: now
    };

    const result = await this.db.collection(this.collection).insertOne(insertDoc);
    return this.mapProduct({
      _id: result.insertedId,
      ...insertDoc
    } as WithId<Document>);
  }

  async update(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> {
    const result = await this.db.collection(this.collection).findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...productData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? this.mapProduct(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.collection(this.collection).deleteOne({
      _id: new ObjectId(id)
    });
    return result.deletedCount > 0;
  }
}
