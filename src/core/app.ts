import { Router } from './router';
import { UserRoutes } from '../routes/user.routes';
import { ProductRoutes } from '../routes/product.routes';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { db } from '../config/database';
import { AuthService } from '../services/auth.service';
import { AuthRoutes } from '../routes/auth.routes';

export class App {
  private router: Router;

  constructor() {
    this.router = new Router();
  }

  async initialize() {
    // Connect to database
    const database = await db.connect();

    // Initialize services
    const authService = new AuthService(database);
    const userService = new UserService(database);
    const productService = new ProductService(database);

    // Initialize route handlers
    const authRoutes = new AuthRoutes(authService);
    const userRoutes = new UserRoutes(userService);
    const productRoutes = new ProductRoutes(productService);

    // Register routes
    // Auth routes (no authentication required)
    this.router.addRoute('/api/auth', authRoutes.handleRequest.bind(authRoutes), false);
    
    // Protected routes (authentication required)
    this.router.addRoute('/api/users', userRoutes.handleRequest.bind(userRoutes));
    this.router.addRoute('/api/products', productRoutes.handleRequest.bind(productRoutes));
  }

  async handleRequest(req: Request): Promise<Response> {
    return this.router.handleRequest(req);
  }
}