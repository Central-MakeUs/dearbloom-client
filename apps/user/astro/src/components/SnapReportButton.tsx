import { useState } from 'react';
import {
  BottomButton,
  BottomSheet,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  cn,
} from '@dearbloom/ui';
import { ARTWORK_REPORT_CONTENT_MAX } from '@dearbloom/shared';

/** 신고 사유 프리셋 — API 는 자유 텍스트 1개만 받으므로 라벨을 content 에 실어 보낸다. */
const REASONS = [
  '부적절한 사진 또는 내용',
  '허위 또는 과장된 정보',
  '타인 작품 도용',
  '외부 거래 · 부정 유도',
  '기타',
] as const;

const OTHER = '기타';

/** 프리셋 + 상세 입력을 운영자가 읽기 쉬운 한 덩어리로 합친다. */
function buildContent(reason: string, detail: string): string {
  const trimmed = detail.trim();
  return trimmed ? `사유: ${reason}\n상세: ${trimmed}` : `사유: ${reason}`;
}

interface SnapReportButtonProps {
  artworkId: number;
  /** 서버 렌더 시점의 신고 여부. 비로그인이면 false. */
  initialReported?: boolean;
  /** 신고 프록시 엔드포인트. astro(루트) 기본값. */
  endpoint?: string;
  /** 비로그인(401) 시 이동할 로그인 경로. 현재 경로를 returnUrl 로 붙인다. */
  loginHref?: string;
}

/**
 * 작품 상세 하단의 '이 작품 신고하기' — 클라이언트 island.
 * 같은 도메인 프록시로 요청(쿠키 자동 전송) → 서버가 Bearer 로 백엔드 호출.
 * 신고는 취소가 없어서 한 번 접수되면 진입점이 안내 문구로 고정된다.
 */
export function SnapReportButton({
  artworkId,
  initialReported = false,
  endpoint = '/api/artwork-report',
  loginHref = '/app/login',
}: SnapReportButtonProps) {
  const [reported, setReported] = useState(initialReported);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsDetail = reason === OTHER;
  const canSubmit = !!reason && (!needsDetail || detail.trim().length > 0);

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setReason('');
      setDetail('');
      setError(null);
    }
  }

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, content: buildContent(reason, detail) }),
      });

      if (res.status === 401) {
        const returnUrl = window.location.pathname + window.location.search;
        window.location.href = `${loginHref}?returnUrl=${encodeURIComponent(returnUrl)}`;
        return;
      }
      // 이미 신고한 작품 — 실패가 아니라 '접수됨' 상태로 수렴시킨다.
      if (res.status === 409) {
        setReported(true);
        close(false);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));

      setReported(true);
      close(false);
    } catch {
      setError('신고를 접수하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  const trigger = reported ? (
    <p className="py-4 text-center text-caption-1 text-neutral-400">신고가 접수된 작품이에요</p>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mx-auto block py-4 text-caption-1 text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-700"
    >
      이 작품 신고하기
    </button>
  );

  const reasonList = (
    <RadioGroup value={reason} onValueChange={setReason} className="gap-0">
      {REASONS.map((r) => (
        <label
          key={r}
          className="flex cursor-pointer items-center gap-3 py-3 text-body-5 text-neutral-950"
        >
          <RadioGroupItem value={r} />
          {r}
        </label>
      ))}
    </RadioGroup>
  );

  const detailField = (
    <div className="mt-2 flex flex-col gap-1.5">
      <label htmlFor="report-detail" className="text-body-4 text-neutral-950">
        상세 내용 {needsDetail ? '' : '(선택)'}
      </label>
      <Textarea
        id="report-detail"
        value={detail}
        maxLength={ARTWORK_REPORT_CONTENT_MAX}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="신고 사유를 자세히 적어주시면 확인에 도움이 돼요."
        className="min-h-[104px]"
      />
      <p className="text-right text-caption-2 text-neutral-500">
        {detail.length}/{ARTWORK_REPORT_CONTENT_MAX}
      </p>
    </div>
  );

  const errorNote = error ? <p className="text-caption-2 text-danger">{error}</p> : null;

  const sheet = (
    <BottomSheet open={open} onOpenChange={close} title="작품 신고하기">
      <div className="flex flex-col gap-3 px-4 pb-2">
        <h2 className="text-head-3 text-neutral-950">작품 신고하기</h2>
        <p className="text-caption-1 text-neutral-500">
          신고는 취소할 수 없어요. 확인 후 운영팀이 조치할게요.
        </p>
        {reasonList}
        {detailField}
        {errorNote}
        <BottomButton
          onClick={submit}
          disabled={!canSubmit || busy}
          className={cn('mt-1', busy && 'opacity-70')}
        >
          {busy ? '접수 중…' : '신고하기'}
        </BottomButton>
      </div>
    </BottomSheet>
  );

  return (
    <>
      {trigger}
      {sheet}
    </>
  );
}
