'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().trim().min(1, '작품명을 입력해주세요'),
  description: z.string(),
});
type FormValues = z.infer<typeof schema>;

export function EditForm({
  id,
  title,
  description,
}: {
  id: number;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title, description },
  });

  const onValid = async (values: FormValues) => {
    const res = await fetch(`/app/api/artist/artworks?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: values.title.trim(), description: values.description }),
    });
    if (res.status === 401) {
      window.location.href = '/app/dev/login';
      return;
    }
    if (res.ok) {
      toast.success('저장되었습니다.');
      router.push('/app/artist/products');
      router.refresh();
    } else {
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(b.error || '수정에 실패했어요.');
    }
  };

  const field = 'w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2.5 text-body-5 text-neutral-950 outline-none focus:border-primary';
  const label = 'mb-1 block text-body-4 text-neutral-800';

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5 px-4 py-5" noValidate>
      <div>
        <label className={label} htmlFor="title">작품명</label>
        <input id="title" className={field} aria-invalid={!!errors.title} {...register('title')} />
        {errors.title && <p className="mt-1 text-caption-1 text-danger">{errors.title.message}</p>}
      </div>
      <div>
        <label className={label} htmlFor="description">설명</label>
        <textarea id="description" rows={5} className={field} placeholder="작품을 소개해주세요" {...register('description')} />
      </div>
      <p className="text-caption-2 text-neutral-500">가격·패키지·인원은 작품 등록 시 설정한 값을 따릅니다. 사진 변경은 추후 지원 예정이에요.</p>
      <button type="submit" disabled={isSubmitting} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-md bg-primary text-body-1 text-neutral-0 disabled:opacity-50">
        {isSubmitting ? '저장 중…' : '저장'}
      </button>
    </form>
  );
}
