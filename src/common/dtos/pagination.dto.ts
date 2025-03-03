/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDTO {
  @IsNumber()
  @IsOptional()
  @Type(() => Number) //enable Implicit convertions
  limit: number;

  @Type(() => Number) //enable Implicit convertions
  @IsNumber()
  @Min(0)
  @IsOptional()
  offset: number;
}
