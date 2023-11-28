import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChapterAccess, ChapterStatus } from '../enums';

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  objectives: string;

  @IsString()
  @IsOptional()
  @IsEnum(ChapterStatus)
  status: ChapterStatus;

  @IsString()
  @IsOptional()
  @IsEnum(ChapterAccess)
  access: ChapterAccess;
}
