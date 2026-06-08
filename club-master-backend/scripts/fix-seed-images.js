import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const seedPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../database/seed.sql');
let c = fs.readFileSync(seedPath, 'utf8');
let n = 0;
c = c.replace(/'\/products\/LOCAL_[^']+'/g, () => {
  n += 1;
  if (n <= 30) return `'/products/${n}.jpg'`;
  if (n === 31) return `'/products/4.jpg'`;
  return `'/products/6.jpg'`;
});
fs.writeFileSync(seedPath, c);
console.log('Fixed', n, 'image URLs');
