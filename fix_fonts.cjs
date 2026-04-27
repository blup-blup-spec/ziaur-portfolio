const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');
c = c.replace(/fontWeight:700"/g, 'fontWeight:700');
fs.writeFileSync('src/App.tsx', c);
console.log('Fixed quotes');
