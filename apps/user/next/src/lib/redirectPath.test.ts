import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { LOGIN_HREF, LOGIN_REDIRECT_PATH } from './env.ts';

const BASE_PATH = '/app';
const appDir = path.join(import.meta.dirname, '..', '..', 'app');

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath);

      return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
    }),
  );

  return files.flat();
}

test('브라우저용 로그인 경로와 redirect() 용 경로가 basePath만큼만 다르다', () => {
  assert.equal(`${BASE_PATH}${LOGIN_REDIRECT_PATH}`, LOGIN_HREF);
});

// next 의 redirect() 는 Location 을 만들 때 basePath 를 자동으로 붙인다.
// 여기에 '/app/...' 을 넘기면 '/app/app/...' 이 되어 404 가 된다.
test('서버 컴포넌트의 redirect() 는 basePath 를 직접 붙이지 않는다', async () => {
  const offenders: string[] = [];

  for (const file of await collectSourceFiles(appDir)) {
    const source = await readFile(file, 'utf8');
    for (const [match] of source.matchAll(/\bredirect\(\s*[`'"]\/app\b[^`'"]*/g)) {
      offenders.push(`${path.relative(appDir, file)}: ${match})`);
    }
  }

  assert.deepEqual(offenders, []);
});
