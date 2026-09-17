import { Router } from 'express';
import { DecodificadoresController } from './decodificadores.controller';

const router = Router();
const controller = new DecodificadoresController();

router.get('/', controller.listar.bind(controller));
router.post('/', controller.crear.bind(controller));
router.put('/:id', controller.actualizar.bind(controller));
router.patch('/:id/asignar', controller.asignar.bind(controller));
router.delete('/:id', controller.eliminar.bind(controller));

export default router;
