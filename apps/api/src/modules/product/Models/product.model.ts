import type { Product as IProduct, ProductCategoryCode } from '@belearning/shared';
import { PRODUCT_CATEGORY_CODES } from '@belearning/utils';
import { BaseEntity } from '../../../shared/entities/base.entity.js';
import { InvalidProductError } from '../Errors/product.errors.js';
import { Money, Slug } from '../ValueObjects/product.value-objects.js';

const VALID_CATEGORIES = new Set<string>(PRODUCT_CATEGORY_CODES);

function validateCategories(categories?: ProductCategoryCode[]): ProductCategoryCode[] | undefined {
  if (!categories || categories.length === 0) {
    return undefined;
  }
  const out = categories.filter((c): c is ProductCategoryCode => VALID_CATEGORIES.has(c));
  return out.length > 0 ? out : undefined;
}

export class Product extends BaseEntity {
  private _name: string;
  private readonly _slug: Slug;
  private readonly _price: Money;
  private _description?: string;
  private readonly _categories?: ProductCategoryCode[];
  private readonly _manufacturer?: string;

  private constructor(
    id: string,
    name: string,
    slug: Slug,
    price: Money,
    createdAt: string,
    updatedAt: string,
    description?: string,
    categories?: ProductCategoryCode[],
    manufacturer?: string
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._slug = slug;
    this._price = price;
    this._description = description;
    this._categories = categories;
    this._manufacturer = manufacturer;
  }

  public get name(): string {
    return this._name;
  }

  public get slug(): string {
    return this._slug.toString();
  }

  public get price(): number {
    return this._price.getAmount();
  }

  public get currency(): string {
    return this._price.getCurrency();
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get categories(): ProductCategoryCode[] | undefined {
    return this._categories?.length ? [...this._categories] : undefined;
  }

  public get manufacturer(): string | undefined {
    return this._manufacturer?.trim() || undefined;
  }

  public static create(params: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency?: string;
    description?: string;
    categories?: ProductCategoryCode[];
    manufacturer?: string;
    createdAt: string;
    updatedAt: string;
  }): Product {
    const name = params.name?.trim();
    if (!name) {
      throw new InvalidProductError('Product name is required.');
    }
    const slug = Slug.create(params.slug);
    const price = Money.create(params.price, params.currency ?? 'USD');
    const categories = validateCategories(params.categories);
    return new Product(
      params.id,
      name,
      slug,
      price,
      params.createdAt,
      params.updatedAt,
      params.description?.trim() || undefined,
      categories,
      params.manufacturer?.trim() || undefined
    );
  }

  public static fromPlain(data: IProduct): Product {
    const name = data.name?.trim();
    if (!name) {
      throw new InvalidProductError('Product name is required.');
    }
    const slug = Slug.fromExisting(data.slug);
    const price = Money.fromExisting(data.price, data.currency);
    const categories = validateCategories(data.categories);
    return new Product(
      data.id,
      name,
      slug,
      price,
      data.createdAt,
      data.updatedAt,
      data.description,
      categories,
      data.manufacturer
    );
  }

  public toJSON(): IProduct {
    return {
      ...this.toJSONBase(),
      name: this._name,
      slug: this._slug.toString(),
      description: this._description,
      price: this._price.getAmount(),
      currency: this._price.getCurrency(),
      categories: this._categories?.length ? [...this._categories] : undefined,
      manufacturer: this._manufacturer?.trim() || undefined,
    };
  }
}
