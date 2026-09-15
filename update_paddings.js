const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace padding: '0.3rem 0.6rem' with padding: '0.4rem'
    content = content.replace(/padding: '0.3rem 0.6rem'/g, "padding: '0.4rem'");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed paddings in ${file}`);
  }
});
