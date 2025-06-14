import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
}
