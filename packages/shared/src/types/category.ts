export interface Category {
  code: string;
  name?: string;
  parentCode?: string | null;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}
