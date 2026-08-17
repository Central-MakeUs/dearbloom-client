'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Info, Minus, Plus, Search } from 'lucide-react';
import {
  BottomButton,
  DeleteButton,
  Header,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  TextField,
  Textarea,
  cn,
  showToast,
} from '@dearbloom/ui';
import type { InquiryCreateResult, InquiryPreparation, University } from '@dearbloom/shared';
import {
  getUniversityLabel,
  UniversitySearchScreen,
} from '@/src/components/common/UniversitySearchScreen';
import { ampmTimeLabel, durationLabel } from '@/src/lib/inquiry';
import { getSlotTimes, getStartTimes } from '@/src/lib/inquirySlots';
import { buildSlotGrid } from '@/src/lib/slots';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const dateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const shortDateLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][parsed.getDay()];
  return `${date.slice(2).replaceAll('-', '.')} (${weekday})`;
};
export function SmartInquiryForm({ preparation }: { preparation: InquiryPreparation }) {
  const requiredSlotCount = preparation.requiredSlotCount ?? 1;
  const minHeadCount = preparation.minHeadCount ?? 1;
  const durationMinutes =
    preparation.durationMinutes ?? requiredSlotCount * preparation.slotStepMinutes;
  const availability = useMemo(
    () => new Map(preparation.availability.map((day) => [day.date, day.availableTimes])),
    [preparation],
  );
  const firstDate = preparation.availability.find(
    (day) =>
      getStartTimes(day.availableTimes, requiredSlotCount, preparation.slotStepMinutes).length > 0,
  )?.date;
  const initialMonth = firstDate ? new Date(`${firstDate}T00:00:00`) : new Date();
  const [month, setMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );
  const [shootDate, setShootDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [headCount, setHeadCount] = useState(minHeadCount);
  const [step, setStep] = useState<'schedule' | 'school' | 'details' | 'done'>('schedule');
  const [selectedUniversity, setSelectedUniversity] = useState<University>();
  const [manualSchoolName, setManualSchoolName] = useState('');
  const [isManualSchoolVisible, setIsManualSchoolVisible] = useState(false);
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<InquiryCreateResult>();

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const days = Array.from(
    { length: new Date(year, monthIndex + 1, 0).getDate() },
    (_, index) => index + 1,
  );
  const blanks = Array.from(
    { length: new Date(year, monthIndex, 1).getDay() },
    (_, index) => index,
  );
  const startTimes = shootDate
    ? getStartTimes(
        availability.get(shootDate) ?? [],
        requiredSlotCount,
        preparation.slotStepMinutes,
      )
    : [];
  const timeSlots = buildSlotGrid(30);
  const availableSlotTimes = new Set(
    (availability.get(shootDate) ?? []).map((time) => time.slice(0, 5)),
  );
  const selectedTimes = new Set(
    getSlotTimes(startTime, requiredSlotCount, preparation.slotStepMinutes),
  );
  const canContinue = Boolean(shootDate && startTime);
  const canContinueSchool = Boolean(selectedUniversity || manualSchoolName.trim());
  const schoolLabel = selectedUniversity
    ? getUniversityLabel(selectedUniversity)
    : manualSchoolName.trim();

  const changeMonth = (offset: number) => {
    setMonth(new Date(year, monthIndex + offset, 1));
    setShootDate('');
    setStartTime('');
  };

  const submit = async () => {
    if (!canContinueSchool) return setError('촬영 학교를 선택해 주세요.');
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/app/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkPackageId: preparation.artworkPackageId,
          shootDate,
          startTime,
          headCount,
          ...(selectedUniversity
            ? { universityId: selectedUniversity.universityId }
            : { schoolName: manualSchoolName.trim() }),
          requestNote: requestNote.trim() || undefined,
        }),
      });
      const body = (await response.json()) as InquiryCreateResult & { error?: string };
      if (!response.ok || !body.inquiryId) {
        setError(body.error ?? '문의를 보내지 못했습니다.');
        return;
      }
      setSent(body);
      setStep('done');
    } catch {
      setError('네트워크 연결을 확인하고 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'done') return <InquirySentView chatRoomId={sent?.chatRoomId} />;

  if (isSearchingSchool) {
    return (
      <UniversitySearchScreen
        initialKeyword={selectedUniversity?.name ?? manualSchoolName}
        onBack={() => setIsSearchingSchool(false)}
        onManualInput={(keyword) => {
          setSelectedUniversity(undefined);
          setManualSchoolName(keyword);
          setIsManualSchoolVisible(true);
          setIsSearchingSchool(false);
        }}
        onSelect={(university) => {
          setSelectedUniversity(university);
          setManualSchoolName('');
          setIsManualSchoolVisible(false);
          setIsSearchingSchool(false);
        }}
      />
    );
  }

  const calendarDays = days.map((day) => {
    const value = dateKey(year, monthIndex, day);
    const enabled =
      getStartTimes(availability.get(value) ?? [], requiredSlotCount, preparation.slotStepMinutes)
        .length > 0;
    const selected = shootDate === value;
    return (
      <button
        key={value}
        type="button"
        disabled={!enabled}
        onClick={() => {
          setShootDate(value);
          setStartTime('');
        }}
        className={cn(
          'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-body-5',
          selected && 'bg-primary text-neutral-0',
          !selected && enabled && 'text-neutral-950',
          !enabled && 'text-neutral-400',
        )}
      >
        {day}
      </button>
    );
  });

  const timeButtons = timeSlots.map((time) => {
    const available = availableSlotTimes.has(time);
    const selectable = startTimes.includes(time);
    const selected = selectedTimes.has(time);

    return (
      <button
        key={time}
        type="button"
        disabled={!available}
        aria-disabled={!selectable}
        onClick={() => {
          if (!selectable) {
            showToast(`${durationLabel(durationMinutes)} 촬영은 이 시간에 시작할 수 없어요.`, 'error');
            return;
          }
          setStartTime(time);
        }}
        className={cn(
          'h-[34px] rounded-[6px] border text-body-5',
          selectable
            ? 'border-neutral-300 bg-neutral-0 text-neutral-800'
            : available
              ? 'border-dashed border-neutral-300 bg-neutral-0 text-neutral-400'
              : 'border-neutral-300 bg-neutral-200 text-neutral-400',
          selected && 'border-primary bg-primary-50 text-primary',
        )}
      >
        {time}
      </button>
    );
  });

  const selectedPackage = (
    <div className="mx-4 mb-6 rounded-lg bg-neutral-0 p-4">
      <p className="text-caption-1 text-neutral-600">선택한 패키지</p>
      <p className="mt-1 text-head-3 text-neutral-950">{preparation.packageName}</p>
    </div>
  );

  const durationInfo = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="촬영 시간 선택 안내"
          className="flex h-8 w-8 items-center justify-center text-neutral-600"
        >
          <Info size={18} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 text-caption-1 text-neutral-600">
        선택한 패키지{' '}
        <strong className="font-semibold text-neutral-950">{durationLabel(durationMinutes)}</strong>
        에 맞춰 연속 시간이 자동 선택돼요.
      </PopoverContent>
    </Popover>
  );

  const scheduleContent = (
    <>
      {selectedPackage}
      <section>
        <h2 className="px-5 text-head-3 text-neutral-950">촬영 날짜를 선택해 주세요.</h2>
        <div className="mt-8 flex h-9 items-center justify-between px-5">
          <strong className="text-head-3 text-neutral-950">
            {year}년 {monthIndex + 1}월
          </strong>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => changeMonth(-1)}
              className="flex h-9 w-9 items-center justify-center"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => changeMonth(1)}
              className="flex h-9 w-9 items-center justify-center"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-7 px-[11px]">
          {weekdays.map((day) => (
            <span
              key={day}
              className="flex h-10 items-center justify-center text-body-5 text-neutral-700"
            >
              {day}
            </span>
          ))}
          {blanks.map((blank) => (
            <span key={`blank-${blank}`} />
          ))}
          {calendarDays}
        </div>
      </section>
      <section className="mt-14">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-head-3 text-neutral-950">촬영 시간을 선택해 주세요.</h2>
          {durationInfo}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 px-4">
          {timeButtons}
        </div>
      </section>
      <section className="mb-28 mt-14">
        <h2 className="px-5 text-head-3 text-neutral-950">촬영 인원을 선택해 주세요.</h2>
        <div className="mx-4 mt-2 flex h-14 items-center justify-between rounded-md bg-neutral-0 px-1">
          <button
            type="button"
            aria-label="인원 줄이기"
            disabled={headCount <= minHeadCount}
            onClick={() => setHeadCount((count) => count - 1)}
            className="flex h-12 w-12 items-center justify-center disabled:text-neutral-300"
          >
            <Minus size={24} />
          </button>
          <span className="text-head-3 text-neutral-950">{headCount}명</span>
          <button
            type="button"
            aria-label="인원 늘리기"
            disabled={preparation.maxHeadCount != null && headCount >= preparation.maxHeadCount}
            onClick={() => setHeadCount((count) => count + 1)}
            className="flex h-12 w-12 items-center justify-center disabled:text-neutral-300"
          >
            <Plus size={24} />
          </button>
        </div>
      </section>
    </>
  );

  const schoolField = (
    <div className="flex w-full flex-col gap-2">
      <span className="text-body-4 text-neutral-950">학교명 검색</span>
      <div className="flex h-14 items-center gap-2 rounded-md bg-neutral-0 px-4">
        <button
          type="button"
          aria-label="학교명 검색 화면 열기"
          onClick={() => setIsSearchingSchool(true)}
          className="flex min-w-0 flex-1 items-center text-left focus:outline-none"
        >
          <span
            className={cn(
              'flex-1 text-body-2',
              selectedUniversity ? 'text-neutral-950' : 'text-neutral-500',
            )}
          >
            {selectedUniversity ? getUniversityLabel(selectedUniversity) : '학교명을 검색하세요'}
          </span>
        </button>
        {selectedUniversity ? (
          <DeleteButton onClick={() => setSelectedUniversity(undefined)} />
        ) : (
          <Search aria-hidden className="text-neutral-500" size={20} strokeWidth={1.8} />
        )}
      </div>
    </div>
  );

  const schoolContent = (
    <section className="px-4 pt-5">
      <h2 className="text-body-2 text-neutral-950">촬영 학교를 선택해 주세요.</h2>
      <div className="mt-4">{schoolField}</div>
      {isManualSchoolVisible ? (
        <TextField
          autoFocus
          className="mt-6"
          id="manual-school-name"
          label="학교명 직접 입력"
          onChange={(event) => setManualSchoolName(event.target.value)}
          onClear={() => setManualSchoolName('')}
          placeholder="학교명과 캠퍼스명을 입력하세요"
          value={manualSchoolName}
        />
      ) : null}
    </section>
  );

  const detailsContent = (
    <section className="px-4 pt-2">
      <div className="flex h-[143px] items-start gap-3 rounded-lg bg-neutral-0 p-[18px] shadow-elevation">
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-3 text-neutral-900">{preparation.artworkName}</p>
          <p className="truncate text-body-5 text-neutral-600">{preparation.artistNickname}</p>
          <div className="mt-2 text-body-5 text-neutral-800">
            <p>
              {shortDateLabel(shootDate)} <span className="text-neutral-300">|</span>{' '}
              {ampmTimeLabel(startTime)}
            </p>
            <p>
              {headCount}명 <span className="text-neutral-300">|</span> {schoolLabel}
            </p>
          </div>
        </div>
        {preparation.artworkImageUrl ? (
          <img
            src={preparation.artworkImageUrl}
            alt=""
            className="h-[93px] w-[70px] shrink-0 rounded-md object-cover"
          />
        ) : null}
      </div>
      <label className="mt-6 block text-body-2 text-neutral-950">
        요청 사항을 적어주세요. (선택)
        <Textarea
          value={requestNote}
          onChange={(event) => setRequestNote(event.target.value)}
          placeholder={'특정 장소 혹은 포즈 등\n요청 내용을 자유롭게 적어주세요.'}
          className="mt-2 h-36 min-h-36 resize-none border-0 bg-neutral-0 p-4 text-body-2 shadow-none focus-visible:ring-primary/40"
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 text-body-6 text-error">
          {error}
        </p>
      )}
    </section>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="mx-auto min-h-dvh max-w-[375px]">
        <Header
          title="스마트 문의하기"
          onBack={() =>
            step === 'details'
              ? setStep('school')
              : step === 'school'
                ? setStep('schedule')
                : history.back()
          }
        />
        <div className="pt-3">
          {step === 'schedule'
            ? scheduleContent
            : step === 'school'
              ? schoolContent
              : detailsContent}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[375px] bg-neutral-100 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
        {step === 'schedule' ? (
          <BottomButton color="black" disabled={!canContinue} onClick={() => setStep('school')}>
            다음
          </BottomButton>
        ) : step === 'school' ? (
          <BottomButton
            color="black"
            disabled={!canContinueSchool}
            onClick={() => setStep('details')}
          >
            다음
          </BottomButton>
        ) : (
          <BottomButton color="green" disabled={submitting} onClick={submit}>
            {submitting ? <Spinner className="size-5 text-current" label="" /> : null}
            {submitting ? '전송 중...' : '문의 보내기'}
          </BottomButton>
        )}
      </div>
    </main>
  );
}

function InquirySentView({ chatRoomId }: { chatRoomId?: number }) {
  const chatHref = chatRoomId ? `/app/chats/${chatRoomId}` : '/app/chats';

  return (
    <main className="min-h-dvh bg-primary-100">
      <div className="mx-auto flex min-h-dvh max-w-[375px] flex-col px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-400 text-neutral-0">
            <Check size={40} strokeWidth={3.5} aria-hidden />
          </span>
          <div>
            <h1 className="text-head-1 text-neutral-900">문의가 전송 되었어요!</h1>
            <p className="mt-2 text-body-2 text-neutral-800">
              구체적인 조율 및 추가 문의는 채팅을
              <br />
              통해 이어갈 수 있어요.
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-col items-center gap-3">
          <BottomButton color="green" onClick={() => (window.location.href = chatHref)}>
            채팅방으로 이동하기
          </BottomButton>
          <a href="/snaps" className="py-2 text-body-1 text-neutral-800">
            탐색으로 돌아가기
          </a>
        </div>
      </div>
    </main>
  );
}
