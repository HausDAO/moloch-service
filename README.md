# Moloch Service

Hosted helper service for autonomous DAOhaus/Moloch agents.

The service removes operator-facing Graph and Pinata secrets from the agent runtime. Agents still sign transactions locally. This service must never receive private keys.

## What It Does

- Proxies DAOhaus Base subgraph reads.
- Provides stable DAO/proposal/member/record endpoints.
- Pins public JSON artifacts to IPFS through Pinata v3 uploads.
- Reports capabilities for agent bootstrap.

## What It Does Not Do

- It does not sign transactions.
- It does not accept private keys or mnemonics.
- It does not make governance decisions.
- It does not replace direct chain preflight before sending transactions.

## Environment

```bash
PORT=3000
HOST=0.0.0.0
GRAPH_API_KEY=...
# or
GRAPH_URL=https://gateway.thegraph.com/api/<key>/subgraphs/id/7yh4eHJ4qpHEiLPAk9BXhL5YgYrTrRE6gWy8x4oHyAqW
PINATA_JWT=...
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

`GRAPH_API_KEY` or `GRAPH_URL` is required for Graph routes. `PINATA_JWT` is required for pinning routes. `IPFS_GATEWAY_URL` may be a full `/ipfs/` gateway URL or a Pinata dedicated gateway host; the service normalizes it to an `/ipfs/` URL.

## Install

```bash
npm install
npm run dev
```

## Build

```bash
npm run typecheck
npm run build
npm run start
```

## Railway

This repo includes `railway.json`.

Set Railway variables:

```bash
GRAPH_API_KEY=...
PINATA_JWT=...
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

Railway should run:

```bash
npm run build
npm run start
```

Healthcheck:

```text
/health
```

## Endpoints

### Health

```bash
curl http://localhost:3000/health
curl http://localhost:3000/capabilities
```

### DAO Reads

```bash
curl http://localhost:3000/dao/8453/0xDAO
curl http://localhost:3000/dao/8453/0xDAO/proposals
curl http://localhost:3000/dao/8453/0xDAO/proposals/1
curl http://localhost:3000/dao/8453/0xDAO/members
curl "http://localhost:3000/dao/8453/0xDAO/records?table=communityMemory"
```

### Graph Query

Read-only Graph passthrough:

```bash
curl -X POST http://localhost:3000/graph/query \
  -H 'content-type: application/json' \
  -d '{"query":"{ _meta { block { number } } }"}'
```

### Pin JSON

Uses Pinata v3 file uploads at `https://uploads.pinata.cloud/v3/files`. JSON is uploaded as a public `.json` file.

```bash
curl -X POST http://localhost:3000/pin/json \
  -H 'content-type: application/json' \
  -d '{"name":"community-state-v1","data":{"hello":"dao"}}'
```

Response:

```json
{
  "cid": "bafy...",
  "uri": "ipfs://bafy...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/bafy...",
  "size": 123,
  "mimeType": "application/json"
}
```

## Agent Default

The CLI package can default to:

```bash
MOLOCH_SERVICE_URL=https://moloch-agent-api.hausdao.org
```

Operators should only need to provide wallet/signer configuration for local signing.
