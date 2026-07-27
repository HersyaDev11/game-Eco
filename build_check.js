const { execSync } = require('child_process');
try {
  const out = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  console.log(out);
} catch (e) {
  console.error(e.stdout);
  console.error(e.stderr);
  process.exit(1);
}
