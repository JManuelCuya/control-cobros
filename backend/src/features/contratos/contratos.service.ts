import { prisma } from '../../shared/db';

export class ContratosService {
  async obtenerPorCliente(id_cliente: number) {
    return prisma.contrato.findMany({
      where: { id_cliente },
      include: {
        plan: true
      },
      orderBy: { id: 'desc' }
    });
  }

  async obtenerTodos() {
    return prisma.contrato.findMany({
      include: {
        cliente: true,
        plan: true
      },
      orderBy: { id: 'desc' }
    });
  }

  async crear(data: { id_cliente: number; direccion_servicio?: string; dia_cobro: number; id_plan?: number; precio_acordado: number; id_pedido?: number }) {
    return prisma.contrato.create({
      data: {
        id_cliente: data.id_cliente,
        direccion_servicio: data.direccion_servicio,
        dia_cobro: data.dia_cobro,
        id_plan: data.id_plan,
        precio_acordado: data.precio_acordado,
        id_pedido: data.id_pedido,
        estado: 'ACTIVO'
      },
      include: {
        plan: true
      }
    });
  }

  async actualizar(id: number, data: { direccion_servicio?: string; dia_cobro?: number; id_plan?: number; precio_acordado?: number; estado?: string }) {
    return prisma.contrato.update({
      where: { id },
      data,
      include: {
        plan: true
      }
    });
  }

  async eliminar(id: number) {
    return prisma.contrato.delete({
      where: { id }
    });
  }
}
