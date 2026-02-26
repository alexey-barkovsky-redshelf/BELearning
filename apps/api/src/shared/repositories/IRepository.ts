export interface IRepository<T, Id = string> {
  findById(id: Id): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: Id): Promise<boolean>;
}
