'use client';

import { BottomButton, Spinner, Textarea } from '@dearbloom/ui';
import { ampmTimeLabel, shortDateLabel, type InquiryPreparation } from '@dearbloom/shared';

interface NoteStepProps {
  preparation: InquiryPreparation;
  summary: { shootDate: string; startTime: string; headCount: number; schoolName: string };
  note: string;
  onNoteChange: (next: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

/** 3단계 — 문의 내용 확인 + 요청 사항(선택) 작성 후 전송. */
export function NoteStep({
  preparation,
  summary,
  note,
  onNoteChange,
  onSubmit,
  submitting,
  error,
}: NoteStepProps) {
  const summaryCard = (
    <div className="flex items-start gap-3 rounded-lg bg-neutral-0 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-3 font-semibold text-neutral-950">{preparation.artworkName}</p>
        <p className="mt-0.5 truncate text-body-5 text-neutral-500">{preparation.artistNickname}</p>
        <p className="mt-3 text-body-4 text-neutral-950">
          {shortDateLabel(summary.shootDate)} <span className="text-neutral-300">|</span>{' '}
          {ampmTimeLabel(summary.startTime)}
        </p>
        <p className="mt-1 text-body-4 text-neutral-950">
          {summary.headCount}명 <span className="text-neutral-300">|</span> {summary.schoolName}
        </p>
      </div>
      <img
        src={preparation.artworkImageUrl}
        alt=""
        className="h-20 w-20 shrink-0 rounded-md object-cover"
      />
    </div>
  );

  const noteField = (
    <div className="flex flex-col gap-3">
      <h2 className="text-body-3 text-neutral-950">요청 사항을 적어주세요. (선택)</h2>
      <Textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={'특정 장소 혹은 포즈 등\n요청 내용을 자유롭게 적어주세요.'}
        className="min-h-[200px] bg-neutral-0"
      />
    </div>
  );

  const errorNote = error ? <p className="px-4 pb-2 text-caption-2 text-danger">{error}</p> : null;

  return (
    <>
      <div className="flex flex-col gap-8 px-4 pb-28 pt-4">
        {summaryCard}
        {noteField}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md bg-neutral-100 p-4">
        {errorNote}
        <BottomButton onClick={onSubmit} disabled={submitting}>
          {submitting ? <Spinner className="size-5 text-current" label="" /> : null}
          {submitting ? '보내는 중…' : '문의 보내기'}
        </BottomButton>
      </div>
    </>
  );
}
