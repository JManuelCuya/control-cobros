import { Request, Response, NextFunction } from 'express';
import { ProductosService } from './productos.service';

const service = new ProductosService();

export class ProductosController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await service.obtenerTodos();
      res.json({ success: true, data: productos });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const producto = await service.obtenerPorId(id);
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      res.json({ success: true, data: producto });
    } catch (err) {
      next(err);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { descripcion, tipo, precio, stock, id_categoria_producto } = req.body;
      const nuevo = await service.crear({
        descripcion,
        tipo: tipo || 'ARTICULO',
        precio: precio !== undefined ? Number(precio) : 0,
        stock: tipo === 'SERVICIO' ? 0 : (stock !== undefined ? Number(stock) : 0),
        id_categoria_producto: id_categoria_producto ? Number(id_categoria_producto) : undefined
      });
      res.status(201).json({ success: true, data: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { descripcion, tipo, precio, stock, id_categoria_producto } = req.body;
      const data: any = {};
      if (descripcion !== undefined) data.descripcion = descripcion;
      if (tipo !== undefined) data.tipo = tipo;
      if (precio !== undefined) data.precio = Number(precio);
      if (tipo === 'SERVICIO') {
        data.stock = 0;
      } else if (stock !== undefined) {
        data.stock = Number(stock);
      }
      if (id_categoria_producto !== undefined) data.id_categoria_producto = Number(id_categoria_producto);

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
      res.json({ success: true, message: 'Producto eliminado' });
    } catch (err) {
      next(err);
    }
  }
}
