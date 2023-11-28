import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
