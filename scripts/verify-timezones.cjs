/* global __dirname */
const { spawnSync } = require('node:child_process');
const path = require('node:path');
for (const timezone of ['UTC', 'America/Chicago', 'Europe/Berlin']) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', path.join(__dirname, 'verify-calendar.ts')], { env: { ...process.env, TZ: timezone }, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
