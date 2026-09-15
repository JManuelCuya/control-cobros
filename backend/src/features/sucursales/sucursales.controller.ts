import { Request, Response, NextFunction } from 'express';
import * as sucursalesService from './sucursales.service';

export const getSucursales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sucursales = await sucursalesService.getAll();
    res.json(sucursales);
  } catch (error) {
    next(error);
  }
};

export const getSucursalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sucursal = await sucursalesService.getById(Number(req.params.id));
    if (!sucursal) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    res.json(sucursal);
  } catch (error) {
    next(error);
  }
};

export const createSucursal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nuevaSucursal = await sucursalesService.create(req.body);
    res.status(201).json(nuevaSucursal);
  } catch (error) {
    next(error);
  }
};

export const updateSucursal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sucursalActualizada = await sucursalesService.update(Number(req.params.id), req.body);
    res.json(sucursalActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteSucursal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sucursalesService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
