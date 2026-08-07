import type { Category as ICategory } from '@belearning/shared';

export class Category {
  public readonly code: string;
  public readonly name: string;
  public readonly parentCode: string | null;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  private constructor(
    code: string,
    name: string,
    parentCode: string | null,
    createdAt: string,
    updatedAt: string,
  ) {
    this.code = code;
    this.name = name;
    this.parentCode = parentCode;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(params: {
    code: string;
    name: string;
    parentCode?: string | null;
    createdAt: string;
    updatedAt: string;
  }): Category {
    if (!params.code.trim()) {
      throw new Error('Category code is required.');
    }
    if (!params.name.trim()) {
      throw new Error('Category name is required.');
    }
    if (params.parentCode !== undefined && params.parentCode !== null && params.parentCode === params.code) {
      throw new Error('Category cannot be its own parent.');
    }
    return new Category(
      params.code,
      params.name,
      params.parentCode ?? null,
      params.createdAt,
      params.updatedAt,
    );
  }

  public toJSON(): ICategory {
    return {
      code: this.code,
      name: this.name,
      parentCode: this.parentCode,
    };
  }
}
