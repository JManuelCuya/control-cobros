import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Middleware]:', err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ success: false, error: message });
};
