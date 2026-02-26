import type { Product as IProduct, ProductCategoryCode } from '@belearning/shared';
import { PRODUCT_CATEGORY_CODES } from '@belearning/shared';
import { InvalidProductError } from './product.errors.js';
import { Money, Slug } from './product.value-objects.js';

const VALID_CATEGORIES = new Set<string>(PRODUCT_CATEGORY_CODES);

function validateCategories(categories?: ProductCategoryCode[]): ProductCategoryCode[] | undefined {
  if (!categories || categories.length === 0) {
    return undefined;
  }
  const out = categories.filter((c): c is ProductCategoryCode => VALID_CATEGORIES.has(c));
  return out.length > 0 ? out : undefined;
}

export class Product {
  private constructor(
    public readonly id: string,
    private _name: string,
    private readonly _slug: Slug,
    private readonly _price: Money,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    private _description?: string,
    private readonly _categories?: ProductCategoryCode[],
    private readonly _manufacturer?: string
  ) {}

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug.toString();
  }

  get price(): number {
    return this._price.getAmount();
  }

  get currency(): string {
    return this._price.getCurrency();
  }

  get description(): string | undefined {
    return this._description;
  }

  get categories(): ProductCategoryCode[] | undefined {
    return this._categories?.length ? [...this._categories] : undefined;
  }

  get manufacturer(): string | undefined {
    return this._manufacturer?.trim() || undefined;
  }

  static create(params: {
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

  static fromPlain(data: IProduct): Product {
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

  toJSON(): IProduct {
    return {
      id: this.id,
      name: this._name,
      slug: this._slug.toString(),
      description: this._description,
      price: this._price.getAmount(),
      currency: this._price.getCurrency(),
      categories: this._categories?.length ? [...this._categories] : undefined,
      manufacturer: this._manufacturer?.trim() || undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
