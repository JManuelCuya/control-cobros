import { Router } from 'express';
import { PlanesController } from './planes.controller';

const router = Router();
const controller = new PlanesController();

router.get('/', (req, res, next) => controller.listar(req, res, next));
router.get('/:id', (req, res, next) => controller.obtener(req, res, next));
router.post('/', (req, res, next) => controller.crear(req, res, next));
router.put('/:id', (req, res, next) => controller.actualizar(req, res, next));
router.delete('/:id', (req, res, next) => controller.eliminar(req, res, next));

export default router;
