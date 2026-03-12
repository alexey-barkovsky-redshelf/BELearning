export type EntityWithToJson<TPlain> = { toJSON(): TPlain };

type RepositoryWithFindById<T> = { findById(id: string): Promise<T | null> };

export abstract class BaseEntityService<
  TEntity extends EntityWithToJson<TPlain>,
  TPlain,
  TRepository extends RepositoryWithFindById<TEntity> = RepositoryWithFindById<TEntity>
> {
  protected constructor(protected readonly repository: TRepository) {}

  protected toPlain(entity: TEntity | null): TPlain | null {
    return entity?.toJSON() ?? null;
  }

  protected toPlains(entities: TEntity[]): TPlain[] {
    return entities.map((e) => e.toJSON());
  }

  public async getById(id: string): Promise<TPlain | null> {
    return this.toPlain(await this.repository.findById(id));
  }
}
