import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsNumber()
  @IsNotEmpty()
  completedChapters?: number;
}
