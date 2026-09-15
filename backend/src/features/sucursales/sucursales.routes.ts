import { Router } from 'express';
import { getSucursales, getSucursalById, createSucursal, updateSucursal, deleteSucursal } from './sucursales.controller';

const router = Router();

router.get('/', getSucursales);
router.get('/:id', getSucursalById);
router.post('/', createSucursal);
router.put('/:id', updateSucursal);
router.delete('/:id', deleteSucursal);

export default router;
