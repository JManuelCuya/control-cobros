import { Request, Response, NextFunction } from 'express';
import { ProveedoresService } from './proveedores.service';

const service = new ProveedoresService();

export class ProveedoresController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const proveedores = await service.obtenerTodos();
      res.json({ success: true, data: proveedores });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const proveedor = await service.obtenerPorId(id);
      if (!proveedor) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
      res.json({ success: true, data: proveedor });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const nuevo = await service.crear(req.body);
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const actualizado = await service.actualizar(id, req.body);
      res.json({ success: true, data: actualizado });
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await service.eliminar(id);
      res.json({ success: true, message: 'Proveedor eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
