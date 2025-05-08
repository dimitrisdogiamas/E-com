import { Module } from '@nestjs/common';
import { ProfileService } from './profile-service/profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  providers: [ProfileService, PrismaService],
  exports: [ProfileService],
})
export class ProfileModule {}
