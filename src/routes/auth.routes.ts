import { AuthService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response.util';
import type { User } from '../types/user';

export class AuthRoutes {
  constructor(private authService: AuthService) {}

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);

    switch (url.pathname) {
      case '/api/auth/signup':        
        return req.method === 'POST' ? await this.signup(req) : ResponseUtil.error('Method not allowed', 405);

      case '/api/auth/login':
        return req.method === 'POST' ? await this.login(req) : ResponseUtil.error('Method not allowed', 405);

      case '/api/auth/logout':
        return req.method === 'POST' ? await this.logout(req) : ResponseUtil.error('Method not allowed', 405);

      default:
        return ResponseUtil.notFound();
    }
  }

  private async signup(req: Request): Promise<Response> {
    try {
      const { email, password, name } = await req.json();      
      const user = await this.authService.signup(email, password, name);
      return user ? ResponseUtil.success(user, 'Signup successful') : ResponseUtil.error('Signup failed');
    } catch (error: any) {
      return ResponseUtil.error(error.message);
    }
  }

  private async login(req: Request): Promise<Response> {
    try {
      const { email, password } = await req.json();
      const token = await this.authService.login(email, password);
      return token ? ResponseUtil.success({ token }, 'Login successful') : ResponseUtil.error('Login failed');
    } catch (error: any) {
      return ResponseUtil.error(error.message);
    }
  }

  private async logout(req: Request): Promise<Response> {
    try {
      const { uid } = await req.json();
      const result = await this.authService.logout(uid);
      return result ? ResponseUtil.success(null, 'Logout successful') : ResponseUtil.error('Logout failed');
    } catch (error: any) {
      return ResponseUtil.error(error.message);
    }
  }
}
