import { Request, Response, NextFunction } from 'express';
import { DecodificadoresService } from './decodificadores.service';

const service = new DecodificadoresService();

export class DecodificadoresController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const decodificadores = await service.obtenerTodos();
      res.json({ success: true, data: decodificadores });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const nuevo = await service.crear({
        sticker: data.sticker,
        codigo_cliente: data.codigo_cliente,
        serial_ird: data.serial_ird,
        tarjeta_sc: data.tarjeta_sc,
        fecha_fabricacion: data.fecha_fabricacion ? new Date(data.fecha_fabricacion) : undefined,
        costo: data.costo ? Number(data.costo) : undefined,
        detalles: data.detalles,
        id_plan_mensual: data.id_plan_mensual ? Number(data.id_plan_mensual) : undefined,
        id_sucursal: data.id_sucursal ? Number(data.id_sucursal) : undefined,
        id_producto: data.id_producto ? Number(data.id_producto) : undefined,
        id_proveedor: data.id_proveedor ? Number(data.id_proveedor) : undefined,
      });
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      
      const updateData = { ...req.body };
      if (updateData.fecha_fabricacion) updateData.fecha_fabricacion = new Date(updateData.fecha_fabricacion);
      if (updateData.costo) updateData.costo = Number(updateData.costo);
      if (updateData.id_plan_mensual) updateData.id_plan_mensual = Number(updateData.id_plan_mensual);
      if (updateData.id_sucursal) updateData.id_sucursal = Number(updateData.id_sucursal);
      if (updateData.id_producto) updateData.id_producto = Number(updateData.id_producto);
      if (updateData.id_proveedor) updateData.id_proveedor = Number(updateData.id_proveedor);
      if (updateData.fecha_asignacion) updateData.fecha_asignacion = new Date(updateData.fecha_asignacion);

      const actualizado = await service.actualizar(id, updateData);
      res.json({ success: true, data: actualizado });
    } catch (err) {
      next(err);
    }
  }

  async asignar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { id_cliente, id_suscriptor, fecha_asignacion } = req.body;
      const actualizado = await service.asignar(id, { 
        id_cliente: id_cliente ? Number(id_cliente) : null,
        id_suscriptor: id_suscriptor ? Number(id_suscriptor) : null,
        fecha_asignacion: fecha_asignacion ? new Date(fecha_asignacion) : undefined
      });
      res.json({ success: true, data: actualizado });
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await service.eliminar(id);
      res.json({ success: true, message: 'Decodificador eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
