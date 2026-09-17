import { prisma } from '../../shared/db';

export class DecodificadoresService {
  async obtenerTodos() {
    return prisma.decodificador.findMany({
      include: {
        producto: true,
        proveedor: true,
        suscriptor: true,
        cliente: true,
        plan: true
      },
      orderBy: { id: 'desc' }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.decodificador.findUnique({
      where: { id },
      include: {
        producto: true,
        proveedor: true,
        suscriptor: true,
        cliente: true,
        plan: true
      }
    });
  }

  async crear(data: {
    sticker?: string;
    codigo_cliente?: string;
    serial_ird: string;
    tarjeta_sc?: string;
    fecha_fabricacion?: Date;
    costo?: number;
    detalles?: string;
    id_plan_mensual?: number;
    id_sucursal?: number;
    id_producto?: number;
    id_proveedor?: number;
  }) {
    let sticker = data.sticker;
    if (!sticker) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      sticker = '';
      for (let i = 0; i < 5; i++) {
        sticker += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    return prisma.decodificador.create({
      data: {
        ...data,
        sticker,
        estado: 'EN_ALMACEN'
      }
    });
  }

  async actualizar(id: number, data: any) {
    return prisma.decodificador.update({
      where: { id },
      data
    });
  }

  async asignar(id: number, data: { id_cliente?: number | null, id_suscriptor?: number | null, fecha_asignacion?: Date | null }) {
    const isAssigned = (data.id_cliente != null) || (data.id_suscriptor != null);
    
    return prisma.$transaction(async (tx) => {
      // 1. Actualizar el estado del decodificador
      const decodificadorActualizado = await tx.decodificador.update({
        where: { id },
        data: {
          id_cliente: data.id_cliente,
          id_suscriptor: data.id_suscriptor,
          fecha_asignacion: isAssigned ? (data.fecha_asignacion || new Date()) : null,
          estado: isAssigned ? 'ASIGNADO_A_CLIENTE' : 'EN_ALMACEN'
        },
        include: {
          plan: true,
          suscriptor: true,
          cliente: true
        }
      });

      // 2. Si se asignó a un cliente/suscriptor y tiene plan asociado, crear su suscripción automáticamente
      if (isAssigned && decodificadorActualizado.id_plan_mensual && decodificadorActualizado.plan) {
        const entity = decodificadorActualizado.suscriptor || decodificadorActualizado.cliente;
        // Obtenemos la dirección principal y el día de pago si existe
        const direccion = entity ? (entity.direccion || '') : '';
        const diaCobro = decodificadorActualizado.suscriptor?.dia_pago || 15;

        await tx.contrato.create({
          data: {
            id_cliente: data.id_cliente,
            id_suscriptor: data.id_suscriptor,
            id_plan: decodificadorActualizado.id_plan_mensual,
            precio_acordado: decodificadorActualizado.plan.precio,
            direccion_servicio: direccion,
            dia_cobro: diaCobro,
            fecha_inicio: decodificadorActualizado.fecha_asignacion || new Date(),
            estado: 'ACTIVO'
          }
        });
      }

      return decodificadorActualizado;
    });
  }

  async eliminar(id: number) {
    return prisma.decodificador.delete({
      where: { id }
    });
  }
}
