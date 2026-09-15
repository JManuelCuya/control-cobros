import prisma from '../../shared/config/db';

export const getAll = async () => {
  return await prisma.sucursal.findMany({
    orderBy: { id: 'desc' }
  });
};

export const getById = async (id: number) => {
  return await prisma.sucursal.findUnique({
    where: { id }
  });
};

export const create = async (data: any) => {
  return await prisma.sucursal.create({
    data: {
      descripcion: data.descripcion,
      direccion: data.direccion,
      distrito: data.distrito,
      provincia: data.provincia,
      departamento: data.departamento
    }
  });
};

export const update = async (id: number, data: any) => {
  return await prisma.sucursal.update({
    where: { id },
    data: {
      descripcion: data.descripcion,
      direccion: data.direccion,
      distrito: data.distrito,
      provincia: data.provincia,
      departamento: data.departamento
    }
  });
};

export const remove = async (id: number) => {
  return await prisma.sucursal.delete({
    where: { id }
  });
};
