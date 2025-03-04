/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

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

  async findAll(paginationDTO: PaginationDTO) {
    const { limit = 10, offset = 0 } = paginationDTO;
    return await this.productRespository.find({
      take: limit,
      skip: offset,
      //TODO: relaciones
    });
  }

  async findOne(term: string) {
    let product: Product | null = null;
    if (isUUID(term)) {
      product = await this.productRespository.findOneBy({ id: term });
    } else {
      //product = await this.productRespository.findOneBy({ slug: term });
      const queryBuilder = this.productRespository.createQueryBuilder();
      product = await queryBuilder
        .where(`LOWER(title) = LOWER(:title) or LOWER(slug) = LOWER(:slug)`, {
          title: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }
    if (!product) throw new NotFoundException(`Product whit ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRespository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found `);

    try {
      await this.productRespository.save(product);
      return product;
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    await this.productRespository.remove(product);
  }

  private handleDBExeptions(error: any) {
    // eslint-disable-next-line no-constant-condition
    if ((error.code = '23505')) throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
