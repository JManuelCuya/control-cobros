import { prisma } from '../../shared/db';

export class PlanesService {
  async obtenerTodos() {
    return prisma.plan.findMany({
      include: {
        categoriaPlan: true,
        productos: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.plan.findUnique({
      where: { id },
      include: {
        categoriaPlan: true,
        productos: {
          include: {
            producto: true
          }
        }
      }
    });
  }

  async crear(data: {
    descripcion: string;
    descuento_porcentaje?: number;
    id_categoria_plan?: number;
    productosIds?: number[];
  }) {
    let precio_original = 0;

    // Calcular precio_original sumando los precios de los productos
    if (data.productosIds && data.productosIds.length > 0) {
      const productos = await prisma.producto.findMany({
        where: { id: { in: data.productosIds } }
      });
      precio_original = productos.reduce((sum, p) => sum + Number(p.precio), 0);
    }

    const descuento = data.descuento_porcentaje || 0;
    const precio = precio_original * (1 - descuento / 100);

    return prisma.plan.create({
      data: {
        descripcion: data.descripcion,
        precio_original,
        descuento_porcentaje: descuento,
        precio,
        id_categoria_plan: data.id_categoria_plan,
        productos: {
          create: data.productosIds?.map(id => ({ id_producto: id })) || []
        }
      },
      include: {
        productos: {
          include: { producto: true }
        }
      }
    });
  }

  async actualizar(id: number, data: {
    descripcion?: string;
    descuento_porcentaje?: number;
    id_categoria_plan?: number;
    productosIds?: number[];
  }) {
    // Si envían productos, recalcular. Si no, obtener los actuales.
    let planActual = await prisma.plan.findUnique({
      where: { id },
      include: { productos: true }
    });

    if (!planActual) throw new Error('Plan no encontrado');

    let productosIds = data.productosIds;
    if (!productosIds) {
      productosIds = planActual.productos.map(p => p.id_producto);
    }

    let precio_original = 0;
    if (productosIds.length > 0) {
      const productos = await prisma.producto.findMany({
        where: { id: { in: productosIds } }
      });
      precio_original = productos.reduce((sum, p) => sum + Number(p.precio), 0);
    }

    const descuento = data.descuento_porcentaje !== undefined ? data.descuento_porcentaje : Number(planActual.descuento_porcentaje);
    const precio = precio_original * (1 - descuento / 100);

    // Actualizar Plan
    await prisma.plan.update({
      where: { id },
      data: {
        descripcion: data.descripcion,
        precio_original,
        descuento_porcentaje: descuento,
        precio,
        id_categoria_plan: data.id_categoria_plan
      }
    });

    // Actualizar Productos relacionados si se enviaron
    if (data.productosIds) {
      await prisma.planProducto.deleteMany({
        where: { id_plan: id }
      });
      if (data.productosIds.length > 0) {
        await prisma.planProducto.createMany({
          data: data.productosIds.map(pid => ({
            id_plan: id,
            id_producto: pid
          }))
        });
      }
    }

    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    return prisma.plan.delete({ where: { id } });
  }
}
