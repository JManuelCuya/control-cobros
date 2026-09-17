const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pais = await prisma.pais.upsert({
    where: { id: 15 },
    update: { descripcion: 'Peru' },
    create: { id: 15, descripcion: 'Peru' },
  });
  console.log('Pais insertado o actualizado:', pais);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
