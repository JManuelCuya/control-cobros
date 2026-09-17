import { prisma } from '../../shared/db';

export class CobrosService {
  async obtenerMatrizCobros(anio: number) {
    // Obtener contratos activos y sus clientes
    const contratos = await prisma.contrato.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        cliente: true,
        suscriptor: true,
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
      
      const entity = contrato.suscriptor || contrato.cliente || ({} as any);

      return {
        id_contrato: contrato.id,
        id_cliente: contrato.id_cliente || (contrato.suscriptor ? contrato.suscriptor.id_cliente : null) || null,
        nombre: entity.nombre || '',
        apellido: entity.apellido || '',
        num_doc: entity.num_doc || entity.ruc_dni || '',
        codigo_pago: entity.codigo || `C-${contrato.id}`,
        telefono: entity.telefono || entity.telefonos || '',
        plan_desc: contrato.plan ? contrato.plan.descripcion : 'Sin Plan',
        direccion_servicio: contrato.direccion_servicio || entity.direccion || '',
        dia_cobro: contrato.suscriptor ? contrato.suscriptor.dia_pago : contrato.dia_cobro,
        precio_acordado: contrato.precio_acordado,
        fecha_inicio: contrato.fecha_inicio,
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
