import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import openapiTS, { astToString } from 'openapi-typescript';

const openApiUrl = process.env.OPENAPI_URL ?? 'http://localhost:3000/api-json';
const outputFilePath = resolve(
  process.cwd(),
  'packages',
  'libs',
  'shared-contracts',
  'src',
  'generated',
  'openapi.ts',
);

const response = await fetch(openApiUrl);
if (!response.ok) {
  throw new Error(
    `Failed to fetch OpenAPI schema from "${openApiUrl}" (HTTP ${response.status}).`,
  );
}

const schema = await response.json();
const generatedTypesAst = await openapiTS(schema, {
  alphabetize: true,
});
const generatedTypes = astToString(generatedTypesAst);

await mkdir(dirname(outputFilePath), { recursive: true });
await writeFile(outputFilePath, generatedTypes, 'utf8');

console.log(`Generated OpenAPI contract types at: ${outputFilePath}`);
