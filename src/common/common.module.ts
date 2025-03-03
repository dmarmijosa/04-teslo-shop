import { Module } from '@nestjs/common';
import { PaginationDTO } from './dtos/pagination.dto';

@Module({
  providers: [PaginationDTO],
  exports: [PaginationDTO],
})
export class CommonModule {}
