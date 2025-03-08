import { InternalServerErrorException, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (!configService.get('SECRET_PASSWORD'))
          throw new InternalServerErrorException(
            'Error en la configuracion global',
          );
        return {
          secret: configService.get('SECRET_PASSWORD'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
    // JwtModule.register({
    //   secret: process.env.SECRET_PASSWORD,
    //   signOptions: {
    //     expiresIn: '2h',
    //   },
    // }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [TypeOrmModule],
})
export class AuthModule {}
