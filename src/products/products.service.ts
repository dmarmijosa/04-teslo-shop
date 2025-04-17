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
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRespository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user,
      });
      await this.productRespository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationDTO: PaginationDTO) {
    const { limit = 10, offset = 0, gender = '' } = paginationDTO;
    const products = await this.productRespository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
      order: {
        id: 'ASC',
      },
      where: gender ? [{ gender }, { gender: 'unisex' }] : {},
    });
    const totalProducts = await this.productRespository.count({
      where: gender ? [{ gender }, { gender: 'unisex' }] : {},
    });
    return {
      count: totalProducts,
      pages: Math.ceil(totalProducts / limit),
      products: products.map((product) => ({
        ...product,
        images: product.images ? product.images.map((img) => img.url) : [],
      })),
    };
  }

  async findOne(term: string) {
    let product: Product | null = null;
    if (isUUID(term)) {
      product = await this.productRespository.findOneBy({ id: term });
    } else {
      //product = await this.productRespository.findOneBy({ slug: term });
      const queryBuilder =
        this.productRespository.createQueryBuilder('product');
      product = await queryBuilder
        .where(`LOWER(title) = LOWER(:title) or LOWER(slug) = LOWER(:slug)`, {
          title: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }
    if (!product) throw new NotFoundException(`Product whit ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUppdate } = updateProductDto;
    const product = await this.productRespository.preload({ id, ...toUppdate });
    //Create queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found `);

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      product.user = user;
      await queryRunner.manager.save(product);
      //await this.productRespository.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async deleteAllProducts() {
    const query = this.productRespository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExeptions(error);
    }
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
