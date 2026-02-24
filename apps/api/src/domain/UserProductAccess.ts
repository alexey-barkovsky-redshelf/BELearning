import type { UserProductAccess as IUserProductAccess } from '@belearning/shared';
import { InvalidUserProductAccessError } from './errors.js';

/**
 * Grants a user access to a product (e.g. after purchase).
 * Product usage (web view vs download) is defined on Product; this only records the grant.
 */
export class UserProductAccess {
  private constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly grantedAt: string,
    private readonly _sourceOrderId?: string,
    private readonly _expiresAt?: string
  ) {}

  get sourceOrderId(): string | undefined {
    return this._sourceOrderId;
  }

  get expiresAt(): string | undefined {
    return this._expiresAt;
  }

  isValid(): boolean {
    if (!this._expiresAt) {
      return true;
    }
    return new Date(this._expiresAt).getTime() > Date.now();
  }

  static create(params: {
    userId: string;
    productId: string;
    grantedAt: string;
    sourceOrderId?: string;
    expiresAt?: string;
  }): UserProductAccess {
    if (!params.userId?.trim()) {
      throw new InvalidUserProductAccessError('userId is required.');
    }
    if (!params.productId?.trim()) {
      throw new InvalidUserProductAccessError('productId is required.');
    }
    return new UserProductAccess(
      params.userId,
      params.productId,
      params.grantedAt,
      params.sourceOrderId,
      params.expiresAt
    );
  }

  static fromPlain(data: IUserProductAccess): UserProductAccess {
    return new UserProductAccess(
      data.userId,
      data.productId,
      data.grantedAt,
      data.sourceOrderId,
      data.expiresAt
    );
  }

  toJSON(): IUserProductAccess {
    return {
      userId: this.userId,
      productId: this.productId,
      grantedAt: this.grantedAt,
      sourceOrderId: this._sourceOrderId,
      expiresAt: this._expiresAt,
    };
  }
}
