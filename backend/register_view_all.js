const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vista = await prisma.vista.findUnique({
    where: { clave: 'sucursales' }
  });

  if (!vista) return;

  const roles = await prisma.rol.findMany();
  
  for (const role of roles) {
    const rolVista = await prisma.rolVista.findUnique({
      where: {
        id_rol_id_vista: {
          id_rol: role.id,
          id_vista: vista.id
        }
      }
    });

    if (!rolVista) {
      await prisma.rolVista.create({
        data: {
          id_rol: role.id,
          id_vista: vista.id
        }
      });
      console.log(`Assigned "sucursales" view to role ${role.descripcion}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
