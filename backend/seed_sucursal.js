const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default Sucursal...');
  
  // Create or find default Sucursal
  let sucursal = await prisma.sucursal.findFirst({
    where: { descripcion: 'Sucursal Principal' }
  });

  if (!sucursal) {
    sucursal = await prisma.sucursal.create({
      data: {
        descripcion: 'Sucursal Principal',
        direccion: 'Av. Principal 123',
        distrito: 'Centro',
        provincia: 'Centro',
        departamento: 'Centro'
      }
    });
    console.log('Created Default Sucursal with ID:', sucursal.id);
  } else {
    console.log('Default Sucursal already exists with ID:', sucursal.id);
  }

  // Update all clients that don't have a sucursal
  const updateResult = await prisma.cliente.updateMany({
    where: { id_sucursal: null },
    data: { id_sucursal: sucursal.id }
  });

  console.log(`Updated ${updateResult.count} clients to use the default Sucursal.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
