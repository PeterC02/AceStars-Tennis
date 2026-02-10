// Uses the xlsx package if available, otherwise falls back to reading the already-captured data
const fs = require('fs');
const path = require('path');

try {
  const XLSX = require('xlsx');
  const filePath = path.join('C:', 'Users', 'Peter', 'Desktop', 'AceStars', 'AceStars Business Command Centre 2026 Final Bugged (1).xlsx');
  const wb = XLSX.readFile(filePath);
  const outDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(ws);
    const safeName = name.replace(/[^a-zA-Z0-9 _-]/g, '');
    fs.writeFileSync(path.join(outDir, `${safeName}.csv`), csv, 'utf8');
    console.log(`Wrote ${safeName}.csv`);
  });
  console.log('DONE');
} catch (e) {
  console.error('Need xlsx package. Run: npm install xlsx');
  console.error(e.message);
}
