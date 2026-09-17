import { Router } from 'express';
import { SuscriptoresController } from './suscriptores.controller';

const router = Router();
const controller = new SuscriptoresController();

router.get('/', controller.listar.bind(controller));
router.get('/:id', controller.obtener.bind(controller));
router.post('/', controller.crear.bind(controller));
router.put('/:id', controller.actualizar.bind(controller));
router.delete('/:id', controller.eliminar.bind(controller));

export default router;
