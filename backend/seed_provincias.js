const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ubigeo = require('ubigeo-peru');

async function main() {
  console.log('Fetching Provincias y Distritos...');
  
  const provinciasMap = new Map();
  const distritosMap = new Map();
  
  for (const item of ubigeo.reniec) {
    if (item.provincia !== '00') {
      const id_departamento = parseInt(item.departamento, 10);
      const id_prov = parseInt(item.departamento + item.provincia, 10);

      // Si es una provincia (distrito == 00)
      if (item.distrito === '00') {
        provinciasMap.set(id_prov, {
          id: id_prov,
          descripcion: item.nombre.toUpperCase(),
          id_departamento
        });
      } else {
        // Si es un distrito (distrito != 00)
        // Algunos módulos no tienen la provincia con distrito 00 si no que saltan directo a los distritos,
        // nos aseguramos de que exista la provincia (el nombre no lo sabremos exacto si no vino con 00, pero reniec usualmente los trae)
        
        const id_distrito = parseInt(item.departamento + item.provincia + item.distrito, 10);
        distritosMap.set(id_distrito, {
          id: id_distrito,
          descripcion: item.nombre.toUpperCase(),
          id_provincia: id_prov
        });
      }
    }
  }

  const provincias = Array.from(provinciasMap.values());
  const distritos = Array.from(distritosMap.values());

  console.log(`Found ${provincias.length} provincias.`);
  console.log(`Found ${distritos.length} distritos.`);

  // Insertar Provincias
  for (const prov of provincias) {
    await prisma.provincia.upsert({
      where: { id: prov.id },
      update: { descripcion: prov.descripcion, id_departamento: prov.id_departamento },
      create: prov
    });
  }
  console.log('Provincias insertadas.');

  // Insertar Distritos
  for (const dist of distritos) {
    // Check if the provincia exists (just in case the JSON data had a district without a matching province row)
    const exists = provinciasMap.has(dist.id_provincia);
    if (exists) {
      await prisma.distrito.upsert({
        where: { id: dist.id },
        update: { descripcion: dist.descripcion, id_provincia: dist.id_provincia },
        create: dist
      });
    }
  }
  console.log('Distritos insertados.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
