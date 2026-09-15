import { prisma } from '../../shared/db';

export class FacturacionService {
  async obtenerTodos() {
    return prisma.comprobante.findMany({
      include: {
        cliente: true,
        detalles: true
      },
      orderBy: { id: 'desc' }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.comprobante.findUnique({
      where: { id },
      include: {
        cliente: true,
        detalles: true
      }
    });
  }

  async crearComprobante(data: {
    tipo_comprobante: 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO' | 'NOTA_DEBITO';
    tipo_pago?: 'PAGO_PLAN_MENSUAL' | 'VENTA_PRODUCTO';
    periodo_mes?: number;
    periodo_anio?: number;
    id_cliente?: number;
    id_contrato?: number;
    cliente_nombre: string;
    cliente_num_doc: string;
    empresa_emisora?: string;
    estado_pago?: 'PAGADO' | 'POR_PAGAR';
    detalles: { descripcion_item: string; cantidad: number; precio_unitario: number }[];
  }) {
    let serie = 'F001';
    if (data.tipo_comprobante === 'BOLETA') serie = 'B001';
    if (data.tipo_comprobante === 'NOTA_CREDITO') serie = 'NC01';
    if (data.tipo_comprobante === 'NOTA_DEBITO') serie = 'ND01';

    const tipoPago = data.tipo_pago || 'VENTA_PRODUCTO';
    const estadoPago = data.estado_pago || 'PAGADO';

    return prisma.$transaction(async (tx) => {
      // 1. Obtener el último correlativo para la serie
      const ultimo = await tx.comprobante.findFirst({
        where: { serie },
        orderBy: { numero: 'desc' }
      });

      const nuevoNumero = ultimo ? ultimo.numero + 1 : 1;

      // 2. Calcular totales en cabecera y detalles
      let totalGeneral = 0;
      const detallesFormateados = data.detalles.map(item => {
        const precioTotalItem = item.cantidad * item.precio_unitario;
        totalGeneral += precioTotalItem;
        return {
          descripcion_item: item.descripcion_item,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          precio_total: precioTotalItem
        };
      });

      // 3. Crear el Comprobante
      const comprobante = await tx.comprobante.create({
        data: {
          tipo_comprobante: data.tipo_comprobante,
          tipo_pago: tipoPago,
          periodo_mes: data.periodo_mes ? Number(data.periodo_mes) : undefined,
          periodo_anio: data.periodo_anio ? Number(data.periodo_anio) : undefined,
          serie,
          numero: nuevoNumero,
          id_cliente: data.id_cliente ? Number(data.id_cliente) : undefined,
          id_contrato: data.id_contrato ? Number(data.id_contrato) : undefined,
          cliente_nombre: data.cliente_nombre,
          cliente_num_doc: data.cliente_num_doc,
          empresa_emisora: data.empresa_emisora || 'CABLE TV S.A.C.',
          total: totalGeneral,
          estado_pago: estadoPago,
          detalles: {
            create: detallesFormateados
          }
        },
        include: {
          cliente: true,
          detalles: true
        }
      });

      // 4. Si el pago es de PAGO_PLAN_MENSUAL y se indicó id_contrato, periodo_mes y periodo_anio:
      if (tipoPago === 'PAGO_PLAN_MENSUAL' && data.id_contrato && data.periodo_mes && data.periodo_anio) {
        const obs = `Emisión ${data.tipo_comprobante} ${serie}-${String(nuevoNumero).padStart(6, '0')} (${estadoPago})`;
        // Si el comprobante es PAGADO, actualizamos la matriz a PAGADO.
        // Si el comprobante es POR_PAGAR, actualizamos la matriz a DEUDA.
        const estadoMatriz = estadoPago === 'PAGADO' ? 'PAGADO' : 'DEUDA';
        
        await tx.cobro.upsert({
          where: {
            id_contrato_anio_mes: {
              id_contrato: Number(data.id_contrato),
              anio: Number(data.periodo_anio),
              mes: Number(data.periodo_mes)
            }
          },
          update: {
            estado: estadoMatriz,
            monto: totalGeneral,
            observacion: obs
          },
          create: {
            id_contrato: Number(data.id_contrato),
            anio: Number(data.periodo_anio),
            mes: Number(data.periodo_mes),
            estado: estadoMatriz,
            monto: totalGeneral,
            observacion: obs
          }
        });
      }

      return comprobante;
    });
  }

  async cambiarEstadoPago(id: number, estado_pago: string) {
    return prisma.$transaction(async (tx) => {
      const comp = await tx.comprobante.findUnique({
        where: { id }
      });
      if (!comp) throw new Error('Comprobante no encontrado');

      const updated = await tx.comprobante.update({
        where: { id },
        data: { estado_pago },
        include: {
          cliente: true,
          detalles: true
        }
      });

      // Si el nuevo estado es PAGADO y es PAGO_PLAN_MENSUAL, actualizar la sábana
      if (estado_pago === 'PAGADO' && comp.tipo_pago === 'PAGO_PLAN_MENSUAL' && comp.id_contrato && comp.periodo_mes && comp.periodo_anio) {
        const obs = `Emisión ${comp.tipo_comprobante} ${comp.serie}-${String(comp.numero).padStart(6, '0')} (PAGADO POSTERIOR)`;
        await tx.cobro.upsert({
          where: {
            id_contrato_anio_mes: {
              id_contrato: Number(comp.id_contrato),
              anio: Number(comp.periodo_anio),
              mes: Number(comp.periodo_mes)
            }
          },
          update: {
            estado: 'PAGADO',
            observacion: obs
          },
          create: {
            id_contrato: Number(comp.id_contrato),
            anio: Number(comp.periodo_anio),
            mes: Number(comp.periodo_mes),
            estado: 'PAGADO',
            monto: comp.total,
            observacion: obs
          }
        });
      }

      return updated;
    });
  }
}
