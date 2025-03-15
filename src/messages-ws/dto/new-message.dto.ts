import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class NewMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  message: string;
}
