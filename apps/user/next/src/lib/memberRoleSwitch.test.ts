import assert from 'node:assert/strict';
import test from 'node:test';

import { requestMemberRoleSwitch } from './memberRoleSwitch.ts';

test('역할 전환 destination을 반환하고 API 오류를 전달한다', async () => {
  const success = await requestMemberRoleSwitch(
    'ARTIST',
    async () => Response.json({ destination: '/app/artist/dashboard' }),
  );

  assert.equal(success, '/app/artist/dashboard');
  await assert.rejects(
    requestMemberRoleSwitch(
      'CUSTOMER',
      async () => Response.json({ message: '역할 전환 실패' }, { status: 500 }),
    ),
    /역할 전환 실패/,
  );
});
