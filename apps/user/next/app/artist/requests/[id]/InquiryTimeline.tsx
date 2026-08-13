import { getReceivedInquiryHistory, shortDateLabel, ampmDateTimeLabel } from '@dearbloom/shared';

/**
 * 문의 상태 변경 이력(최초 문의 → 예약 완료/취소 …). Figma 화면이 없어 상세 하단의 단순 타임라인으로 붙인다.
 * 이력 조회가 실패하면 상세 전체를 막지 않도록 아무것도 렌더하지 않는다.
 */
export async function InquiryTimeline({ id, token }: { id: string; token: string }) {
  const history = await getReceivedInquiryHistory(id, { token }).catch(() => []);
  if (history.length === 0) return null;

  return (
    <section className="px-4 pb-4">
      <h2 className="mb-2 text-body-4 text-neutral-950">진행 이력</h2>
      <ol className="flex flex-col gap-3 rounded-lg bg-neutral-0 p-4">
        {history.map((item, index) => (
          <li key={`${item.changedAt}-${index}`} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-body-5 text-neutral-950">{item.toStatusLabel}</p>
              <p className="mt-0.5 text-caption-2 text-neutral-500">
                {shortDateLabel(item.changedAt.slice(0, 10))} {ampmDateTimeLabel(item.changedAt)} ·{' '}
                {item.changedByRoleLabel}
              </p>
              {item.reason && <p className="mt-0.5 text-caption-2 text-neutral-600">{item.reason}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
