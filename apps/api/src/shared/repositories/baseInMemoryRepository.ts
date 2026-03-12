type EntityWithId = { id: string };

export abstract class BaseInMemoryRepository<T extends EntityWithId> {
  protected readonly store = new Map<string, T>();

  public async findById(id: string): Promise<T | null> {
    return this.store.get(id) ?? null;
  }

  public async save(entity: T): Promise<T> {
    this.store.set(entity.id, entity);
    return entity;
  }
}
