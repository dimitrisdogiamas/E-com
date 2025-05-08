import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from '../UpdateProfileDto';
import * as bcrypt from 'bcryptjs';
import { CreateProfileDto } from '../profile-controller/CreateProfileDto';
import { v4 as uuid } from 'uuid';
@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updateData: any = {}; // Create an empty object to hold the update data
    // ελέγχουμε αν υπάρχουν πεδία στο updateProfileDto
    if (updateProfileDto.name) {
      updateData.name = updateProfileDto.name;
    }
    if (updateProfileDto.password) {
      // αν υπάρχει password στο updateProfileDto, το κρυπτογραφόυμε με bcrypt
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateProfileDto.password, salt);
    }
    // We check if the request has the validation rules
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }
    console.log('Update data:', updateData); //debugging
    //και επιστρέφουμε το αποτέλεσμα της ενημέρωσης
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
  async createProfile(userId: string, createProfileDto: CreateProfileDto) {
    const { name, email, password } = createProfileDto;
    const existingProfile = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingProfile) {
      throw new BadRequestException('Email already exists');
    }
    // we hash the password αν ο hash είναι ίδιος με τον password
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    return this.prisma.user.create({
      data: {
        id: uuid(), //Generate a unique id
        name,
        email,
        password: hashedPassword || '',
      },
    });
  }
  async DeleteProfile(userId: string) {
    // we check if the userId exists
    const existingProfile = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    // if it doesn't exist, we throw an error
    if (!existingProfile) {
      throw new BadRequestException('Profile not found');
    }
    // or if it exists then we delete the user
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
