import { ChevronRight } from 'lucide-react';
import { Card } from '@dearbloom/ui';

import { MemberLogoutButton } from '@/src/components/common/MemberLogoutButton';
import { MemberRoleSwitchButton } from '@/src/components/common/MemberRoleSwitchButton';
import { MemberWithdrawalButton } from '@/src/components/common/MemberWithdrawalButton';

const rowClass = 'flex h-11 items-center justify-between transition-colors hover:opacity-70';

export function MyMenu({ showRoleSwitch }: { showRoleSwitch: boolean }) {
  const roleSwitch = showRoleSwitch ? <MemberRoleSwitchButton targetRole="ARTIST" /> : null;

  return (
    <Card className="mt-2 overflow-hidden">
      <nav className="flex flex-col px-5">
        <a href="/app/my/reservations" className={rowClass}>
          <span className="text-body-1 text-neutral-950">문의 내역</span>
          <ChevronRight className="size-6 text-neutral-400" aria-hidden />
        </a>
        <a href="/privacy-policy" className={rowClass}>
          <span className="text-body-1 text-neutral-950">개인정보 처리방침</span>
          <ChevronRight className="size-6 text-neutral-400" aria-hidden />
        </a>
        {roleSwitch}
        <MemberLogoutButton />
        <MemberWithdrawalButton />
      </nav>
    </Card>
  );
}
