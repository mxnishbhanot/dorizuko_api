import { adminAuth, clientAuth } from '../config/firebase';
import { ResponseUtil } from '../utils/response.util';

export async function verifyToken(req: Request): Promise<string | Response> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return ResponseUtil.unauthorized('No token provided');
  }

  try {
    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token); // uncomment after firebse addition on frontend
    return decodedToken.uid;
  } catch (error) {
    console.log({error});
    
    return ResponseUtil.unauthorized('Invalid token');
  }
}