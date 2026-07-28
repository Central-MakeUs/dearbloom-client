import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, cn } from '@dearbloom/ui';

interface DetailMoreCollapsibleProps {
  /** 작가 기타 안내. */
  etcInfo?: string | null;
  /** 작가 소개. */
  intro?: string | null;
  /** 작가 소개 상단에 노출할 닉네임. */
  nickname: string;
}

/**
 * 상세 정보 더보기 — 기타 안내 + 작가 소개를 접었다 펴는 아코디언(Collapsible island).
 * 기존 인라인 <script> 토글을 대체. 기본 접힘.
 */
export function DetailMoreCollapsible({ etcInfo, intro, nickname }: DetailMoreCollapsibleProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-3">
      <CollapsibleContent className="flex flex-col gap-3">
        {etcInfo && (
          <section>
            <h3 className="mb-2 px-4 text-head-3 text-neutral-800">기타 안내</h3>
            <div className="mx-4 rounded-lg bg-neutral-0 p-4">
              <p className="whitespace-pre-line text-body-5 text-neutral-800">{etcInfo}</p>
            </div>
          </section>
        )}
        {intro && (
          <section>
            <h3 className="mb-2 px-4 text-head-3 text-neutral-800">작가 소개</h3>
            <div className="mx-4 rounded-lg bg-neutral-0 p-4">
              <p className="mb-1 text-body-4 text-neutral-950">{nickname}</p>
              <p className="whitespace-pre-line text-body-5 text-neutral-800">{intro}</p>
            </div>
          </section>
        )}
      </CollapsibleContent>

      <CollapsibleTrigger className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center justify-center gap-1 rounded-lg border border-neutral-300 bg-neutral-0 py-3 text-body-5 text-neutral-700">
        {open ? '상세 정보 접기' : '상세 정보 더보기'}
        <ChevronDown size={20} strokeWidth={2} aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
      </CollapsibleTrigger>
    </Collapsible>
  );
}
