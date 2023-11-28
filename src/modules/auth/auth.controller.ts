import {
  Controller,
  Post,
  Body,
  Request,
  Response,
  UseGuards,
  HttpCode,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos';
import { UsersService } from '../users/users.service';
import { RequestWithUser } from '../../shared/interfaces';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithUser,
    @Response() res: ExpressResponse,
  ) {
    // Generate auth tokens
    const { accessToken, refreshToken } = await this.authService.genAuthTokens(
      req.user,
    );

    // Remove password from response
    const { password, ...rest } = req.user;

    return res
      .status(200)
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: rest, accessToken });
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Response() res: ExpressResponse,
  ) {
    // Create user
    const siteUser = await this.usersService.createOne(registerDto);

    // Generate auth tokens
    const { accessToken, refreshToken } =
      await this.authService.genAuthTokens(siteUser);

    // Remove password from response
    const { password, ...rest } = siteUser;

    return res
      .status(200)
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: rest, accessToken });
  }

  @Get('refresh')
  async refresh(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    console.log(req.cookies);

    const { accessToken, refreshToken, user } = await this.authService.refresh(
      req.cookies.refresh_token,
    );

    const { password, ...rest } = user;
    return res
      .status(200)
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: rest, accessToken });
  }
}
