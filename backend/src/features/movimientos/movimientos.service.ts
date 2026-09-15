import { prisma } from '../../shared/db';

export class MovimientosService {
  async obtenerTodos() {
    return prisma.movimientoInventario.findMany({
      include: { producto: true },
      orderBy: { fecha: 'desc' }
    });
  }

  async registrarMovimiento(data: { id_producto: number; cantidad: number; tipo_movimiento: string; observacion?: string }) {
    return prisma.$transaction(async (tx) => {
      const movimiento = await tx.movimientoInventario.create({
        data
      });

      const cambioStock = data.tipo_movimiento === 'ENTRADA' ? data.cantidad : -data.cantidad;
      await tx.producto.update({
        where: { id: data.id_producto },
        data: { stock: { increment: cambioStock } }
      });

      return movimiento;
    });
  }
}
