import { Module } from '@nestjs/common';
import { ProfileService } from './profile-service/profile.service';
import { ProfileController } from './profile-controller/profile.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
  exports: [ProfileService],
})
export class ProfileModule {}
