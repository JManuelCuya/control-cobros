import express, { Application } from 'express';
import cors from 'cors';

import authRoutes from './features/auth/auth.routes';
import categoriasRoutes from './features/categorias/categorias.routes';
import clientesRoutes from './features/clientes/clientes.routes';
import cobrosRoutes from './features/cobros/cobros.routes';
import contratosRoutes from './features/contratos/contratos.routes';
import empleadosRoutes from './features/empleados/empleados.routes';
import facturacionRoutes from './features/facturacion/facturacion.routes';
import movimientosRoutes from './features/movimientos/movimientos.routes';
import pedidosRoutes from './features/pedidos/pedidos.routes';
import productosRoutes from './features/productos/productos.routes';
import proveedoresRoutes from './features/proveedores/proveedores.routes';
import planesRoutes from './features/planes/planes.routes';
import ubigeoRoutes from './features/ubigeo/ubigeo.routes';
import usuariosRoutes from './features/usuarios/usuarios.routes';
import sucursalesRoutes from './features/sucursales/sucursales.routes';

import { errorHandler } from './shared/middleware/error.middleware';

export function createServer(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Rutas por característica
  app.use('/api/auth', authRoutes);
  app.use('/api/categorias', categoriasRoutes);
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/cobros', cobrosRoutes);
  app.use('/api/contratos', contratosRoutes);
  app.use('/api/empleados', empleadosRoutes);
  app.use('/api/facturacion', facturacionRoutes);
  app.use('/api/movimientos', movimientosRoutes);
  app.use('/api/pedidos', pedidosRoutes);
  app.use('/api/productos', productosRoutes);
  app.use('/api/proveedores', proveedoresRoutes);
  app.use('/api/planes', planesRoutes);
  app.use('/api/ubigeo', ubigeoRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/sucursales', sucursalesRoutes);

  // Endpoint de salud
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  app.use(errorHandler);

  return app;
}
