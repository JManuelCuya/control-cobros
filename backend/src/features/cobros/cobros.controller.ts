import { Request, Response, NextFunction } from 'express';
import { CobrosService } from './cobros.service';

const service = new CobrosService();

export class CobrosController {
  async obtenerMatriz(req: Request, res: Response, next: NextFunction) {
    try {
      const anio = req.query.anio ? Number(req.query.anio) : new Date().getFullYear();
      const matriz = await service.obtenerMatrizCobros(anio);
      res.json({ success: true, data: matriz });
    } catch (err) {
      next(err);
    }
  }

  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id_contrato, anio, mes, estado, monto, observacion } = req.body;
      const resultado = await service.registrarCobro({
        id_contrato: Number(id_contrato),
        anio: Number(anio),
        mes: Number(mes),
        estado,
        monto: monto !== undefined ? Number(monto) : undefined,
        observacion
      });
      res.json({ success: true, data: resultado });
    } catch (err) {
      next(err);
    }
  }
}
