import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const VISTAS_DEF = [
  { clave: 'pedidos', nombre: 'Pedidos / Ventas' },
  { clave: 'productos', nombre: 'Productos' },
  { clave: 'categorias', nombre: 'Categorías' },
  { clave: 'clientes', nombre: 'Clientes' },
  { clave: 'empleados', nombre: 'Empleados' },
  { clave: 'proveedores', nombre: 'Proveedores' },
  { clave: 'planes', nombre: 'Planes' },
  { clave: 'movimientos', nombre: 'Movimientos Inventario' },
  { clave: 'usuarios', nombre: 'Usuarios / Roles' },
  { clave: 'cotizaciones', nombre: 'Cotizaciones' },
];

const ROLES_DEF = ['ADMINISTRADOR', 'EMPLEADO', 'CLIENTE', 'PROVEEDOR'];

async function main() {
  console.log('🌱 Sembrando datos de Vistas, Roles y Permisos...');

  // 1. Crear Vistas
  const vistasMap: Record<string, number> = {};
  for (const v of VISTAS_DEF) {
    const vista = await prisma.vista.upsert({
      where: { clave: v.clave },
      update: { nombre: v.nombre },
      create: { clave: v.clave, nombre: v.nombre }
    });
    vistasMap[v.clave] = vista.id;
  }

  // 2. Crear Roles
  const rolesMap: Record<string, number> = {};
  for (const rNombre of ROLES_DEF) {
    let r = await prisma.rol.findFirst({ where: { descripcion: rNombre } });
    if (!r) {
      r = await prisma.rol.create({ data: { descripcion: rNombre } });
    }
    rolesMap[rNombre] = r.id;
  }

  // 3. Asignar TODAS las vistas al rol ADMINISTRADOR
  const idAdminRol = rolesMap['ADMINISTRADOR'];
  for (const vClave of Object.keys(vistasMap)) {
    const idVista = vistasMap[vClave];
    await prisma.rolVista.upsert({
      where: { id_rol_id_vista: { id_rol: idAdminRol, id_vista: idVista } },
      update: {},
      create: { id_rol: idAdminRol, id_vista: idVista }
    });
  }

  // 4. Crear usuario Administrador inicial
  const correoAdmin = 'admin@admin.com';
  const passAdmin = 'Admin123456!@#';

  let usuarioAdmin = await prisma.usuario.findUnique({ where: { correo: correoAdmin } });

  if (!usuarioAdmin) {
    const hashedPassword = await bcrypt.hash(passAdmin, 10);
    usuarioAdmin = await prisma.usuario.create({
      data: {
        descripcion: 'Administrador Principal',
        correo: correoAdmin,
        password: hashedPassword
      }
    });

    await prisma.usuarioRol.create({
      data: {
        id_usuario: usuarioAdmin.id,
        id_rol: idAdminRol
      }
    });

    console.log(`✅ Usuario Administrador inicial creado con éxito:`);
    console.log(`   - Correo: ${correoAdmin}`);
    console.log(`   - Clave: ${passAdmin}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
