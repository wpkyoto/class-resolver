import fs from 'node:fs';

const esm = fs.readFileSync('dist/index.mjs', 'utf8');
if (esm.includes('module.exports')) {
  console.error('❌ ESM build contains module.exports');
  process.exit(1);
} else {
  console.log('✅ ESM build is clean');
}
