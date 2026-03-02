import type { User as IUser } from '@belearning/shared';
import { Email } from '../ValueObjects/user.value-objects.js';

export class User {
  public readonly id: string;
  private readonly _email: Email;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  private _name?: string;

  private constructor(id: string, _email: Email, createdAt: string, updatedAt: string, name?: string) {
    this.id = id;
    this._email = _email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
      id: this.id,
      email: this._email.toString(),
      name: this._name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
