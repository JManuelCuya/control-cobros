const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const filesToFix = ['CategoriasPage.tsx', 'EmpleadosPage.tsx', 'ProveedoresPage.tsx', 'UsuariosPage.tsx'];

filesToFix.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { confirmDialog }")) {
    // Just inject it after the first import (React usually)
    content = content.replace(/import React[^;]+;/, "$&\nimport { confirmDialog } from '../utils/confirmDialog';");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed import in ${file}`);
  }
});
