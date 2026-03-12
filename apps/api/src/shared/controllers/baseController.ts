import type { Request, Response } from 'express';

export abstract class BaseController {
  protected async getByIdAndSend(
    req: Request,
    res: Response,
    entityName: string,
    fetch: (id: string) => Promise<unknown>
  ): Promise<void> {
    const result = await fetch(req.params.id);
    if (!result) {
      res.status(404).json({ error: `${entityName} not found` });
      return;
    }
    res.json(result);
  }
}
