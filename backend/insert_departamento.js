const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const departamentos = [
  { id: 1, descripcion: 'AMAZONAS' },
  { id: 2, descripcion: 'ANCASH' },
  { id: 3, descripcion: 'APURIMAC' },
  { id: 4, descripcion: 'AREQUIPA' },
  { id: 5, descripcion: 'AYACUCHO' },
  { id: 6, descripcion: 'CAJAMARCA' },
  { id: 7, descripcion: 'PROV. DEL CALLAO' },
  { id: 8, descripcion: 'CUSCO' },
  { id: 9, descripcion: 'HUANCAVELICA' },
  { id: 10, descripcion: 'HUANUCO' },
  { id: 11, descripcion: 'ICA' },
  { id: 12, descripcion: 'JUNIN' },
  { id: 13, descripcion: 'LA LIBERTAD' },
  { id: 14, descripcion: 'LAMBAYEQUE' },
  { id: 15, descripcion: 'LIMA' },
  { id: 16, descripcion: 'LORETO' },
  { id: 17, descripcion: 'MADRE DE DIOS' },
  { id: 18, descripcion: 'MOQUEGUA' },
  { id: 19, descripcion: 'PASCO' },
  { id: 20, descripcion: 'PIURA' },
  { id: 21, descripcion: 'PUNO' },
  { id: 22, descripcion: 'SAN MARTIN' },
  { id: 23, descripcion: 'TACNA' },
  { id: 24, descripcion: 'TUMBES' },
  { id: 25, descripcion: 'UCAYALI' }
];

async function main() {
  for (const dep of departamentos) {
    await prisma.departamento.upsert({
      where: { id: dep.id },
      update: { descripcion: dep.descripcion, id_pais: 15 },
      create: { id: dep.id, descripcion: dep.descripcion, id_pais: 15 },
    });
  }
  console.log('Departamentos insertados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
