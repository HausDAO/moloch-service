import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { getConfig } from '../src/config.js';

test('health and capabilities do not require external credentials', async () => {
  const app = await buildApp(getConfig({}));

  const health = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(health.statusCode, 200);
  assert.equal(health.json().ok, true);

  const capabilities = await app.inject({ method: 'GET', url: '/capabilities' });
  assert.equal(capabilities.statusCode, 200);
  assert.equal(capabilities.json().signing.handledByService, false);

  await app.close();
});

test('unsupported chain returns error before graph query', async () => {
  const app = await buildApp(getConfig({ GRAPH_URL: 'https://example.test/subgraph' }));

  const response = await app.inject({
    method: 'GET',
    url: '/dao/1/0x0000000000000000000000000000000000000001',
  });

  assert.equal(response.statusCode, 500);
  assert.match(response.json().error, /Unsupported chainId/);

  await app.close();
});
