const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace color:"#C81D33" with color:"#EAE2DD" globally to fix red text on red background
c = c.replace(/color:"#C81D33"/g, 'color:"#EAE2DD"');

// Increase font sizes for Space Mono text
c = c.replace(/fontSize:11/g, 'fontSize:14');
c = c.replace(/fontSize:12/g, 'fontSize:15');
c = c.replace(/fontSize:15,color:"#EAE2DD"\}\}\{typed/g, 'fontSize:18,color:"#EAE2DD"\}\}\{typed');

fs.writeFileSync('src/App.tsx', c);
console.log('Fixed text sizes and color');
