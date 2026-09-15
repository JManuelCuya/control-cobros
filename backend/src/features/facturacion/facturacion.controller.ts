import { Request, Response, NextFunction } from 'express';
import { FacturacionService } from './facturacion.service';

const service = new FacturacionService();

export class FacturacionController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const lista = await service.obtenerTodos();
      res.json({ success: true, data: lista });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const comp = await service.obtenerPorId(id);
      if (!comp) return res.status(404).json({ success: false, message: 'Comprobante no encontrado' });
      res.json({ success: true, data: comp });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const nuevo = await service.crearComprobante(req.body);
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async cambiarEstadoPago(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { estado_pago } = req.body;
      const actualizado = await service.cambiarEstadoPago(id, estado_pago);
      res.json({ success: true, data: actualizado });
    } catch (err) {
      next(err);
    }
  }
}
