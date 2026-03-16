import { killPort } from '@nx/node/utils';
import { rmSync } from 'node:fs';

import { clearRuntimeMetadata, readRuntimeMetadata } from './runtime-file';
/* eslint-disable */

module.exports = async function () {
  const runtimeMetadata = readRuntimeMetadata();
  const port = runtimeMetadata?.port ?? (process.env.PORT ? Number(process.env.PORT) : 3000);

  await killPort(port);
  if (runtimeMetadata?.databasePath) {
    rmSync(runtimeMetadata.databasePath, { force: true });
  }
  clearRuntimeMetadata();

  console.log('\nTearing down API e2e runtime...\n');
};
