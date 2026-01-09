import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const fontsDir = resolve(__dirname, '../public/fonts');
const outputFile = resolve(__dirname, '../src/constants/fonts.ts');

const fonts = [
  { name: 'KARBON_SEMIBOLD', file: 'Karbon-Semibold.otf' },
  { name: 'KARBON_BOLD', file: 'Karbon-Bold.otf' },
  { name: 'KARBON_BOLD_ITALIC', file: 'Karbon-BoldItalic.otf' },
  { name: 'KARBON_MEDIUM', file: 'Karbon-Medium.otf' },
];

let output = `// Auto-generated file - Do not edit manually
// Generated on ${new Date().toISOString()}

`;

fonts.forEach(font => {
  const fontPath = resolve(fontsDir, font.file);
  const fontBuffer = readFileSync(fontPath);
  const fontBase64 = `data:font/opentype;base64,${fontBuffer.toString('base64')}`;
  output += `export const ${font.name} = '${fontBase64}';\n\n`;
});

writeFileSync(outputFile, output);
console.log('✓ Fonts converted to base64 successfully!');
console.log(`✓ Output file: ${outputFile}`);