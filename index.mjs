#!/usr/bin/env node
import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc';
import fetch from 'node-fetch';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2), {
  string: ['url','token'],
  alias: { u: 'url', t: 'token' },
});

if (!argv.url || !argv.token) {
  console.error('Usage: mcp-proxy --url <MCP_URL> --token <BEARER>');
  process.exit(1);
}

const reader = new StreamMessageReader(process.stdin);
const writer = new StreamMessageWriter(process.stdout);

reader.listen(async request => {
  try {
    const res = await fetch(argv.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${argv.token}`,
      },
      body: JSON.stringify(request),
    });
    const json = await res.json();
    writer.write(json);
  } catch (err) {
    console.error('Proxy error:', err);
    process.exit(1);
  }
});
