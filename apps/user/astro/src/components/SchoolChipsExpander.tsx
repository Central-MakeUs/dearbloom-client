import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@dearbloom/ui';

/**
 * 촬영 경험 학교 칩 (island) — Figma: 첫 칩만 노출 + '+N' 뱃지 + chevron, 클릭 시 전체 펼침.
 */
export function SchoolChipsExpander({ schools }: { schools: string[] }) {
  const [open, setOpen] = useState(false);
  const truncate = schools.length > 1;
  const shown = open || !truncate ? schools : schools.slice(0, 1);
  const extra = schools.length - 1;

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {shown.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded-sm bg-primary-100 px-2 py-0.5 text-body-5 text-neutral-800"
        >
          {s}
        </span>
      ))}
      {truncate && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '학교 접기' : `+${extra}개 학교 펼치기`}
          className="inline-flex items-center gap-0.5"
        >
          {!open && (
            <span className="inline-flex items-center rounded-sm bg-primary-100 px-2 py-0.5 text-body-5 text-neutral-800">
              +{extra}
            </span>
          )}
          <ChevronDown
            size={16}
            strokeWidth={2}
            aria-hidden
            className={cn('text-neutral-800 transition-transform', open && 'rotate-180')}
          />
        </button>
      )}
    </div>
  );
}
