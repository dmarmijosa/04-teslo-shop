import { PickType } from '@nestjs/swagger';
import { CreateUserDTO } from './create-user.dto';

export class LoginUserDto extends PickType(CreateUserDTO, [
  'email',
  'password',
]) {}
