import { Request, Response, NextFunction } from 'express';
import { UsuariosService } from './usuarios.service';

const service = new UsuariosService();

export class UsuariosController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarios = await service.obtenerTodos();
      res.json({ success: true, data: usuarios });
    } catch (err) {
      next(err);
    }
  }

  async listarRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await service.obtenerRoles();
      res.json({ success: true, data: roles });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const usuario = await service.obtenerPorId(id);
      if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      res.json({ success: true, data: usuario });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { correo, password, descripcion, id_roles, id_empleado, id_cliente, id_proveedor } = req.body;
      const nuevo = await service.crear({
        correo,
        password,
        descripcion,
        id_roles: Array.isArray(id_roles) ? id_roles.map((r: any) => Number(r)) : [],
        id_empleado: id_empleado ? Number(id_empleado) : undefined,
        id_cliente: id_cliente ? Number(id_cliente) : undefined,
        id_proveedor: id_proveedor ? Number(id_proveedor) : undefined,
      });
      res.status(201).json({ success: true, data: nuevo });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error al crear usuario' });
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { correo, password, descripcion, id_roles, id_empleado, id_cliente, id_proveedor } = req.body;
      const data: any = {};
      if (correo !== undefined) data.correo = correo;
      if (password !== undefined) data.password = password;
      if (descripcion !== undefined) data.descripcion = descripcion;
      if (id_roles !== undefined) data.id_roles = Array.isArray(id_roles) ? id_roles.map((r: any) => Number(r)) : [];
      if (id_empleado !== undefined) data.id_empleado = id_empleado ? Number(id_empleado) : null;
      if (id_cliente !== undefined) data.id_cliente = id_cliente ? Number(id_cliente) : null;
      if (id_proveedor !== undefined) data.id_proveedor = id_proveedor ? Number(id_proveedor) : null;

      const actualizado = await service.actualizar(id, data);
      res.json({ success: true, data: actualizado });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error al actualizar usuario' });
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await service.eliminar(id);
      res.json({ success: true, message: 'Usuario eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
