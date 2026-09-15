import { prisma } from '../../shared/db';

export class ProveedoresService {
  async obtenerTodos() {
    return prisma.proveedor.findMany({
      include: { departamento: true, provincia: true, distrito: true }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.proveedor.findUnique({
      where: { id },
      include: { departamento: true, provincia: true, distrito: true }
    });
  }

  async crear(data: any) {
    return prisma.proveedor.create({ data });
  }

  async actualizar(id: number, data: any) {
    return prisma.proveedor.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number) {
    return prisma.proveedor.delete({ where: { id } });
  }
}
