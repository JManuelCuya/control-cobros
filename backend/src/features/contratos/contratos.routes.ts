import { Router } from 'express';
import { ContratosController } from './contratos.controller';

const router = Router();
const controller = new ContratosController();

router.get('/', (req, res, next) => controller.listarTodos(req, res, next));
router.get('/cliente/:idCliente', (req, res, next) => controller.listarPorCliente(req, res, next));
router.get('/suscriptor/:idSuscriptor', (req, res, next) => controller.listarPorSuscriptor(req, res, next));
router.post('/', (req, res, next) => controller.crear(req, res, next));
router.put('/:id', (req, res, next) => controller.actualizar(req, res, next));
router.delete('/:id', (req, res, next) => controller.eliminar(req, res, next));

export default router;
