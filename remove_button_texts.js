const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

const targets = [
  'Editar',
  'Eliminar',
  'Imprimir',
  'Ver Detalle',
  'Detalles',
  'Cobrar',
  'Pagar',
  'Editar Estado',
  'Ver Contratos',
  'Anular'
];

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    targets.forEach(target => {
      // Regex to match <Icon size={...} /> TargetText
      const regex = new RegExp(`(<[A-Za-z0-9]+ size=\\{\\d+\\} \\/>)\\s+${target}`, 'g');
      content = content.replace(regex, '$1');
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
  }
});
