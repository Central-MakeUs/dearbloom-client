'use client';

import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  Input,
  NumberField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dearbloom/ui';
import type { ArtworkPackage, ArtworkPackageInput } from '@dearbloom/shared';

// 촬영 시간: 30분 단위(30분 ~ 6시간) — 백엔드는 임의 정수(분)를 받으나 UX상 30분 단위로 고정
const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

export const PKG_MSG = '각 패키지의 이름·가격·촬영 시간·보정본 수를 입력하세요.';

/** NumberField/Select 는 값이 number | '' 이므로, '' 이거나 임계값 이하이면 실패 처리. */
export const requiredNumber = (message: string, gt = 0) =>
  z.union([z.literal(''), z.number()]).refine((v) => typeof v === 'number' && v > gt, { message });

/** 폼 위의 패키지 1건. id 는 React key 전용이라 전송 시 제외한다. */
export const packageSchema = z.object({
  id: z.string(),
  packageName: z.string().trim().min(1, PKG_MSG),
  price: requiredNumber(PKG_MSG),
  durationMinutes: requiredNumber(PKG_MSG),
  finalPhotoCount: requiredNumber(PKG_MSG),
  extraInfo: z.string(),
});
export type PackageItem = z.infer<typeof packageSchema>;

/** react-hook-form 의 패키지 1건 에러 → 카드 하단에 띄울 메시지 1개로 축약. */
type PackageItemError = Partial<Record<keyof PackageItem, { message?: string } | undefined>>;
export function packageErrorMessage(e: PackageItemError | undefined): string | undefined {
  return (
    e?.packageName?.message || e?.price?.message || e?.durationMinutes?.message || e?.finalPhotoCount?.message
  );
}

let idCounter = 0;
const nextId = () => `pkg${(idCounter += 1)}`;

export const emptyPackage = (): PackageItem => ({
  id: nextId(),
  packageName: '',
  price: '',
  durationMinutes: '',
  finalPhotoCount: '',
  extraInfo: '',
});

/** 서버 응답(작품 상세)의 패키지를 폼 값으로. 미정(null)인 항목은 빈 값으로 둔다. */
export function packageFromServer(p: ArtworkPackage): PackageItem {
  return {
    id: nextId(),
    packageName: p.packageName,
    price: p.price,
    durationMinutes: p.durationMinutes ?? '',
    finalPhotoCount: p.finalPhotoCount ?? '',
    extraInfo: p.extraInfo ?? '',
  };
}

/** 폼 값 → 등록/교체 API payload. 빈 문자열은 null 로 보낸다. */
export function toPackagePayload(items: PackageItem[]): ArtworkPackageInput[] {
  return items.map((p) => ({
    packageName: p.packageName.trim(),
    price: Number(p.price),
    durationMinutes: p.durationMinutes === '' ? null : Number(p.durationMinutes),
    finalPhotoCount: p.finalPhotoCount === '' ? null : Number(p.finalPhotoCount),
    extraInfo: p.extraInfo.trim() || null,
  }));
}

/** 작품 등록·수정 공용: 패키지 추가/삭제 + 각 패키지의 이름·가격·촬영 시간·보정본 수·추가 정보 입력.
 *  errors[idx] 는 해당 패키지 카드 하단에 표시할 메시지. */
export function PackageListField({
  value,
  onChange,
  errors,
}: {
  value: PackageItem[];
  onChange: (packages: PackageItem[]) => void;
  errors?: (string | undefined)[];
}) {
  const patch = (idx: number, next: Partial<PackageItem>) =>
    onChange(value.map((p, i) => (i === idx ? { ...p, ...next } : p)));
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-body-4 text-neutral-800">촬영 구성 (패키지)</span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0"
          onClick={() => onChange([...value, emptyPackage()])}
        >
          <Plus className="size-4" /> 패키지 추가
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {value.map((p, idx) => (
          <Card key={p.id} className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-body-6 text-neutral-600">패키지 {idx + 1}</span>
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-neutral-400 hover:text-danger"
                  aria-label="패키지 삭제"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Input
                value={p.packageName}
                onChange={(e) => patch(idx, { packageName: e.target.value })}
                placeholder="패키지명 (예: 기본)"
                aria-label="패키지명"
              />
              <div className="flex gap-2">
                <NumberField
                  className="flex-1"
                  value={p.price}
                  onValueChange={(v) => patch(idx, { price: v })}
                  min={0}
                  step={10000}
                  placeholder="가격"
                  suffix="원"
                  aria-label="가격"
                />
                <Select
                  value={p.durationMinutes === '' ? undefined : String(p.durationMinutes)}
                  onValueChange={(v) => patch(idx, { durationMinutes: Number(v) })}
                >
                  <SelectTrigger aria-label="촬영 시간" className="flex-1">
                    <SelectValue placeholder="촬영 시간" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {fmtDuration(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <NumberField
                value={p.finalPhotoCount}
                onValueChange={(v) => patch(idx, { finalPhotoCount: v })}
                min={1}
                placeholder="보정본 수"
                suffix="장"
                aria-label="보정본 수"
              />
              <Input
                value={p.extraInfo}
                onChange={(e) => patch(idx, { extraInfo: e.target.value })}
                placeholder="추가 정보 (선택) — 예: 의상 대여 포함"
                aria-label="추가 정보"
              />
            </div>
            {errors?.[idx] && <p className="mt-2 text-caption-1 text-danger">{errors[idx]}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
