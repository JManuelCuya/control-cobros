import { Request, Response, NextFunction } from 'express';
import { UbigeoService } from './ubigeo.service';

const service = new UbigeoService();

export class UbigeoController {
  async listarDepartamentos(req: Request, res: Response, next: NextFunction) {
    try {
      const departamentos = await service.obtenerDepartamentos();
      res.json({ success: true, data: departamentos });
    } catch (err) {
      next(err);
    }
  }

  async listarProvincias(req: Request, res: Response, next: NextFunction) {
    try {
      const idDep = Number(req.params.idDepartamento);
      const provincias = await service.obtenerProvinciasPorDepartamento(idDep);
      res.json({ success: true, data: provincias });
    } catch (err) {
      next(err);
    }
  }

  async listarDistritos(req: Request, res: Response, next: NextFunction) {
    try {
      const idProv = Number(req.params.idProvincia);
      const distritos = await service.obtenerDistritosPorProvincia(idProv);
      res.json({ success: true, data: distritos });
    } catch (err) {
      next(err);
    }
  }
}
