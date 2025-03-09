import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('SECRET_PASSWORD');
    if (!secret) {
      throw new Error('JWT secret is not defined in environment variables');
    }
    super({
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });

    if (!configService.get<string>('SECRET_PASSWORD')) {
      throw new Error('JWT secret is not defined in environment variables');
    }
  }
  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Token invalid');
    if (!user.isActive) throw new UnauthorizedException('User is inactive');
    return user;
  }
}
