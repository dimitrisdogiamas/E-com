import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token: string | undefined;
    const authHeader = request.headers.authorization;
    // διαβάζουμε το token από το header
    if (authHeader && authHeader.startsWith('Bearer ')) {
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
      const payload = await this.jwtService.verifyAsync(token);
      // Fetch user from database to get role
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      console.log('User from token:', user); // debugging
      request.user = {
        id: user.id,
        email: user.email,
        role: user.role, // Keep as single role
      };
      return true;
    } catch (error) {
      console.log('Token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
