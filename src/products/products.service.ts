/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRespository.create(createProductDto);
      await this.productRespository.save(product);
      return product;
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll() {
    return await this.productRespository.find();
  }

  findOne(id: string) {
    return this.productRespository.findOneBy({ id });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    await this.productRespository.remove(product);
  }

  private handleDBExeptions(error: any) {
    if ((error.code = '23505')) throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
