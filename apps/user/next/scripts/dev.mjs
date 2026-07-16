/* global process */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const rootEnvPath = resolve(appDir, '../../..', '.env');
const homeUrl = 'http://localhost:3000/app';

loadEnv(rootEnvPath);

const nextDev = spawn('next', ['dev', '--port', '3000'], {
  cwd: appDir,
  env: process.env,
  shell: process.platform === 'win32',
  stdio: ['inherit', 'pipe', 'pipe'],
});

let opened = false;

nextDev.stdout.on('data', (chunk) => {
  const output = chunk.toString();
  process.stdout.write(output);

  if (!opened && /ready|local:/i.test(output)) {
    opened = true;
    openBrowser(homeUrl);
  }
});

nextDev.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

nextDev.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

function loadEnv(path) {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = value.replace(/^["']|["']$/g, '');
  }
}

function openBrowser(url) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  const child = spawn(command, [url], {
    detached: true,
    shell: process.platform === 'win32',
    stdio: 'ignore',
  });

  child.unref();
}
