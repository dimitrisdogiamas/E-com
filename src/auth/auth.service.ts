import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async findOrCreateGoogleUser(googleUser: any) {
    const { email, firstName, lastName, picture } = googleUser;
    const name = `${firstName || ''} ${lastName || ''}`.trim() || email;

    // Try to find existing user
    let user = await this.userService.findUserByEmail(email);

    if (!user) {
      // Create new user for Google OAuth
      user = await this.userService.createUser({
        email,
        name,
        password: '', // Empty password for OAuth users
        // You can add picture field to user model if needed
      });

      this.logger.log(`Created new Google OAuth user: ${email}`);
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    const existingUser = await this.userService.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userService.createUser({
      email,
      password: hashedPassword,
      name,
    });

    // Send welcome email (async, don't block registration)
    this.sendWelcomeEmail(newUser).catch((error) => {
      this.logger.error('Failed to send welcome email:', error);
    });

    // Generate token for the new user
    const payload = { sub: newUser.id, email: newUser.email };
    const accessToken = this.jwtService.sign(payload);

    // Return user without password and include token
    const { password: _, ...userWithoutPassword } = newUser; // eslint-disable-line @typescript-eslint/no-unused-vars
    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  private async sendWelcomeEmail(user: { name: string; email: string }) {
    try {
      const emailSent = await this.emailService.sendWelcomeEmail({
        name: user.name,
        email: user.email,
      });

      if (emailSent) {
        this.logger.log(`✅ Welcome email sent to ${user.email}`);
      }
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
    }
  }
}
