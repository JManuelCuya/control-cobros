import { Router } from 'express';
import { MovimientosController } from './movimientos.controller';

const router = Router();
const controller = new MovimientosController();

router.get('/', (req, res, next) => controller.listar(req, res, next));
router.post('/', (req, res, next) => controller.crear(req, res, next));

export default router;
