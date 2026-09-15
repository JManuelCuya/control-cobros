import { prisma } from '../../shared/db';

export class CobrosService {
  async obtenerMatrizCobros(anio: number) {
    // Obtener contratos activos y sus clientes
    const contratos = await prisma.contrato.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        cliente: true,
        plan: true
      },
      orderBy: { id: 'asc' }
    });

    const cobros = await prisma.cobro.findMany({
      where: { anio }
    });

    // Mapear matriz por contrato y por mes (1..12)
    const cobrosMap: Record<string, any> = {};
    for (const c of cobros) {
      cobrosMap[`${c.id_contrato}_${c.mes}`] = c;
    }

    const matriz = contratos.map(contrato => {
      const meses: Record<number, any> = {};
      for (let m = 1; m <= 12; m++) {
        meses[m] = cobrosMap[`${contrato.id}_${m}`] || null;
      }
      return {
        id_contrato: contrato.id,
        id_cliente: contrato.cliente.id,
        nombre: contrato.cliente.nombre,
        apellido: contrato.cliente.apellido,
        num_doc: contrato.cliente.num_doc,
        telefono: contrato.cliente.telefono,
        plan_desc: contrato.plan ? contrato.plan.descripcion : 'Sin Plan',
        direccion_servicio: contrato.direccion_servicio || contrato.cliente.direccion,
        dia_cobro: contrato.dia_cobro,
        precio_acordado: contrato.precio_acordado,
        meses
      };
    });

    return matriz;
  }

  async registrarCobro(data: {
    id_contrato: number;
    anio: number;
    mes: number;
    estado: string; // 'PAGADO', 'DEUDA', 'VACIO'
    monto?: number;
    observacion?: string;
  }) {
    if (data.estado === 'VACIO') {
      // Si el estado es VACIO, eliminar el registro si existe
      await prisma.cobro.deleteMany({
        where: {
          id_contrato: data.id_contrato,
          anio: data.anio,
          mes: data.mes
        }
      });
      return { success: true, message: 'Cobro eliminado' };
    }

    return prisma.cobro.upsert({
      where: {
        id_contrato_anio_mes: {
          id_contrato: data.id_contrato,
          anio: data.anio,
          mes: data.mes
        }
      },
      update: {
        estado: data.estado,
        monto: data.monto !== undefined ? data.monto : 0,
        observacion: data.observacion
      },
      create: {
        id_contrato: data.id_contrato,
        anio: data.anio,
        mes: data.mes,
        estado: data.estado,
        monto: data.monto !== undefined ? data.monto : 0,
        observacion: data.observacion
      }
    });
  }
}
