import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './seed-data';

@Injectable()
export class SeedService {
  constructor(private productService: ProductsService) {}
  async runSeed() {
    await this.inserProduct();
    return 'SEED EXECUTED';
  }

  private async inserProduct() {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises: Promise<any>[] = [];
    products.forEach((product) => {
      insertPromises.push(this.productService.create(product));
    });
    await Promise.all(insertPromises);
    return true;
  }
}
