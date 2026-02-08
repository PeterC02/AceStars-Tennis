const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'schools');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const schools = [
  { file: 'ludgrove', label: 'Ludgrove School' },
  { file: 'edgbarrow', label: 'Edgbarrow School' },
  { file: 'yateley-manor', label: 'Yateley Manor' },
  { file: 'nine-mile-ride', label: 'Nine Mile Ride' },
  { file: 'luckley-house', label: 'Luckley House School' },
  { file: 'cofe-primary', label: 'C of E Primary School' },
  { file: 'oaklands-junior', label: 'Oaklands Junior School' },
  { file: 'our-ladys-prep', label: "Our Lady's Prep School" },
];

const colors = ['#2E354E', '#1E2333', '#3B4A6B', '#2A3550', '#1B2740', '#344563', '#2C3E5A', '#253248'];

schools.forEach((s, i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
  <rect width="600" height="400" fill="${colors[i]}"/>
  <text x="300" y="190" text-anchor="middle" fill="#dfd300" font-size="22" font-family="Arial, sans-serif" font-weight="bold">${s.label}</text>
  <text x="300" y="225" text-anchor="middle" fill="#AFB0B3" font-size="14" font-family="Arial, sans-serif">Photo coming soon</text>
</svg>`;
  fs.writeFileSync(path.join(dir, s.file + '.svg'), svg);
  console.log('Created ' + s.file + '.svg');
});

console.log('Done! Replace these SVGs with real .jpg photos when available.');
