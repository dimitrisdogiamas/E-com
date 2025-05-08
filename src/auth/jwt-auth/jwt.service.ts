import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}
  generateToken(payload: any): string {
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }
  verifyToken(token: string): any {
    // κάνουμε επαλήθευση το token
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Token verification failed');
    }
  }
}
