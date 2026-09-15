import { Router } from 'express';
import { CobrosController } from './cobros.controller';

const router = Router();
const controller = new CobrosController();

router.get('/matriz', (req, res, next) => controller.obtenerMatriz(req, res, next));
router.post('/registrar', (req, res, next) => controller.registrar(req, res, next));

export default router;
