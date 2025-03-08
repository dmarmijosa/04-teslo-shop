import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';

export class LoginUserDto extends PartialType(
  PickType(CreateUserDTO, ['email', 'password']),
) {}
