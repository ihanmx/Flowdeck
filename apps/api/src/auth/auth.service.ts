import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService, // ← THIS creates this.users
    private readonly jwt: JwtService, // ← and this creates this.jwt
    private readonly config: ConfigService,
  ) {}
  async register(registerDto: RegisterDto) {
    const existingUser = await this.users.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use'); //err 409
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const user = await this.users.create({
      email: registerDto.email,
      passwordHash,
      name: registerDto.name,
    });

    return this.issueTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.users.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials'); //err 401
    }

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(user: { id: string; email: string; name: string | null }) {
    // issueTokens generates NEW tokens AND overwrites the stored hash → rotation
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.users.setRefreshToken(userId, null); // clear → refresh stops working
    return { success: true };
  }

  ///helpes

  private async issueTokens(user: {
    id: string;
    email: string;
    name: string | null;
  }) {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.users.setRefreshToken(userId, hashedRefreshToken);
  }
}
