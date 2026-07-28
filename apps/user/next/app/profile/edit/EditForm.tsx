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
import { customerNameSchema, REGION_OPTIONS } from '@dearbloom/shared';

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
    const body: { name: string; region?: string } = { name: values.name };
    if (values.region) body.region = values.region;
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
          helper="2-5자의 한글 또는 영문만 가능합니다"
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
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  {REGION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
