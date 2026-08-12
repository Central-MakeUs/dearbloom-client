import { MemberLogoutButton } from '@/src/components/common/MemberLogoutButton';
import { MyMenuRow } from '@/src/components/common/MyMenuRow';

export function MyMenu() {
  return (
    <nav className="mt-5 flex flex-col gap-1 px-5">
      <MyMenuRow label="문의 내역" href="/app/my/reservations" />
      <MyMenuRow label="개인정보 처리방침" href="/privacy-policy" />
      <MemberLogoutButton />
      <MyMenuRow label="탈퇴하기" href="/app/my/withdraw" />
    </nav>
  );
}
