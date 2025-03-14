import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'products',
})
export class Product {
  @ApiProperty({
    example: '212739d8-e231-48db-8b23-3441a31b9c1e',
    description: 'Prodct ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-shirt Teslo',
    description: 'Porduct Title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Adipisicing est ullamco est duis exercitation sit.',
    description: 'Product description',
    default: null,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 'T_shirt_Teslo'.toLocaleLowerCase(),
    description: 'Product SLUG - for SEO',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product Stock',
    default: 0,
  })
  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['M', 'XL', 'XLL'],
    description: 'Product sizes',
  })
  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
  })
  @Column({
    type: 'text',
  })
  gender: string;

  @ApiProperty({
    example: ['shirt'],
    default: [],
  })
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  CheckslugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.validSlug();
  }

  @BeforeUpdate()
  CheckslugInserted() {
    this.slug = this.validSlug();
  }

  private validSlug() {
    return this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }
}
