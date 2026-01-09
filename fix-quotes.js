const fs = require('fs');

const filepath = process.argv[2] || 'getting-started/get-started-with-mainwp.mdx';
let content = fs.readFileSync(filepath, 'utf-8');

// Replace curly double quotes with straight single quotes
content = content.replace(/\u201c/g, "'");
content = content.replace(/\u201d/g, "'");

fs.writeFileSync(filepath, content, 'utf-8');
console.log('Fixed curly quotes in', filepath);

