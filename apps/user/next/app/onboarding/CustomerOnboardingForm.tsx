'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { University } from '@dearbloom/shared';
import { BottomButton, DeleteButton, Header, TextField } from '@dearbloom/ui';

const searchIcon = (
  <svg
    aria-hidden
    className="shrink-0 text-neutral-500"
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
    width="24"
  >
    <circle cx="11" cy="11" r="6" />
    <path d="m16 16 4 4" />
  </svg>
);

const getUniversityLabel = (university: University) =>
  `${university.name} ${university.region}캠퍼스`;

interface SchoolSearchScreenProps {
  initialKeyword: string;
  onBack: () => void;
  onSelect: (university: University) => void;
}

function SchoolSearchScreen({ initialKeyword, onBack, onSelect }: SchoolSearchScreenProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setUniversities([]);
      return;
    }

    const controller = new AbortController();
    fetch(`/app/api/universities?keyword=${encodeURIComponent(trimmedKeyword)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<University[]>)
      .then(setUniversities)
      .catch((fetchError: unknown) => {
        if (!(fetchError instanceof DOMException && fetchError.name === 'AbortError')) {
          setUniversities([]);
        }
      });

    return () => controller.abort();
  }, [keyword]);

  const resultList = universities.map((university) => {
    const label = getUniversityLabel(university);
    const matchStart = label.toLowerCase().indexOf(keyword.trim().toLowerCase());
    const matchEnd = matchStart + keyword.trim().length;
    const universityName =
      matchStart < 0 ? (
        label
      ) : (
        <>
          {label.slice(0, matchStart)}
          <mark className="bg-transparent text-primary">
            {label.slice(matchStart, matchEnd)}
          </mark>
          {label.slice(matchEnd)}
        </>
      );

    return (
      <li key={university.universityId}>
        <button
          className="w-full border-b border-neutral-200 px-5 py-4 text-left active:bg-neutral-200"
          onClick={() => onSelect(university)}
          type="button"
        >
          <p className="text-body-2 text-neutral-800">{universityName}</p>
          <p className="mt-1 text-body-4 text-neutral-600">{university.address}</p>
        </button>
      </li>
    );
  });

  const clearButton = keyword ? <DeleteButton onClick={() => setKeyword('')} /> : null;

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="mx-auto min-h-dvh max-w-[375px] overflow-hidden">
        <Header onBack={onBack} title="학교명 검색" />
        <div className="px-4 pt-3">
          <div className="flex h-14 items-center gap-2 rounded-md border border-transparent bg-neutral-0 px-4 transition-colors focus-within:border-primary">
            {searchIcon}
            <input
              aria-label="학교명 검색"
              autoComplete="off"
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-body-2 text-neutral-950 outline-none placeholder:text-neutral-500"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="학교명을 검색하세요"
              value={keyword}
            />
            {clearButton}
          </div>
        </div>
        <ul className="mt-2">{resultList}</ul>
      </div>
    </main>
  );
}

export function CustomerOnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isNameTouched, setIsNameTouched] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University>();
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const trimmedName = name.trim();
  const isNameValid = /^[A-Za-z가-힣]{2,5}$/.test(name);
  const shouldShowNameError = isNameTouched || name.length > 0;
  const nameError = shouldShowNameError
    ? trimmedName.length === 0
      ? '이름을 입력해 주세요.'
      : !/^[A-Za-z가-힣]+$/.test(name)
        ? '한글 또는 영문만 입력할 수 있어요.'
        : name.length < 2
          ? '최소 2자 이상 입력해 주세요.'
          : name.length > 5
            ? '최대 5자까지 입력할 수 있어요.'
            : undefined
    : undefined;

  const submit = async () => {
    if (!isNameValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch('/app/api/members/customer', {
        body: JSON.stringify({
          name: trimmedName,
          universityId: selectedUniversity?.universityId,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const body = (await response.json()) as { message?: string };

      if (!response.ok) throw new Error(body.message ?? '고객 정보를 저장하지 못했습니다.');

      window.location.replace('/snaps');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '고객 정보를 저장하지 못했습니다.');
      setIsSubmitting(false);
    }
  };

  if (isSearchingSchool) {
    return (
      <SchoolSearchScreen
        initialKeyword={selectedUniversity?.name ?? ''}
        onBack={() => setIsSearchingSchool(false)}
        onSelect={(university) => {
          setSelectedUniversity(university);
          setIsSearchingSchool(false);
        }}
      />
    );
  }

  const nameHelper = nameError ? (
    <span className="flex justify-between" role="alert">
      <span>{nameError}</span>
      <span>{name.length}/5</span>
    </span>
  ) : undefined;

  const schoolField = (
    <div className="flex w-full flex-col gap-2">
      <span className="text-body-4 text-neutral-950">학교명(선택)</span>
      <button
        aria-label="학교명 검색 화면 열기"
        className="flex h-14 items-center gap-2 rounded-md border border-transparent bg-neutral-0 px-4 text-left transition-colors hover:border-primary-400 focus:border-primary focus:outline-none"
        onClick={() => setIsSearchingSchool(true)}
        type="button"
      >
        <span
          className={
            selectedUniversity
              ? 'flex-1 text-body-2 text-neutral-950'
              : 'flex-1 text-body-2 text-neutral-500'
          }
        >
          {selectedUniversity ? getUniversityLabel(selectedUniversity) : '학교명을 검색하세요'}
        </span>
        {searchIcon}
      </button>
    </div>
  );

  const form = (
    <div className="mt-6 flex flex-col gap-6">
      <TextField
        autoComplete="name"
        error={!!nameError}
        helper={nameHelper}
        id="customer-name"
        label="사용자 이름"
        minLength={2}
        onBlur={() => setIsNameTouched(true)}
        onChange={(event) => setName(event.target.value)}
        pattern="[A-Za-z가-힣]{2,5}"
        placeholder="이름을 입력하세요"
        required
        value={name}
      />
      {schoolField}
    </div>
  );

  const footer = (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {error ? (
        <p className="mb-2 text-center text-caption-1 text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <BottomButton disabled={!isNameValid || isSubmitting} onClick={submit}>
        {isSubmitting ? '저장 중...' : '다음'}
      </BottomButton>
    </div>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-24">
        <Header onBack={() => router.back()} />
        <section className="px-4 pt-2">
          <div className="px-1 py-3">
            <h1 className="text-head-1 text-neutral-900">이름과 학교를 입력해 주세요.</h1>
            <p className="mt-3 text-body-2 text-neutral-800">
              작가님과 원활하게 소통할 수 있도록
              <br />
              사용자 이름은 실명으로 입력하는 것을 권장해요.
            </p>
          </div>
          {form}
        </section>
        {footer}
      </div>
    </main>
  );
}
