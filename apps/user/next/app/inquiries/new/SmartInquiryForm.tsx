'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { BottomButton, Header } from '@dearbloom/ui';
import type { InquiryCreatePayload, InquiryCreateResult, InquiryPreparation } from '@dearbloom/shared';
import { DateTimeStep } from './DateTimeStep';
import { NoteStep } from './NoteStep';
import { SchoolStep, type SchoolValue } from './SchoolStep';

type Step = 'datetime' | 'school' | 'note' | 'done';

const STEP_ORDER: Step[] = ['datetime', 'school', 'note'];

interface SmartInquiryFormProps {
  preparation: InquiryPreparation;
}

/**
 * 스마트 문의 3단계(일시·인원 → 학교 → 요청사항) + 전송 완료.
 * 전송이 성공하면 백엔드가 채팅방을 만들고 문의 카드를 자동으로 남긴다.
 */
export function SmartInquiryForm({ preparation }: SmartInquiryFormProps) {
  const [step, setStep] = useState<Step>('datetime');
  const [when, setWhen] = useState({
    shootDate: '',
    startTime: '',
    headCount: preparation.minHeadCount ?? 1,
  });
  const [school, setSchool] = useState<SchoolValue>({ schoolName: '', freeform: false });
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<InquiryCreateResult | null>(null);

  function goBack() {
    const index = STEP_ORDER.indexOf(step);
    if (index <= 0) {
      window.history.back();
      return;
    }
    setStep(STEP_ORDER[index - 1]!);
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const payload: InquiryCreatePayload = {
      artworkPackageId: preparation.artworkPackageId,
      shootDate: when.shootDate,
      startTime: when.startTime,
      headCount: when.headCount,
      ...(school.freeform || !school.universityId
        ? { schoolName: school.schoolName.trim() }
        : { universityId: school.universityId }),
      ...(note.trim() ? { requestNote: note.trim() } : {}),
    };

    try {
      const res = await fetch('/app/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent((await res.json()) as InquiryCreateResult);
      setStep('done');
    } catch {
      setError('문의를 보내지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'done') {
    return <InquirySentView chatRoomId={sent?.chatRoomId} />;
  }

  const body =
    step === 'datetime' ? (
      <DateTimeStep
        preparation={preparation}
        value={when}
        onChange={setWhen}
        onNext={() => setStep('school')}
      />
    ) : step === 'school' ? (
      <SchoolStep value={school} onChange={setSchool} onNext={() => setStep('note')} />
    ) : (
      <NoteStep
        preparation={preparation}
        summary={{ ...when, schoolName: school.schoolName }}
        note={note}
        onNoteChange={setNote}
        onSubmit={submit}
        submitting={submitting}
        error={error}
      />
    );

  return (
    <div className="mx-auto max-w-md">
      <Header title="스마트 문의하기" onBack={goBack} />
      {body}
    </div>
  );
}

/**
 * 전송 완료 — 문의 응답의 chatRoomId 로 방금 문의 카드가 남은 방으로 바로 보낸다.
 * 응답 파싱이 실패한 예외적인 경우에만 채팅 목록으로 폴백한다.
 */
function InquirySentView({ chatRoomId }: { chatRoomId?: number }) {
  const chatHref = chatRoomId ? `/app/chats/${chatRoomId}` : '/app/chats';

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-400 text-neutral-0">
          <Check size={52} strokeWidth={3} aria-hidden />
        </span>
        <h1 className="text-head-2 text-neutral-950">문의가 전송 되었어요!</h1>
        <p className="text-body-4 text-neutral-600">
          구체적인 조율 및 추가 문의는 채팅을
          <br />
          통해 이어갈 수 있어요.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <BottomButton onClick={() => (window.location.href = chatHref)}>
          채팅방으로 이동하기
        </BottomButton>
        <a href="/snaps" className="py-1 text-body-3 text-neutral-950">
          탐색으로 돌아가기
        </a>
      </div>
    </div>
  );
}
