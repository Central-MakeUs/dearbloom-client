'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BottomButton,
  DeleteButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  TextField,
  showToast,
} from '@dearbloom/ui';
import {
  ARTIST_REGION_OPTIONS,
  customerNameSchema,
  CUSTOMER_NAME_MAX_LENGTH,
  type ArtistRegionCode,
  type CustomerProfilePatch,
  type University,
} from '@dearbloom/shared';
import { withFlashToast } from '@/src/lib/flashToast';
import { UniversitySearchScreen } from '@/src/components/common/UniversitySearchScreen';

const schema = z.object({ name: customerNameSchema });
type FormValues = z.infer<typeof schema>;

type SelectedUniversity = Pick<University, 'universityId' | 'name'>;

interface EditFormProps {
  initialName: string;
  initialRegion: ArtistRegionCode | null;
  initialUniversity: SelectedUniversity | null;
}

export function EditForm({ initialName, initialRegion, initialUniversity }: EditFormProps) {
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(initialUniversity);
  const [manualUniversityName, setManualUniversityName] = useState('');
  const [region, setRegion] = useState<ArtistRegionCode | ''>(initialRegion ?? '');
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { name: initialName },
  });
  const name = watch('name');

  const onValid = async (values: FormValues) => {
    const body: CustomerProfilePatch = {
      name: values.name,
      universityId: selectedUniversity?.universityId ?? null,
      region: region || null,
    };
    const res = await fetch('/app/api/customer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      showToast(body.error || '저장에 실패했어요.', 'error');
      return;
    }

    // 완료 토스트는 이동한 마이페이지에서 띄운다(이 화면에서 띄우면 화면 전환에 묻힌다).
    window.location.replace(withFlashToast('/app/my', 'profile'));
  };

  if (isSearchingSchool) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <UniversitySearchScreen
          initialKeyword={selectedUniversity?.name ?? manualUniversityName}
          onBack={() => setIsSearchingSchool(false)}
          onManualInput={(keyword) => {
            setSelectedUniversity(null);
            setManualUniversityName(keyword);
            setIsSearchingSchool(false);
          }}
          onSelect={(university) => {
            setSelectedUniversity(university);
            setManualUniversityName('');
            setIsSearchingSchool(false);
          }}
        />
      </div>
    );
  }

  const nameField = (
    <div>
      <TextField
        id="username"
        label="사용자 이름"
        {...register('name')}
        value={name}
        maxLength={CUSTOMER_NAME_MAX_LENGTH}
        placeholder="사용자 이름을 입력해주세요"
        aria-invalid={!!errors.name}
        error={!!errors.name}
        helper={errors.name?.message}
        counter={`${name.length}/${CUSTOMER_NAME_MAX_LENGTH}`}
        onClear={() => setValue('name', '', { shouldValidate: true })}
      />
    </div>
  );

  const schoolName = selectedUniversity?.name ?? manualUniversityName;
  const schoolSearchField = (
    <div className="flex flex-col gap-2 pb-6">
      <span className="text-body-4 text-neutral-950">학교명</span>
      <div className="flex h-14 items-center gap-2 rounded-md border border-transparent bg-neutral-0 px-4 transition-colors hover:border-primary-400 focus-within:border-primary">
        <button
          aria-label="학교명 검색 화면 열기"
          className="min-w-0 flex-1 text-left text-body-2 text-neutral-950 outline-none"
          onClick={() => setIsSearchingSchool(true)}
          type="button"
        >
          {schoolName || '학교명을 검색하세요'}
        </button>
        {schoolName ? (
          <DeleteButton
            onClick={() => {
              setSelectedUniversity(null);
              setManualUniversityName('');
            }}
          />
        ) : null}
      </div>
    </div>
  );

  const regionField = (
    <div className="flex flex-col gap-2">
      <label className="text-body-4 text-neutral-950" htmlFor="region">
        촬영 희망 지역
      </label>
      <Select value={region} onValueChange={(value) => setRegion(value as ArtistRegionCode)}>
        <SelectTrigger
          className="h-14 border-transparent bg-neutral-0 px-4 text-body-2 hover:border-primary-400"
          id="region"
        >
          <SelectValue placeholder="촬영 희망 지역을 선택하세요">
            {region ? ARTIST_REGION_OPTIONS.find((option) => option.value === region)?.label : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ARTIST_REGION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const cta = (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[375px] bg-neutral-100 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
      <BottomButton color="black" type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? <Spinner className="size-5 text-current" label="" /> : null}
        완료
      </BottomButton>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-1 flex-col" noValidate>
      <div className="flex flex-col gap-4 px-4 pt-5">
        {nameField}
        {schoolSearchField}
        {regionField}
      </div>
      {cta}
    </form>
  );
}
