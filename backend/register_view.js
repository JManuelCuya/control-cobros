const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Registering Sucursales view in the database...');
  
  // 1. Create or find the Vista
  let vista = await prisma.vista.findUnique({
    where: { clave: 'sucursales' }
  });

  if (!vista) {
    vista = await prisma.vista.create({
      data: {
        clave: 'sucursales',
        nombre: 'Sucursales'
      }
    });
    console.log('Created Vista "sucursales" with ID:', vista.id);
  } else {
    console.log('Vista "sucursales" already exists with ID:', vista.id);
  }

  // 2. Get the Admin role (usually ID 1 or the one with most permissions)
  const adminRole = await prisma.rol.findFirst({
    where: { descripcion: 'Admin' }
  });

  if (adminRole) {
    // Check if the role already has the view
    const rolVista = await prisma.rolVista.findUnique({
      where: {
        id_rol_id_vista: {
          id_rol: adminRole.id,
          id_vista: vista.id
        }
      }
    });

    if (!rolVista) {
      await prisma.rolVista.create({
        data: {
          id_rol: adminRole.id,
          id_vista: vista.id
        }
      });
      console.log('Assigned "sucursales" view to Admin role');
    } else {
      console.log('Admin role already has "sucursales" view');
    }
  } else {
    console.log('Could not find Admin role');
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
