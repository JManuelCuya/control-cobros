import { prisma } from '../../shared/db';

export class PedidosService {
  async obtenerTodos() {
    return prisma.pedido.findMany({
      include: {
        cliente: true,
        empleado: true,
        detallesPedido: { include: { producto: true } }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        empleado: true,
        detallesPedido: { include: { producto: true } }
      }
    });
  }

  async crear(data: { id_cliente: number; id_empleado?: number; detalles: { id_producto: number; cantidad: number; precio_unit: number }[] }) {
    let totalCalculado = 0;
    const detallesFormatted = data.detalles.map(d => {
      const subtotal = d.cantidad * d.precio_unit;
      totalCalculado += subtotal;
      return {
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unit: d.precio_unit,
        subtotal
      };
    });

    return prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({
        data: {
          id_cliente: data.id_cliente,
          id_empleado: data.id_empleado,
          total: totalCalculado,
          detallesPedido: {
            create: detallesFormatted
          }
        },
        include: { detallesPedido: true }
      });

      // Actualizar stock de productos por venta
      for (const item of data.detalles) {
        await tx.producto.update({
          where: { id: item.id_producto },
          data: { stock: { decrement: item.cantidad } }
        });
      }

      return pedido;
    });
  }

  async cambiarEstado(id: number, estado: string) {
    return prisma.pedido.update({
      where: { id },
      data: { estado }
    });
  }
}
