'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BottomButton, Spinner, TextField, showToast } from '@dearbloom/ui';
import { customerNameSchema, CUSTOMER_NAME_MAX_LENGTH } from '@dearbloom/shared';
import { withFlashToast } from '@/src/lib/flashToast';

const schema = z.object({ name: customerNameSchema });
type FormValues = z.infer<typeof schema>;

export function EditForm({ initialName }: { initialName: string }) {
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
    // 이름만 전송한다 — 백엔드 규약상 생략한 필드는 미변경이라 기존 지역 값은 그대로 유지된다.
    const res = await fetch('/app/api/customer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: values.name }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      showToast(body.error || '저장에 실패했어요.', 'error');
      return;
    }

    // 완료 토스트는 이동한 마이페이지에서 띄운다(이 화면에서 띄우면 화면 전환에 묻힌다).
    window.location.href = withFlashToast('/app/my', 'profile');
  };

  const field = (
    <div className="px-4 pt-5">
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
      {field}
      {cta}
    </form>
  );
}
