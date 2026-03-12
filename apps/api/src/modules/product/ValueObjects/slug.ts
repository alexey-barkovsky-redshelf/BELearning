import { InvalidSlugError } from '../Errors/index.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class Slug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(input: string): Slug {
    const normalized = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (!normalized) {
      throw new InvalidSlugError(input);
    }
    if (!SLUG_REGEX.test(normalized)) {
      throw new InvalidSlugError(input);
    }
    return new Slug(normalized);
  }

  public static fromExisting(value: string): Slug {
    if (!value || !SLUG_REGEX.test(value)) {
      throw new InvalidSlugError(value);
    }
    return new Slug(value);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
