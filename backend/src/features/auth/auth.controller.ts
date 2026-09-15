import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const service = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { correo, password } = req.body;
      if (!correo || !password) {
        return res.status(400).json({ success: false, message: 'Ingrese correo y contraseña' });
      }
      const usuario = await service.login(correo, password);
      res.json({ success: true, data: usuario });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message || 'Error en inicio de sesión' });
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { correo, password, descripcion } = req.body;
      if (!correo || !password) {
        return res.status(400).json({ success: false, message: 'Ingrese correo y contraseña' });
      }
      const nuevo = await service.register(correo, password, descripcion);
      res.status(201).json({ success: true, data: nuevo });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error al registrar usuario' });
    }
  }
}
