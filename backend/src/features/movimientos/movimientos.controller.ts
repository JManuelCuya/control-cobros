import { Request, Response, NextFunction } from 'express';
import { MovimientosService } from './movimientos.service';

const service = new MovimientosService();

export class MovimientosController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const lista = await service.obtenerTodos();
      res.json({ success: true, data: lista });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const nuevo = await service.registrarMovimiento(req.body);
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }
}
