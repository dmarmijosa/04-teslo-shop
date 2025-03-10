import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async runSeed() {
    await this.deleTables();
    const adminUser = await this.insertUser();
    await this.insertProduct(adminUser);
    return 'SEED EXECUTED';
  }

  private async deleTables() {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUser() {
    const seedUser = initialData.users;
    const users: User[] = [];
    seedUser.forEach((user) => {
      users.push(this.userRepository.create(user));
    });
    const dbUser = await this.userRepository.save(seedUser);
    return dbUser[0];
  }
  private async insertProduct(adminUser: User) {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises: Promise<any>[] = [];
    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, adminUser));
    });
    await Promise.all(insertPromises);
    return true;
  }
}
