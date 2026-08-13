#!/usr/bin/env node
/* global process, console */

/**
 * packages/ui/assets 의 공용 에셋을 각 앱의 public 으로 복사합니다.
 *
 * 로고처럼 astro / next 양쪽에서 쓰는 파일의 원본을 한 곳(packages/ui/assets)에만 두기 위한 스크립트입니다.
 * 복사본은 gitignore 대상이며, 각 앱의 dev / build 스크립트 앞에 체이닝해서 실행합니다.
 *
 * 사용: node .../copy-assets.mjs <앱 기준 대상 디렉터리>
 */

import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../assets');

const targetArg = process.argv[2];

if (!targetArg) {
  console.error('[ui] 대상 디렉터리가 필요합니다. 예: node copy-assets.mjs public/images');
  process.exit(1);
}

const targetDir = resolve(process.cwd(), targetArg);

await mkdir(targetDir, { recursive: true });
await cp(SOURCE_DIR, targetDir, { recursive: true });

console.log(`[ui] 공용 에셋 복사 완료 → ${targetArg}`);
