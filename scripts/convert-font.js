const fs = require('fs');
const path = require('path');

// อ่านไฟล์ฟอนต์
const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'THSarabunNew.ttf');
const font = fs.readFileSync(fontPath);
const base64 = font.toString('base64');

// สร้างเนื้อหาของไฟล์ TypeScript
const content = `/**
 * THSarabunNew Font for jsPDF
 * Converted from TTF to base64
 */

export const THSarabunNewFont = '${base64}';

/**
 * เพิ่มฟอนต์ THSarabunNew ให้กับ jsPDF document
 */
export function addTHSarabunFont(doc: any): void {
  doc.addFileToVFS('THSarabunNew.ttf', THSarabunNewFont);
  doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
}
`;

// เขียนไฟล์
const outputPath = path.join(__dirname, '..', 'src', 'assets', 'fonts', 'sarabun-font.ts');
fs.writeFileSync(outputPath, content, 'utf8');

console.log('✓ Font file created successfully!');
console.log('  Output:', outputPath);
console.log('  Size:', (base64.length / 1024).toFixed(2), 'KB');
