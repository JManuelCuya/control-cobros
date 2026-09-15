import { prisma } from '../../shared/db';

export class UbigeoService {
  async obtenerDepartamentos() {
    return prisma.departamento.findMany();
  }

  async obtenerProvinciasPorDepartamento(id_departamento: number) {
    return prisma.provincia.findMany({
      where: { id_departamento }
    });
  }

  async obtenerDistritosPorProvincia(id_provincia: number) {
    return prisma.distrito.findMany({
      where: { id_provincia }
    });
  }
}
