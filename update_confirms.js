const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has confirm
    if (content.includes('confirm(') || content.includes('window.confirm(')) {
      // Add import if not present
      if (!content.includes("import { confirmDialog }")) {
        content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { confirmDialog } from '../utils/confirmDialog';");
      }
      
      // Replace if (!confirm('...')) return;
      // Note: we'll use a regex that handles both confirm and window.confirm
      content = content.replace(/if \(!confirm\('([^']+)'\)\) return;/g, "if (!(await confirmDialog('$1'))) return;");
      content = content.replace(/if \(!window\.confirm\('([^']+)'\)\) return;/g, "if (!(await confirmDialog('$1'))) return;");
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated confirm in ${file}`);
    }
  }
});
