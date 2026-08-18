import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createNavigationHistoryScript,
  DEARBLOOM_INTERNAL_ENTRY,
  getAppBackAction,
  isNextAppHref,
  toNextAppHref,
} from './appNavigation.ts';

function runNavigationHistoryScript(
  state: Record<string, unknown> | null = null,
  navigationType: 'navigate' | 'reload' = 'navigate',
) {
  const listeners = new Map<string, () => void>();
  const history = {
    state,
    pushState(nextState: Record<string, unknown> | null, ..._args: unknown[]) {
      void _args;
      this.state = nextState;
    },
    replaceState(nextState: Record<string, unknown> | null, ..._args: unknown[]) {
      void _args;
      this.state = nextState;
    },
  };
  const window = {
    addEventListener(name: string, listener: () => void) {
      listeners.set(name, listener);
    },
    history,
    location: { href: 'https://dearbloom.co.kr/app/my', origin: 'https://dearbloom.co.kr' },
  };
  const performance = { getEntriesByType: () => [{ type: navigationType }] };

  new Function('window', 'performance', 'URL', createNavigationHistoryScript())(window, performance, URL);

  return { history, listeners };
}

test('내부 push entry만 header back 대상으로 판단한다', () => {
  assert.equal(getAppBackAction({ [DEARBLOOM_INTERNAL_ENTRY]: true }), 'back');
  assert.equal(getAppBackAction(null), 'fallback');
  assert.equal(getAppBackAction({}), 'fallback');
});

test('/app 경로만 Next router 경로로 바꾼다', () => {
  assert.equal(isNextAppHref('/app/my'), true);
  assert.equal(isNextAppHref('/snaps'), false);
  assert.equal(toNextAppHref('/app/my'), '/my');
  assert.equal(toNextAppHref('/app'), '/');
});

test('Next history patch는 내부 push·replace에만 entry 표식을 유지한다', () => {
  const { history } = runNavigationHistoryScript();

  history.pushState({ next: true }, '', '/app/my/reservations/1');
  assert.equal(getAppBackAction(history.state), 'back');

  history.replaceState({ completed: true }, '', '/app/my/reservations');
  assert.equal(getAppBackAction(history.state), 'back');

  history.replaceState({ external: true }, '', '/snaps');
  assert.equal(getAppBackAction(history.state), 'fallback');
});

test('새로고침한 entry는 직접 진입처럼 fallback을 사용한다', () => {
  const { history } = runNavigationHistoryScript({ [DEARBLOOM_INTERNAL_ENTRY]: true }, 'reload');

  assert.equal(getAppBackAction(history.state), 'fallback');
});
