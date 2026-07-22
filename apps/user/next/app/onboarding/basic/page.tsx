'use client';

import { useState } from 'react';
import { Button } from '@dearbloom/ui';

export default function OnboardingBasicPage() {
  const [nickname, setNickname] = useState('');
  const [school, setSchool] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  const canProceed = nickname.trim().length > 0 && school.trim().length > 0;

  const header = (
    <header className="px-4 pt-6">
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full w-1/3 rounded-full bg-primary" />
      </div>
      <p className="text-caption-1 text-neutral-500">STEP 1 / 3</p>
      <h1 className="mt-1 text-head-2 text-neutral-950">기본 정보를 알려주세요</h1>
      <p className="mt-1 text-body-5 text-neutral-600">더 잘 맞는 작가를 추천해드려요.</p>
    </header>
  );

  const nicknameField = (
    <div>
      <label htmlFor="nickname" className="mb-2 block text-body-4 text-neutral-900">
        닉네임
      </label>
      <input
        id="nickname"
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="예: 봄봄이"
        className="w-full rounded-lg border border-neutral-300 bg-neutral-0 px-4 py-3 text-body-4 outline-none focus:border-primary"
      />
    </div>
  );

  const schoolField = (
    <div>
      <label htmlFor="school" className="mb-2 block text-body-4 text-neutral-900">
        학교
      </label>
      <input
        id="school"
        type="text"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        placeholder="학교 검색"
        className="w-full rounded-lg border border-neutral-300 bg-neutral-0 px-4 py-3 text-body-4 outline-none focus:border-primary"
      />
    </div>
  );

  const budgetField = (
    <div>
      <label className="mb-2 block text-body-4 text-neutral-900">예산</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={budgetMin}
          onChange={(e) => setBudgetMin(e.target.value)}
          placeholder="최소"
          className="w-full flex-1 rounded-lg border border-neutral-300 bg-neutral-0 px-4 py-3 text-body-4 outline-none focus:border-primary"
        />
        <span className="text-neutral-500">~</span>
        <input
          type="number"
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
          placeholder="최대"
          className="w-full flex-1 rounded-lg border border-neutral-300 bg-neutral-0 px-4 py-3 text-body-4 outline-none focus:border-primary"
        />
        <span className="whitespace-nowrap text-body-5 text-neutral-600">원</span>
      </div>
    </div>
  );

  const cta = (
    <div className="sticky bottom-0 mt-6 border-t border-neutral-200 bg-neutral-0 p-4">
      <Button size="lg" className="w-full" disabled={!canProceed}>
        다음
      </Button>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
      {header}
      <div className="mt-6 flex flex-1 flex-col gap-6 px-4">
        {nicknameField}
        {schoolField}
        {budgetField}
      </div>
      {cta}
    </div>
  );
}
