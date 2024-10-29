import { ProductService } from '../services/product.service';
import { ResponseUtil } from '../utils/response.util';
import type { Product } from '../types/product';

export class ProductRoutes {
  constructor(private productService: ProductService) {}

  async handleRequest(req: Request, uid: string): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const id = path.split('/')[3]; // /api/products/:id

    if (path === '/api/products' && req.method === 'GET') {
      return await this.getAllProducts();
    }
    
    if (path === '/api/products' && req.method === 'POST') {
      return await this.createProduct(req);
    }
    
    if (id && path === `/api/products/${id}`) {
      switch (req.method) {
        case 'GET':
          return await this.getProductById(id);
        case 'PUT':
          return await this.updateProduct(id, req);
        case 'DELETE':
          return await this.deleteProduct(id);
      }
    }

    return ResponseUtil.notFound();
  }

  private async getAllProducts(): Promise<Response> {
    const products = await this.productService.findAll();
    return ResponseUtil.success(products);
  }

  private async getProductById(id: string): Promise<Response> {
    const product = await this.productService.findById(id);
    if (!product) {
      return ResponseUtil.notFound('Product not found');
    }
    return ResponseUtil.success(product);
  }

  private async createProduct(req: Request): Promise<Response> {
    try {
      const body = await req.json() as Product;
      const product = await this.productService.create(body);
      return ResponseUtil.success(product, 'Product created successfully');
    } catch (error) {
      return ResponseUtil.error('Invalid product data');
    }
  }

  private async updateProduct(id: string, req: Request): Promise<Response> {
    try {
      const body = await req.json() as Partial<Product>;
      const product = await this.productService.update(id, body);
      if (!product) {
        return ResponseUtil.notFound('Product not found');
      }
      return ResponseUtil.success(product, 'Product updated successfully');
    } catch (error) {
      return ResponseUtil.error('Invalid product data');
    }
  }

  private async deleteProduct(id: string): Promise<Response> {
    const deleted = await this.productService.delete(id);
    if (!deleted) {
      return ResponseUtil.notFound('Product not found');
    }
    return ResponseUtil.success(null, 'Product deleted successfully');
  }
}