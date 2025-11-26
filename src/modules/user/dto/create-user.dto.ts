import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  name?: string;

  @IsString()
  @MinLength(8)
  password?: string;

  // Index signature để tương thích với Record<string, unknown>
  [key: string]: unknown;
}
