import type { User as IUser } from '@belearning/shared';
import { Email } from '../ValueObjects/user.value-objects.js';

export class User {
  private constructor(
    public readonly id: string,
    private readonly _email: Email,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    private _name?: string
  ) {}

  get email(): string {
    return this._email.toString();
  }

  get name(): string | undefined {
    return this._name;
  }

  static create(params: {
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

  static fromPlain(data: IUser): User {
    const email = Email.fromExisting(data.email);
    return new User(
      data.id,
      email,
      data.createdAt,
      data.updatedAt,
      data.name?.trim() || undefined
    );
  }

  toJSON(): IUser {
    return {
      id: this.id,
      email: this._email.toString(),
      name: this._name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
