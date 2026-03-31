const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const seedRunnerFile = join(
  process.cwd(),
  'packages',
  'apps',
  'api',
  'src',
  'shared',
  'persistence',
  'seed',
  'seed-runner.ts',
);

const result = spawnSync(process.execPath, ['-r', 'ts-node/register/transpile-only', seedRunnerFile], {
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
