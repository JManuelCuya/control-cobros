const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'ClientesPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Import sucursalesApi
if (!content.includes('sucursalesApi')) {
  content = content.replace("import { clientesApi, contratosApi, planesApi, pedidosApi } from '../services/api';", "import { clientesApi, contratosApi, planesApi, pedidosApi } from '../services/api';\nimport { sucursalesApi } from '../api/sucursales.api';");
}

// 2. Fetch sucursales
if (!content.includes('cargarSucursales')) {
  content = content.replace(
    /const cargarPlanes = async \(\) => \{[\s\S]*?\}\s*catch[^\}]+\}\s*\};\s*/,
    `$&
  const cargarSucursales = async () => {
    try {
      const data = await sucursalesApi.getAll();
      setSucursales(data);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
    }
  };
`
  );
  
  content = content.replace(
    /useEffect\(\(\) => \{\s*cargarClientes\(\)/,
    "useEffect(() => {\n    cargarSucursales();\n    cargarClientes()"
  );
}

// 3. Edit and open modals for sucursal
content = content.replace(
  /const openNewModal = \(\) => \{[\s\S]*?setFormData\(\{([^}]+)\}\);/,
  "const openNewModal = () => {\n    setEditingCliente(null);\n    setFormData({\n$1, id_sucursal: ''\n    });"
);

content = content.replace(
  /const handleEditCliente = \(cliente: Cliente\) => \{[\s\S]*?setFormData\(\{([^}]+)\}\);/,
  "const handleEditCliente = (cliente: Cliente) => {\n    setEditingCliente(cliente);\n    setFormData({\n$1, id_sucursal: cliente.id_sucursal ? String(cliente.id_sucursal) : ''\n    });"
);

// 4. Form handling (in case id_sucursal needs to be parsed as number in handleSubmit)
content = content.replace(
  /const payload = \{[\s\S]*?\.\.\.formData[\s\S]*?\};/,
  "const payload = {\n        ...formData,\n        id_sucursal: formData.id_sucursal ? Number(formData.id_sucursal) : null\n      };"
);

// 5. Add Sucursal field in form
if (!content.includes('htmlFor="id_sucursal"')) {
  content = content.replace(
    /<div className="form-group">\s*<label htmlFor="direccion">Dirección<\/label>/,
    `<div className="form-group">
                <label htmlFor="id_sucursal">Sucursal</label>
                <select
                  id="id_sucursal"
                  className="form-input"
                  value={formData.id_sucursal}
                  onChange={(e) => setFormData({ ...formData, id_sucursal: e.target.value })}
                  required
                >
                  <option value="">Seleccione una sucursal</option>
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.descripcion}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>`
  );
}

// 6. Update table headers
content = content.replace(
  /<th>Teléfono<\/th>\s*<th>Dirección Principal<\/th>/,
  "<th>Sucursal</th>\n                <th>Teléfono</th>\n                <th>Dirección Principal</th>"
);

// 7. Update table body (adding Sucursal and WhatsApp link)
content = content.replace(
  /<td>\{c\.telefono \|\| '-'\}.*?<\/td>/g,
  `<td>
                      {c.telefono ? (
                        <a 
                          href={\`https://wa.me/\${c.telefono.replace(/\\D/g,'')}\`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#25D366', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Enviar WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          {c.telefono}
                        </a>
                      ) : '-'}
                    </td>`
);

content = content.replace(
  /<td>\{c\.tipo_doc \? `\$\{c\.tipo_doc\}: \$\{c\.num_doc\}` : c\.num_doc \|\| '-'\}.*?<\/td>/g,
  `<td>{c.tipo_doc ? \`\${c.tipo_doc}: \${c.num_doc}\` : c.num_doc || '-'}</td>\n                    <td>{c.sucursal ? c.sucursal.descripcion : '-'}</td>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('ClientesPage updated successfully.');
