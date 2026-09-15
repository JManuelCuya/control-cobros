import { Router } from 'express';
import { FacturacionController } from './facturacion.controller';

const router = Router();
const controller = new FacturacionController();

router.get('/', (req, res, next) => controller.listar(req, res, next));
router.get('/:id', (req, res, next) => controller.obtener(req, res, next));
router.post('/', (req, res, next) => controller.crear(req, res, next));
router.patch('/:id/pago', (req, res, next) => controller.cambiarEstadoPago(req, res, next));

export default router;
