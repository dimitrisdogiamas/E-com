import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { OauthController } from './gauth/oauth.controller';
import { OauthSevice } from './gauth/oauth.service';
import { GoogleOauthGuard } from './gauth/google-oauth.guard';
import { GoogleOauthStrategy } from './gauth/google-oauth.strategy';
import { JwtAuthService } from './jwt-auth/jwt.service';

@Global()
@Module({
  imports: [
    UserModule,
    EmailModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    PrismaService,
    OauthSevice,
    GoogleOauthGuard,
    GoogleOauthStrategy,
    JwtAuthService,
  ],
  controllers: [AuthController, OauthController],
  exports: [AuthService, JwtAuthGuard, PrismaService, JwtModule],
})
export class AuthModule {}
