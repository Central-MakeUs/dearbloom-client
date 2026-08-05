import assert from 'node:assert/strict';
import test from 'node:test';

import { submitFormNavigation } from './submitFormNavigation.ts';

test('string form data를 POST navigation form으로 제출한다', () => {
  const inputs: Array<{ name: string; type: string; value: string }> = [];
  let submitted = false;
  const form = {
    action: '',
    append: (input: { name: string; type: string; value: string }) => inputs.push(input),
    method: '',
    submit: () => {
      submitted = true;
    },
  };
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      body: { append: () => undefined },
      createElement: (tag: string) => (tag === 'form' ? form : {}),
    },
  });

  try {
    const data = new FormData();
    data.append('name', '김디어');
    data.append('region', 'SEOUL');

    submitFormNavigation('/app/api/members/customer', data);

    assert.equal(form.action, '/app/api/members/customer');
    assert.equal(form.method, 'post');
    assert.equal(submitted, true);
    assert.deepEqual(inputs, [
      { name: 'name', type: 'hidden', value: '김디어' },
      { name: 'region', type: 'hidden', value: 'SEOUL' },
    ]);
  } finally {
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
