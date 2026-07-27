const { execSync } = require('child_process');
try {
  const out = execSync('npx eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0', { encoding: 'utf-8' });
  console.log(out);
} catch (e) {
  console.error(e.stdout);
  console.error(e.stderr);
  process.exit(1);
}
