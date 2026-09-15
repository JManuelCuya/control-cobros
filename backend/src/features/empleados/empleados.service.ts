import { prisma } from '../../shared/db';

export class EmpleadosService {
  async obtenerTodos() {
    return prisma.empleado.findMany({
      include: {
        departamento: true,
        provincia: true,
        distrito: true,
        usuarios: {
          include: {
            usuarioRoles: { include: { rol: true } }
          }
        }
      }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.empleado.findUnique({
      where: { id },
      include: {
        departamento: true,
        provincia: true,
        distrito: true,
        usuarios: true
      }
    });
  }

  async crear(data: any) {
    return prisma.empleado.create({ data });
  }

  async actualizar(id: number, data: any) {
    return prisma.empleado.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number) {
    return prisma.empleado.delete({ where: { id } });
  }
}
