import type { User as IUser } from '@belearning/shared';
import { BaseEntity } from '../../../shared/entities/index.js';
import { Email } from '../ValueObjects/index.js';

export class User extends BaseEntity {
  private readonly _email: Email;
  private _name?: string;

  private constructor(id: string, _email: Email, createdAt: string, updatedAt: string, name?: string) {
    super(id, createdAt, updatedAt);
    this._email = _email;
    this._name = name;
  }

  public get email(): string {
    return this._email.toString();
  }

  public get name(): string | undefined {
    return this._name;
  }

  public static create(params: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
  }): User {
    const email = Email.create(params.email);
    const name = params.name?.trim() || undefined;
    return new User(params.id, email, params.createdAt, params.updatedAt, name);
  }

  public static fromPlain(data: IUser): User {
    const email = Email.fromExisting(data.email);
    return new User(
      data.id,
      email,
      data.createdAt,
      data.updatedAt,
      data.name?.trim() || undefined
    );
  }

  public toJSON(): IUser {
    return {
      ...this.toJSONBase(),
      email: this._email.toString(),
      name: this._name,
    };
  }
}
