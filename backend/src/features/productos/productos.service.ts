import { prisma } from '../../shared/db';

export class ProductosService {
  async obtenerTodos() {
    return prisma.producto.findMany({
      include: { categoriaProducto: true }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.producto.findUnique({
      where: { id },
      include: { categoriaProducto: true }
    });
  }

  async crear(data: { descripcion: string; tipo?: string; precio?: number; stock?: number; id_categoria_producto?: number }) {
    return prisma.producto.create({ data });
  }

  async actualizar(id: number, data: Partial<{ descripcion: string; tipo: string; precio: number; stock: number; id_categoria_producto: number }>) {
    return prisma.producto.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number) {
    return prisma.producto.delete({ where: { id } });
  }
}
