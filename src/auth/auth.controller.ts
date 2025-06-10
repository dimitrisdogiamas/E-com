import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() registerDto: RegisterDto) {
    try {
      return this.authService.register(registerDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Google OAuth routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      // Create JWT token for the user
      const payload = { sub: user.id || user.email, email: user.email };
      const accessToken = this.authService.generateToken(payload);
      // Create or find user in database
      const dbUser = await this.authService.findOrCreateGoogleUser(user);

      // Redirect to frontend with token and user data
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${accessToken}&user=${encodeURIComponent(
        JSON.stringify({
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
        }),
      )}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(
          'OAuth authentication failed',
        )}`,
      );
    }
  }
}
