'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  Field,
  Input,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@dearbloom/ui';
import { customerNameSchema, ARTIST_REGION_OPTIONS, type ArtistRegionCode } from '@dearbloom/shared';

const schema = z.object({ name: customerNameSchema, region: z.string() });
type FormValues = z.infer<typeof schema>;

export function EditForm({ initialName, initialRegion }: { initialName: string; initialRegion: string }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { name: initialName, region: initialRegion },
  });
  const name = watch('name');

  const onValid = async (values: FormValues) => {
    // region은 항상 명시적으로 전송한다. 값이 없으면 null을 보내 서버에서 "미설정"으로 초기화.
    // (백엔드 규약상 필드를 생략하면 미변경이므로, 지역 해제를 반영하려면 null이 필요하다.)
    const body: { name: string; region: ArtistRegionCode | null } = {
      name: values.name,
      region: values.region ? (values.region as ArtistRegionCode) : null,
    };
    const res = await fetch('/app/api/customer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
      <div className="px-4 pt-4">
        <Field
          label="사용자 이름"
          htmlFor="username"
          error={errors.name?.message}
          helper="이름은 2~12글자 한글 또는 영문만 허용하며, 공백이나 숫자는 입력할 수 없습니다"
        >
          <div className="relative">
            <Input
              id="username"
              {...register('name')}
              aria-invalid={!!errors.name}
              placeholder="사용자 이름을 입력해주세요"
              className="pr-10"
            />
            {name && (
              <button
                type="button"
                aria-label="지우기"
                onClick={() => setValue('name', '', { shouldValidate: true })}
                className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-300 text-neutral-0"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </Field>
      </div>

      <div className="px-4 pt-5">
        <Field label="지역" optional htmlFor="region">
          <Controller
            control={control}
            name="region"
            render={({ field }) => (
              <div className="relative">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="region" className={field.value ? 'pr-16' : undefined}>
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTIST_REGION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.value && (
                  <button
                    type="button"
                    aria-label="지역 선택 안 함"
                    onClick={() => field.onChange('')}
                    className="absolute right-8 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-300 text-neutral-0"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            )}
          />
        </Field>
      </div>

      <div className="mt-auto px-4 py-2">
        <Button type="submit" size="lg" disabled={!isValid || isSubmitting} className="w-full">
          완료
        </Button>
      </div>
    </form>
  );
}
