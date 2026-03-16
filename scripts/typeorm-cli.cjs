const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const typeormCliFile = join(process.cwd(), 'node_modules', 'typeorm', 'cli-ts-node-commonjs.js');

const commandArgs = [
  typeormCliFile,
  '-d',
  'packages/apps/api/src/data-source.ts',
  ...process.argv.slice(2),
];

const result = spawnSync(process.execPath, commandArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    TS_NODE_PROJECT: join(process.cwd(), 'packages', 'apps', 'api', 'tsconfig.app.json'),
  },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
