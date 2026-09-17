import { prisma } from '../../shared/db';

export class SuscriptoresService {
  async obtenerTodos() {
    return prisma.suscriptor.findMany({
      include: { 
        departamento: true, 
        distrito: true, 
        sucursal: true,
        decodificadores: { include: { plan: true } },
        contratos: { include: { plan: true } }
      }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.suscriptor.findUnique({
      where: { id },
      include: { departamento: true, distrito: true, sucursal: true, decodificadores: { include: { plan: true } }, contratos: true }
    });
  }

  async crear(data: any) {
    if (data.id_cliente) {
      const existing = await prisma.suscriptor.findUnique({
        where: { id_cliente: Number(data.id_cliente) }
      });
      if (existing) {
        throw new Error('Este cliente ya ha sido convertido a suscriptor.');
      }
    }

    if (!data.codigo) {
      data.codigo = Math.floor(10000000 + Math.random() * 90000000).toString();
    }
    return prisma.suscriptor.create({ data });
  }

  async actualizar(id: number, data: any) {
    return prisma.suscriptor.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number) {
    return prisma.suscriptor.delete({ where: { id } });
  }
}
