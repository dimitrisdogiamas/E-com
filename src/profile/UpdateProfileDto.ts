import { IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
