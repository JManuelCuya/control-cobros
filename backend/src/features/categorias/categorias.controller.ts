import { Request, Response, NextFunction } from 'express';
import { CategoriasService } from './categorias.service';

const service = new CategoriasService();

export class CategoriasController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const categorias = await service.obtenerTodas();
      res.json({ success: true, data: categorias });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const categoria = await service.obtenerPorId(id);
      if (!categoria) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      res.json({ success: true, data: categoria });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { descripcion, tipo } = req.body;
      const nueva = await service.crear(descripcion, tipo);
      res.status(201).json({ success: true, data: nueva });
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { descripcion, tipo } = req.body;
      const actualizada = await service.actualizar(id, descripcion, tipo);
      res.json({ success: true, data: actualizada });
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await service.eliminar(id);
      res.json({ success: true, message: 'Categoría eliminada' });
    } catch (err) {
      next(err);
    }
  }
}
