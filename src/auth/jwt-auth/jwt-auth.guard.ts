import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token: string | undefined;
    const authHeader = request.headers.authorization;
    //διαβάζουμε το token απο το header
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }
    // check for token in cookies if not found in header
    if (!token && request.cookies && request.cookies['jwt']) {
      token = request.cookies['jwt'];
    }
    // if no token is found, throw an error
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const user = await this.jwtService.verifyAsync(token);
      console.log('User from token:', user); //debugging
      request.user = { id: user.sub, email: user.email };
    } catch (error) {
      console.log('Token verification failed:', error);
      throw new UnauthorizedException('Invalid token ');
    }
    return true; // συνεχίζουμε την υπόλοιπη επεξεργασία guard
  }
}
