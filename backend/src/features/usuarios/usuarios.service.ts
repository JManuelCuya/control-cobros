import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/db';
import { validarPasswordSegura } from '../auth/auth.service';

export class UsuariosService {
  async obtenerTodos() {
    return prisma.usuario.findMany({
      include: {
        usuarioRoles: { include: { rol: true } },
        empleado: true,
        cliente: true,
        proveedor: true
      }
    });
  }

  async obtenerPorId(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        usuarioRoles: { include: { rol: true } },
        empleado: true,
        cliente: true,
        proveedor: true
      }
    });
  }

  async crear(data: {
    correo: string;
    password: string;
    descripcion?: string;
    id_roles?: number[];
    id_empleado?: number;
    id_cliente?: number;
    id_proveedor?: number;
  }) {
    const validacion = validarPasswordSegura(data.password);
    if (!validacion.esValida) {
      throw new Error(`La contraseña no cumple con la política de seguridad: ${validacion.errores.join(' ')}`);
    }

    const existe = await prisma.usuario.findUnique({ where: { correo: data.correo } });
    if (existe) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          correo: data.correo,
          password: hashedPassword,
          descripcion: data.descripcion,
          id_empleado: data.id_empleado,
          id_cliente: data.id_cliente,
          id_proveedor: data.id_proveedor
        }
      });

      // Múltiples Roles
      if (data.id_roles && data.id_roles.length > 0) {
        await tx.usuarioRol.createMany({
          data: data.id_roles.map(id_rol => ({
            id_usuario: nuevoUsuario.id,
            id_rol
          }))
        });
      }

      return tx.usuario.findUnique({
        where: { id: nuevoUsuario.id },
        include: {
          usuarioRoles: { include: { rol: true } },
          empleado: true,
          cliente: true,
          proveedor: true
        }
      });
    });
  }

  async actualizar(id: number, data: {
    correo?: string;
    password?: string;
    descripcion?: string;
    id_roles?: number[];
    id_empleado?: number;
    id_cliente?: number;
    id_proveedor?: number;
  }) {
    if (data.password) {
      const validacion = validarPasswordSegura(data.password);
      if (!validacion.esValida) {
        throw new Error(`La nueva contraseña no cumple con la política de seguridad: ${validacion.errores.join(' ')}`);
      }
      data.password = await bcrypt.hash(data.password, 10);
    }

    const { id_roles, ...updateData } = data;

    return prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id },
        data: updateData
      });

      if (id_roles !== undefined) {
        // Reemplazar roles asignados
        await tx.usuarioRol.deleteMany({ where: { id_usuario: id } });
        if (id_roles.length > 0) {
          await tx.usuarioRol.createMany({
            data: id_roles.map(id_rol => ({
              id_usuario: id,
              id_rol
            }))
          });
        }
      }

      return tx.usuario.findUnique({
        where: { id },
        include: {
          usuarioRoles: { include: { rol: true } },
          empleado: true,
          cliente: true,
          proveedor: true
        }
      });
    });
  }

  async eliminar(id: number) {
    return prisma.usuario.delete({ where: { id } });
  }

  async obtenerRoles() {
    let roles = await prisma.rol.findMany({
      include: { rolesVista: { include: { vista: true } } }
    });
    if (roles.length === 0) {
      await prisma.rol.createMany({
        data: [
          { descripcion: 'ADMINISTRADOR' },
          { descripcion: 'EMPLEADO' },
          { descripcion: 'CLIENTE' },
          { descripcion: 'PROVEEDOR' }
        ]
      });
      roles = await prisma.rol.findMany({
        include: { rolesVista: { include: { vista: true } } }
      });
    }
    return roles;
  }
}
