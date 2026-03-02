export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  protected constructor(id: string, createdAt: string, updatedAt: string) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  protected toJSONBase(): { id: string; createdAt: string; updatedAt: string } {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
