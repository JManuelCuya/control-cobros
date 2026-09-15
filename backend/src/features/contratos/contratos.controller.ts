import { Request, Response, NextFunction } from 'express';
import { ContratosService } from './contratos.service';

const service = new ContratosService();

export class ContratosController {
  async listarTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const contratos = await service.obtenerTodos();
      res.json({ success: true, data: contratos });
    } catch (err) {
      next(err);
    }
  }

  async listarPorCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const idCliente = Number(req.params.idCliente);
      const contratos = await service.obtenerPorCliente(idCliente);
      res.json({ success: true, data: contratos });
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
      res.json({ success: true, message: 'Contrato eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
