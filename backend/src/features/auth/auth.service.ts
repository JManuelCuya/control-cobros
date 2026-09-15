import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/db';

export function validarPasswordSegura(password: string): { esValida: boolean; errores: string[] } {
  const errores: string[] = [];

  if (password.length < 12) {
    errores.push('Debe tener al menos 12 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errores.push('Debe incluir al menos una letra mayúscula (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errores.push('Debe incluir al menos una letra minúscula (a-z).');
  }
  if (!/[0-9]/.test(password)) {
    errores.push('Debe incluir al menos un número (0-9).');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errores.push('Debe incluir al menos un carácter especial (!@#$%^&*...).');
  }

  return {
    esValida: errores.length === 0,
    errores
  };
}

export class AuthService {
  async register(correo: string, pass: string, descripcion?: string) {
    const validacion = validarPasswordSegura(pass);
    if (!validacion.esValida) {
      throw new Error(`Contraseña no cumple políticas de seguridad: ${validacion.errores.join(' ')}`);
    }

    const existe = await prisma.usuario.findUnique({ where: { correo } });
    if (existe) {
      throw new Error('El correo electrónico ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        correo,
        password: hashedPassword,
        descripcion: descripcion || 'Usuario'
      },
      select: { id: true, correo: true, descripcion: true }
    });

    return nuevoUsuario;
  }

  async login(correo: string, pass: string) {
    let usuario = await prisma.usuario.findUnique({
      where: { correo },
      include: {
        usuarioRoles: {
          include: {
            rol: {
              include: {
                rolesVista: {
                  include: { vista: true }
                }
              }
            }
          }
        },
        empleado: true,
        cliente: true,
        proveedor: true
      }
    });

    // Autosembrar administrador por defecto si la base de datos está limpia
    if (!usuario && correo.toLowerCase() === 'admin@admin.com') {
      const totalUsuarios = await prisma.usuario.count().catch(() => 0);
      if (totalUsuarios === 0) {
        let rolAdmin = await prisma.rol.findFirst({ where: { descripcion: 'ADMINISTRADOR' } });
        if (!rolAdmin) {
          rolAdmin = await prisma.rol.create({ data: { descripcion: 'ADMINISTRADOR' } });
        }

        // Crear vistas por defecto
        const vistasClaves = ['facturacion', 'cobros', 'pedidos', 'productos', 'categorias', 'clientes', 'empleados', 'proveedores', 'planes', 'usuarios'];
        for (const clave of vistasClaves) {
          const v = await prisma.vista.upsert({
            where: { clave },
            update: {},
            create: { clave, nombre: clave }
          });
          await prisma.rolVista.upsert({
            where: { id_rol_id_vista: { id_rol: rolAdmin.id, id_vista: v.id } },
            update: {},
            create: { id_rol: rolAdmin.id, id_vista: v.id }
          });
        }

        const hashedPassword = await bcrypt.hash('Admin123456!@#', 10);
        const adminUser = await prisma.usuario.create({
          data: {
            descripcion: 'Administrador Principal',
            correo: 'admin@admin.com',
            password: hashedPassword
          }
        });

        await prisma.usuarioRol.create({
          data: { id_usuario: adminUser.id, id_rol: rolAdmin.id }
        });

        usuario = await prisma.usuario.findUnique({
          where: { id: adminUser.id },
          include: {
            usuarioRoles: {
              include: {
                rol: {
                  include: {
                    rolesVista: { include: { vista: true } }
                  }
                }
              }
            },
            empleado: true,
            cliente: true,
            proveedor: true
          }
        });
      }
    }

    if (!usuario) {
      throw new Error('Credenciales inválidas (usuario no encontrado)');
    }

    let esCorrecta = false;
    if (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$')) {
      esCorrecta = await bcrypt.compare(pass, usuario.password);
    } else {
      esCorrecta = usuario.password === pass;
    }

    if (!esCorrecta) {
      throw new Error('Credenciales inválidas (contraseña incorrecta)');
    }

    // Calcular vistas permitidas dinámicamente según roles asignados
    const vistasSet = new Set<string>();
    let esAdministrador = false;

    for (const ur of usuario.usuarioRoles || []) {
      if (ur.rol.descripcion === 'ADMINISTRADOR') {
        esAdministrador = true;
      }
      for (const rv of ur.rol.rolesVista || []) {
        if (rv.vista?.clave) {
          vistasSet.add(rv.vista.clave);
        }
      }
    }

    // Si es Administrador o no tiene roles explícitos aún, conceder todas las vistas principales
    if (esAdministrador || vistasSet.size === 0) {
      ['facturacion', 'cobros', 'pedidos', 'productos', 'categorias', 'clientes', 'empleados', 'proveedores', 'planes', 'usuarios'].forEach(v => vistasSet.add(v));
    }

    const { password, ...usuarioSinPassword } = usuario;

    return {
      ...usuarioSinPassword,
      esAdministrador,
      vistasPermitidas: Array.from(vistasSet)
    };
  }
}
