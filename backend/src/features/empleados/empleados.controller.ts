import { Request, Response, NextFunction } from 'express';
import { EmpleadosService } from './empleados.service';

const service = new EmpleadosService();

export class EmpleadosController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const empleados = await service.obtenerTodos();
      res.json({ success: true, data: empleados });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const empleado = await service.obtenerPorId(id);
      if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      res.json({ success: true, data: empleado });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (data.id_departamento) data.id_departamento = Number(data.id_departamento);
      if (data.id_provincia) data.id_provincia = Number(data.id_provincia);
      if (data.id_distrito) data.id_distrito = Number(data.id_distrito);

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
      if (data.id_provincia) data.id_provincia = Number(data.id_provincia);
      if (data.id_distrito) data.id_distrito = Number(data.id_distrito);

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
      res.json({ success: true, message: 'Empleado eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
