import { ResponseUtil } from '../utils/response.util';
import { verifyToken } from '../middlewares/auth.middleware';

// Define separate handler types for auth and non-auth routes
type AuthenticatedRouteHandler = (req: Request, uid: string) => Promise<Response>;
type UnauthenticatedRouteHandler = (req: Request) => Promise<Response>;

interface Route {
  path: string;
  handler: AuthenticatedRouteHandler | UnauthenticatedRouteHandler;
  requiresAuth: boolean;
}

export class Router {
  private routes: Route[] = [];
  private authExcludedPaths = ['/api/auth/signup', '/api/auth/login'];

  constructor() {}

  // Overloaded methods for adding routes
  addRoute(path: string, handler: AuthenticatedRouteHandler): void;
  addRoute(path: string, handler: UnauthenticatedRouteHandler, requiresAuth: false): void;
  addRoute(
    path: string,
    handler: AuthenticatedRouteHandler | UnauthenticatedRouteHandler,
    requiresAuth: boolean = true
  ): void {
    this.routes.push({ path, handler, requiresAuth });
  }

  private matchRoute(path: string): Route | null {
    const route = this.routes.find(route => {
      if (route.path.includes(':')) {
        const routeParts = route.path.split('/');
        const pathParts = path.split('/');
        
        if (routeParts.length !== pathParts.length) return false;
        
        return routeParts.every((part, i) => 
          part.startsWith(':') || part === pathParts[i]
        );
      }
      return path.startsWith(route.path);
    });

    return route || null;
  }

  private isAuthRequired(pathname: string): boolean {
    return !this.authExcludedPaths.some(path => pathname.endsWith(path));
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Find matching route
    const route = this.matchRoute(url.pathname);
    if (!route) {
      return ResponseUtil.notFound('Route not found');
    }

    try {
      // Handle authentication
      if (route.requiresAuth && this.isAuthRequired(url.pathname)) {
        const auth = await verifyToken(req);
        if (auth instanceof Response) {
          return auth;
        }
        // Type assertion here is safe because we know this is an authenticated route
        return await (route.handler as AuthenticatedRouteHandler)(req, auth);
      }

      // Handle non-authenticated routes
      return await (route.handler as UnauthenticatedRouteHandler)(req);
    } catch (error) {
      console.error('Route handler error:', error);
      return ResponseUtil.error('Internal server error', 500);
    }
  }
}