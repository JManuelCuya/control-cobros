import { Router } from 'express';
import { PedidosController } from './pedidos.controller';

const router = Router();
const controller = new PedidosController();

router.get('/', (req, res, next) => controller.listar(req, res, next));
router.get('/:id', (req, res, next) => controller.obtener(req, res, next));
router.post('/', (req, res, next) => controller.crear(req, res, next));
router.patch('/:id/estado', (req, res, next) => controller.actualizarEstado(req, res, next));

export default router;
