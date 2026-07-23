'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { customerNameSchema } from '@dearbloom/shared';

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
    const res = await fetch('/app/api/customer/name', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: values.name }),
    });
    if (res.ok) {
      toast.success('저장되었습니다.');
      window.location.href = '/app/my';
    } else {
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(b.error || '저장에 실패했어요.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-1 flex-col" noValidate>
      <div className="flex flex-col gap-1.5 px-4 pt-4">
        <label htmlFor="username" className="text-body-4 text-neutral-950">
          사용자 이름
        </label>
        <div className="flex h-14 items-center gap-2 rounded-md bg-neutral-0 px-4">
          <input
            id="username"
            {...register('name')}
            aria-invalid={!!errors.name}
            className="min-w-0 flex-1 bg-transparent text-body-2 text-neutral-950 outline-none placeholder:text-neutral-400"
            placeholder="사용자 이름을 입력해주세요"
          />
          {name && (
            <button
              type="button"
              aria-label="지우기"
              onClick={() => setValue('name', '', { shouldValidate: true })}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-neutral-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {errors.name ? (
          <p className="text-caption-1 text-danger">{errors.name.message}</p>
        ) : (
          <p className="text-caption-2 text-neutral-500">2-5자의 한글 또는 영문만 가능합니다</p>
        )}
      </div>

      <div className="mt-auto px-4 py-2">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="h-[52px] w-full rounded-md bg-neutral-800 text-body-1 text-neutral-0 disabled:opacity-40"
        >
          완료
        </button>
      </div>
    </form>
  );
}
