import { UserService } from '../services/user.service';
import { ResponseUtil } from '../utils/response.util';
import type { User } from '../types/user';

export class UserRoutes {
  constructor(private userService: UserService) {}

  async handleRequest(req: Request, uid: string): Promise<Response> {
    const url = new URL(req.url);
    
    if (url.pathname !== '/api/users') {
      return ResponseUtil.notFound();
    }

    switch (req.method) {
      case 'GET':
        return await this.getUserProfile(uid);
      case 'PUT':
        return await this.updateUserProfile(uid, req);
      case 'DELETE':
        return await this.deleteUser(uid);
      default:
        return ResponseUtil.error('Method not allowed', 405);
    }
  }

  private async getUserProfile(uid: string): Promise<Response> {
    const user = await this.userService.findByUid(uid);
    if (!user) {
      return ResponseUtil.notFound('User not found');
    }
    return ResponseUtil.success(user);
  }

  private async updateUserProfile(uid: string, req: Request): Promise<Response> {
    try {
      const body = await req.json() as Partial<User>;
      const user = await this.userService.update(uid, body);
      if (!user) {
        return ResponseUtil.notFound('User not found');
      }
      return ResponseUtil.success(user, 'Profile updated successfully');
    } catch (error) {
      return ResponseUtil.error('Invalid user data');
    }
  }

  private async deleteUser(uid: string): Promise<Response> {
    const deleted = await this.userService.delete(uid);
    if (!deleted) {
      return ResponseUtil.notFound('User not found');
    }
    return ResponseUtil.success(null, 'User deleted successfully');
  }
}
