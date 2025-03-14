import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDTO {
  @ApiProperty({
    default: 10,
    description: 'How many rows do you need ?',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number) //enable Implicit convertions
  limit: number;

  @ApiProperty({
    default: 10,
    description: 'How many rows do you wants to skip ?',
  })
  @Type(() => Number) //enable Implicit convertions
  @IsNumber()
  @Min(0)
  @IsOptional()
  offset: number;
}
