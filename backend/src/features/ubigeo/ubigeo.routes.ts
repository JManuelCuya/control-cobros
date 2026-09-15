import { Router } from 'express';
import { UbigeoController } from './ubigeo.controller';

const router = Router();
const controller = new UbigeoController();

router.get('/departamentos', (req, res, next) => controller.listarDepartamentos(req, res, next));
router.get('/provincias/:idDepartamento', (req, res, next) => controller.listarProvincias(req, res, next));
router.get('/distritos/:idProvincia', (req, res, next) => controller.listarDistritos(req, res, next));

export default router;
