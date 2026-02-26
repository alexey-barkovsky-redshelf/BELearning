export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, (this.constructor as typeof DomainError).prototype);
  }
}
