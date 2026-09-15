import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const clientes = await prisma.cliente.findMany();
  console.log(clientes.map(c => ({ id: c.id, nombre: c.nombre, telefono: c.telefono })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
