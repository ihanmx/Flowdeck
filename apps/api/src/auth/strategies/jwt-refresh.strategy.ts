import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';

type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh', // ← this strategy's NAME (distinct from the default 'jwt')
) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // ← so validate() can read the raw token
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = (req.get('authorization') ?? '')
      .replace('Bearer', '')
      .trim();

    const user = await this.users.findById(payload.sub);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const matches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!matches) {
      throw new UnauthorizedException('Access denied');
    }

    return { id: user.id, email: user.email, name: user.name };
  }
}
