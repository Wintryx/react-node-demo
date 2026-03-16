import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface ApiE2ERuntimeMetadata {
  host: string;
  port: number;
  databasePath: string;
}

const runtimeDirectory = join(process.cwd(), 'packages', 'apps', 'api-e2e', '.runtime');
const runtimeFilePath = join(runtimeDirectory, 'api-runtime.json');

export const writeRuntimeMetadata = (metadata: ApiE2ERuntimeMetadata): void => {
  mkdirSync(runtimeDirectory, { recursive: true });
  writeFileSync(runtimeFilePath, JSON.stringify(metadata), 'utf-8');
};

export const readRuntimeMetadata = (): ApiE2ERuntimeMetadata | null => {
  try {
    const content = readFileSync(runtimeFilePath, 'utf-8');
    const parsed = JSON.parse(content) as Partial<ApiE2ERuntimeMetadata>;
    if (
      typeof parsed.host !== 'string' ||
      typeof parsed.port !== 'number' ||
      typeof parsed.databasePath !== 'string'
    ) {
      return null;
    }

    return {
      host: parsed.host,
      port: parsed.port,
      databasePath: parsed.databasePath,
    };
  } catch {
    return null;
  }
};

export const clearRuntimeMetadata = (): void => {
  rmSync(runtimeFilePath, { force: true });
};
