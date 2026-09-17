import { prisma } from '../../shared/db';

export class ContratosService {
  async obtenerPorCliente(id_cliente?: number, id_suscriptor?: number) {
    const where: any = {};
    if (id_cliente) where.id_cliente = id_cliente;
    if (id_suscriptor) where.id_suscriptor = id_suscriptor;
    
    return prisma.contrato.findMany({
      where,
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
        suscriptor: true,
        plan: true
      },
      orderBy: { id: 'desc' }
    });
  }

  async crear(data: { id_cliente?: number; id_suscriptor?: number; direccion_servicio?: string; dia_cobro?: number; id_plan?: number; precio_acordado: number; id_pedido?: number; fecha_inicio?: Date }) {
    return prisma.contrato.create({
      data: {
        id_cliente: data.id_cliente,
        id_suscriptor: data.id_suscriptor,
        direccion_servicio: data.direccion_servicio,
        dia_cobro: data.dia_cobro || 15,
        id_plan: data.id_plan,
        precio_acordado: data.precio_acordado,
        id_pedido: data.id_pedido,
        fecha_inicio: data.fecha_inicio || new Date(),
        estado: 'ACTIVO'
      },
      include: {
        plan: true
      }
    });
  }

  async actualizar(id: number, data: { direccion_servicio?: string; dia_cobro?: number; id_plan?: number; precio_acordado?: number; estado?: string; fecha_inicio?: Date }) {
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
