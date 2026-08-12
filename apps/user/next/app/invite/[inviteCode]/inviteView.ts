export type InviteView = 'guest' | 'login-complete' | 'member';

export function getInviteView(authenticated: boolean, loginComplete?: string): InviteView {
  if (!authenticated) return 'guest';
  return loginComplete === '1' ? 'login-complete' : 'member';
}
