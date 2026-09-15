import { Request, Response, NextFunction } from 'express';
import { PlanesService } from './planes.service';

const service = new PlanesService();

export class PlanesController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const planes = await service.obtenerTodos();
      res.json({ success: true, data: planes });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const plan = await service.obtenerPorId(id);
      if (!plan) return res.status(404).json({ success: false, message: 'Plan no encontrado' });
      res.json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { descripcion, descuento_porcentaje, id_categoria_plan, productosIds } = req.body;
      const nuevo = await service.crear({
        descripcion,
        descuento_porcentaje: descuento_porcentaje !== undefined ? Number(descuento_porcentaje) : 0,
        id_categoria_plan: id_categoria_plan ? Number(id_categoria_plan) : undefined,
        productosIds: productosIds && Array.isArray(productosIds) ? productosIds.map(Number) : undefined
      });
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { descripcion, descuento_porcentaje, id_categoria_plan, productosIds } = req.body;
      const data: any = {};
      if (descripcion !== undefined) data.descripcion = descripcion;
      if (descuento_porcentaje !== undefined) data.descuento_porcentaje = Number(descuento_porcentaje);
      if (id_categoria_plan !== undefined) data.id_categoria_plan = Number(id_categoria_plan);
      if (productosIds !== undefined && Array.isArray(productosIds)) data.productosIds = productosIds.map(Number);

      const actualizado = await service.actualizar(id, data);
      res.json({ success: true, data: actualizado });
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await service.eliminar(id);
      res.json({ success: true, message: 'Plan eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
