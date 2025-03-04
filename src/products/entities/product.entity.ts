import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0,
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  size: string[];
  @Column({
    type: 'text',
  })
  gender: string;

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
  })
  images?: ProductImage;

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
