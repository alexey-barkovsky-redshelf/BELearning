import { InvalidSlugError } from '../errors.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class Slug {
  private constructor(private readonly value: string) {}

  static create(input: string): Slug {
    const normalized = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (!normalized) {
      throw new InvalidSlugError(input);
    }
    if (!SLUG_REGEX.test(normalized)) {
      throw new InvalidSlugError(input);
    }
    return new Slug(normalized);
  }

  static fromExisting(value: string): Slug {
    if (!value || !SLUG_REGEX.test(value)) {
      throw new InvalidSlugError(value);
    }
    return new Slug(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
