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
      const contratos = await service.obtenerPorCliente(idCliente, undefined);
      res.json({ success: true, data: contratos });
    } catch (err) {
      next(err);
    }
  }

  async listarPorSuscriptor(req: Request, res: Response, next: NextFunction) {
    try {
      const idSuscriptor = Number(req.params.idSuscriptor);
      const contratos = await service.obtenerPorCliente(undefined, idSuscriptor);
      res.json({ success: true, data: contratos });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (data.fecha_inicio) data.fecha_inicio = new Date(data.fecha_inicio);
      const nuevo = await service.crear(data);
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const updateData = { ...req.body };
      if (updateData.fecha_inicio) updateData.fecha_inicio = new Date(updateData.fecha_inicio);
      
      const actualizado = await service.actualizar(id, updateData);
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
