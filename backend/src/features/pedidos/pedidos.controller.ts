import { Request, Response, NextFunction } from 'express';
import { PedidosService } from './pedidos.service';

const service = new PedidosService();

export class PedidosController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const pedidos = await service.obtenerTodos();
      res.json({ success: true, data: pedidos });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const pedido = await service.obtenerPorId(id);
      if (!pedido) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      res.json({ success: true, data: pedido });
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

  async actualizarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;
      const actualizado = await service.cambiarEstado(id, estado);
      res.json({ success: true, data: actualizado });
    } catch (err) {
      next(err);
    }
  }
}
