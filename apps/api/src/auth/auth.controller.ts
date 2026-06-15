import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './decorators/current-user.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // By default, POST requests return 201 Created, but for login we want to return 200 OK
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser() user: AuthUser) {
    return this.auth.refresh(user);
  }

  @UseGuards(JwtAuthGuard) // validates the ACCESS token
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: AuthUser) {
    return this.auth.logout(user.id);
  }

  // @CurrentUser()	the decorator	provides the value — "fill this parameter with request.user" so the decorator tells nest what is the value of user
}
