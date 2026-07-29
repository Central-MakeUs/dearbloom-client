import { MemberLogoutButton } from '@/src/components/common/MemberLogoutButton';
import { MemberWithdrawalButton } from '@/src/components/common/MemberWithdrawalButton';

const ChevronRight = () => (
  <svg
    aria-hidden
    className="text-neutral-400"
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export function MyMenu() {
  return (
    <nav className="mt-2 flex flex-col gap-1 px-5">
      <a href="/app/my/reservations" className="flex h-11 items-center justify-between transition-colors hover:opacity-70">
        <span className="text-body-1 text-neutral-950">예약 내역</span>
        <ChevronRight />
      </a>
      <MemberLogoutButton />
      <MemberWithdrawalButton />
    </nav>
  );
}
