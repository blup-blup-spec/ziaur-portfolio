const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Change font imports
code = code.replace(/family=Space\+Grotesk.*?&display=swap/, 'family=Inter:wght@300;400;500;600;700&display=swap');

// 2. Globally replace font families
code = code.replace(/fontFamily:"'Space Grotesk',sans-serif"/g, 'fontFamily:"\\'Inter\\',sans-serif"');
code = code.replace(/fontFamily:"'Space Mono',monospace"/g, 'fontFamily:"\\'Inter\\',sans-serif"');

// 3. Remove all textTransform uppercase (clean aesthetic uses standard casing)
code = code.replace(/textTransform:"uppercase",?/g, '');
// Clean up any double commas or stray commas left by removal
code = code.replace(/,}/g, '}');
code = code.replace(/,,/g, ',');

// 4. Tighten tracking on headings and adjust font weights
code = code.replace(/letterSpacing:1/g, 'letterSpacing:"-1px"');
code = code.replace(/letterSpacing:2/g, 'letterSpacing:0');
code = code.replace(/letterSpacing:4/g, 'letterSpacing:0');
code = code.replace(/letterSpacing:0/g, 'letterSpacing:"-1.5px"'); 
code = code.replace(/fontWeight:700/g, 'fontWeight:600');

// 5. Lighten body text color (from #B4A9A4 to #A3A3A3 or #A49B95 depending on contrast)
code = code.replace(/color:"#B4A9A4"/g, 'color:"#A3A3A3"');

// 6. Round the buttons (pill shape)
// We look for button tags and change borderRadius:2 or borderRadius:4 to borderRadius:30
code = code.replace(/borderRadius:2/g, 'borderRadius:30');
code = code.replace(/borderRadius:4/g, 'borderRadius:30');

// 7. Make small tags look like pills
// The small tags in Slider have padding:"4px 10px" and borderRadius:4. Now they will have borderRadius:30
// But we should ensure the border colors are subtle.
code = code.replace(/border:"1px solid rgba\\(255,255,255,0.4\\)"/g, 'border:"1px solid rgba(255,255,255,0.15)"');
code = code.replace(/border:"1px solid rgba\\(255,255,255,0.2\\)"/g, 'border:"1px solid rgba(255,255,255,0.15)"');

fs.writeFileSync('src/App.tsx', code);
console.log('Clean design applied');
