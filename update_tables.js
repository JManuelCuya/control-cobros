const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains the table
    if (content.includes('<table className="data-table">')) {
      // We will replace `<table className="data-table">` with `<div className="table-responsive">\n<table className="data-table">`
      // and we will replace `</table>` with `</table>\n</div>`
      // BUT we need to be careful if there are multiple tables.
      
      const parts = content.split('<table className="data-table">');
      if (parts.length > 1) {
        let newContent = parts[0];
        for (let i = 1; i < parts.length; i++) {
          let part = parts[i];
          // Find the first </table> in this part
          const tableEndIdx = part.indexOf('</table>');
          if (tableEndIdx !== -1) {
            const beforeTableEnd = part.substring(0, tableEndIdx + 8);
            const afterTableEnd = part.substring(tableEndIdx + 8);
            newContent += '<div className="table-responsive">\n                <table className="data-table">' + beforeTableEnd + '\n              </div>' + afterTableEnd;
          } else {
            // Should not happen unless malformed
            newContent += '<table className="data-table">' + part;
          }
        }
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
});
