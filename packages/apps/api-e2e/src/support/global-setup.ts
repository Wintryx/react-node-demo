import axios from 'axios';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';

import { writeRuntimeMetadata } from './runtime-file';

/* eslint-disable */

const resolveAvailablePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to resolve dynamic port for API e2e tests.'));
        return;
      }

      const { port } = address;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(port);
      });
    });
  });

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const waitForApiStartup = async (host: string, port: number): Promise<void> => {
  const deadline = Date.now() + 30_000;
  const healthUrl = `http://${host}:${port}/health`;

  while (Date.now() < deadline) {
    try {
      await axios.get(healthUrl, {
        timeout: 1_000,
      });
      return;
    } catch {
      await sleep(300);
    }
  }

  throw new Error(`API e2e runtime did not become healthy in time at ${healthUrl}.`);
};

module.exports = async function () {
  console.log('\nSetting up API e2e runtime...\n');

  const host = process.env.HOST ?? '127.0.0.1';
  const port = process.env.API_E2E_PORT
    ? Number(process.env.API_E2E_PORT)
    : await resolveAvailablePort();
  const databasePath = join(
    process.cwd(),
    'packages',
    'apps',
    'api',
    'data',
    `app-e2e-${Date.now()}.db`,
  );
  const apiEntryCandidates = [
    join(process.cwd(), 'dist', 'api', 'main.js'),
    join(process.cwd(), 'dist', 'packages', 'apps', 'api', 'main.js'),
  ];
  const apiEntryFile = apiEntryCandidates.find((filePath) => existsSync(filePath));
  if (!apiEntryFile) {
    throw new Error(
      `API build artifact not found for e2e runtime. Checked: ${apiEntryCandidates.join(', ')}`,
    );
  }

  spawn(process.execPath, [apiEntryFile], {
    stdio: 'ignore',
    env: {
      ...process.env,
      HOST: host,
      PORT: String(port),
      DATABASE_PATH: databasePath,
      NODE_ENV: 'test',
    },
  });

  writeRuntimeMetadata({
    host,
    port,
    databasePath,
  });

  await waitForApiStartup(host, port);
};
