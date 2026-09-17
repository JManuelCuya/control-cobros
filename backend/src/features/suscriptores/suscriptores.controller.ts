import { Request, Response, NextFunction } from 'express';
import { SuscriptoresService } from './suscriptores.service';

const service = new SuscriptoresService();

export class SuscriptoresController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.obtenerTodos();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const item = await service.obtenerPorId(id);
      if (!item) return res.status(404).json({ success: false, message: 'No encontrado' });
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (data.id_departamento) data.id_departamento = Number(data.id_departamento);
      if (data.id_distrito) data.id_distrito = Number(data.id_distrito);
      if (data.id_sucursal) data.id_sucursal = Number(data.id_sucursal);
      if (data.id_cliente) data.id_cliente = Number(data.id_cliente);
      if (data.dia_pago) data.dia_pago = Number(data.dia_pago);

      const nuevo = await service.crear(data);
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = { ...req.body };
      if (data.id_departamento) data.id_departamento = Number(data.id_departamento);
      if (data.id_distrito) data.id_distrito = Number(data.id_distrito);
      if (data.id_sucursal) data.id_sucursal = Number(data.id_sucursal);
      if (data.id_cliente) data.id_cliente = Number(data.id_cliente);
      if (data.dia_pago) data.dia_pago = Number(data.dia_pago);

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
      res.json({ success: true, message: 'Eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
