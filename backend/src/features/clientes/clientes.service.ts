import { prisma } from '../../shared/db';

export class ClientesService {
  async obtenerTodos() {
    return prisma.cliente.findMany({
      include: { departamento: true, provincia: true, distrito: true }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.cliente.findUnique({
      where: { id },
      include: { departamento: true, provincia: true, distrito: true }
    });
  }

  async crear(data: any) {
    return prisma.cliente.create({ data });
  }

  async actualizar(id: number, data: any) {
    return prisma.cliente.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number) {
    return prisma.cliente.delete({ where: { id } });
  }
}
