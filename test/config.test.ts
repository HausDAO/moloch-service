import test from 'node:test';
import assert from 'node:assert/strict';
import { graphEndpoint, getConfig } from '../src/config.js';

test('getConfig applies service defaults', () => {
  const config = getConfig({});

  assert.equal(config.host, '0.0.0.0');
  assert.equal(config.port, 3000);
  assert.equal(config.ipfsGatewayUrl, 'https://gateway.pinata.cloud/ipfs/');
});

test('getConfig normalizes dedicated Pinata gateway hosts', () => {
  const config = getConfig({ IPFS_GATEWAY_URL: 'dark-factory.mypinata.cloud' });

  assert.equal(config.ipfsGatewayUrl, 'https://dark-factory.mypinata.cloud/ipfs/');
});

test('graphEndpoint prefers GRAPH_URL', () => {
  assert.equal(graphEndpoint({ graphUrl: 'https://example.test/subgraph' }), 'https://example.test/subgraph');
});

test('graphEndpoint builds DAOhaus gateway URL from key', () => {
  const endpoint = graphEndpoint({ graphApiKey: 'abc' });
  assert.equal(endpoint, 'https://gateway.thegraph.com/api/abc/subgraphs/id/7yh4eHJ4qpHEiLPAk9BXhL5YgYrTrRE6gWy8x4oHyAqW');
});

test('graphEndpoint requires graph config', () => {
  assert.throws(() => graphEndpoint({}), /Graph is not configured/);
});
