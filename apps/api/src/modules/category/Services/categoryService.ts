import type { Category as ICategory, CategoryNode } from '@belearning/shared';
import type { Category } from '../Models/index.js';
import type { ICategoryRepository } from '../Types/index.js';

export class CategoryService {
  public constructor(private readonly repository: ICategoryRepository) {}

  public async list(): Promise<ICategory[]> {
    const entities = await this.repository.findAll();
    return entities.map((e) => e.toJSON());
  }

  public async getTree(): Promise<CategoryNode[]> {
    const all = await this.repository.findAll();
    return CategoryService.buildTree(all);
  }

  private static buildTree(all: Category[]): CategoryNode[] {
    const byCode = new Map<string, CategoryNode>();
    for (const c of all) {
      byCode.set(c.code, { ...c.toJSON(), children: [] });
    }

    const roots: CategoryNode[] = [];
    for (const c of all) {
      const node = byCode.get(c.code);
      if (!node) {
        continue;
      }
      if (c.parentCode === null || c.parentCode === undefined) {
        roots.push(node);
        continue;
      }
      const parent = byCode.get(c.parentCode);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}
