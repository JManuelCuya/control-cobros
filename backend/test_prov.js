const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.provincia.findMany({ where: {} }).then(provs => {
  console.log("MAYNAS:", provs.find(p => p.descripcion === 'MAYNAS'));
  console.log("LIMA:", provs.find(p => p.descripcion === 'LIMA'));
  console.log("Prov 1501:", provs.find(p => p.id === 1501));
}).finally(()=>prisma.$disconnect());
