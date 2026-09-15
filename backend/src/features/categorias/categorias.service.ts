import { prisma } from '../../shared/db';

export class CategoriasService {
  async obtenerTodas() {
    return prisma.categoriaProducto.findMany({
      include: { productos: true }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.categoriaProducto.findUnique({
      where: { id }
    });
  }

  async crear(descripcion: string, tipo?: string) {
    return prisma.categoriaProducto.create({
      data: { descripcion, tipo: tipo || 'ARTICULO' }
    });
  }

  async actualizar(id: number, descripcion: string, tipo?: string) {
    return prisma.categoriaProducto.update({
      where: { id },
      data: { descripcion, tipo: tipo || 'ARTICULO' }
    });
  }

  async eliminar(id: number) {
    return prisma.categoriaProducto.delete({
      where: { id }
    });
  }
}
