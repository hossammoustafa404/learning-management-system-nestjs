import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../shared/interfaces';
import { RolesGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateMeDto } from './dtos/update-me.dto';
import { UserRole } from './enums/user-role.enum';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin, UserRole.Admin)
  @Post()
  async createOne(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createOne(createUserDto);
    return { user };
  }

  @Get()
  async findMany() {
    const users = await this.usersService.findMany();
    return { users };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMe(@Req() req: RequestWithUser) {
    const user = await this.usersService.findOneById(req.user.id);
    return { user };
  }

  @Get(':userId')
  async findOneById(@Param('userId') userId: string) {
    const user = await this.usersService.findOneById(userId);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateMeDto,
  ) {
    const updatedUser = await this.usersService.updateOneById(
      req.user.id,
      updateUserDto,
    );

    return {
      user: updatedUser,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Patch(':userId')
  async updateOneById(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId') userId: string,
  ) {
    const updatedUser = await this.usersService.updateOneById(
      userId,
      updateUserDto,
    );

    return {
      user: updatedUser,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@Req() req: RequestWithUser) {
    await this.usersService.deleteOneById(req.user.id);
    return { msg: 'User has been deleted successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  async deleteOneById(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ) {
    // Throw an error if current user does not an admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete another user');
    }

    await this.usersService.deleteOneById(userId);

    return { msg: 'User has been deleted successfully' };
  }
}
