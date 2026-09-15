const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace <div style={{ display: 'grid' with <div className="mobile-stack" style={{ display: 'grid'
    const newContent = content.replace(/<div style={{ display: 'grid'/g, '<div className="mobile-stack" style={{ display: \'grid\'');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated grids in ${file}`);
    }
  }
});
