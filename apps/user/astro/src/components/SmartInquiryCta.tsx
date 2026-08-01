import { useState } from 'react';
import { X } from 'lucide-react';
import {
  BottomButton,
  BottomSheet,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dearbloom/ui';

interface PackageOption {
  artworkPackageId: number;
  packageName: string;
}

interface SmartInquiryCtaProps {
  packages: PackageOption[];
  /** 스마트 문의 플로우 진입 경로. 선택한 패키지 ID 를 쿼리로 붙인다. */
  inquiryHref?: string;
}

/**
 * 작품 상세 하단 sticky CTA — '스마트 문의하기'(island).
 * 패키지를 하나 고른 뒤 next 앱의 문의 플로우로 넘긴다. 로그인 여부는 이동한 페이지에서 판정한다.
 */
export function SmartInquiryCta({ packages, inquiryHref = '/app/inquiries/new' }: SmartInquiryCtaProps) {
  const [open, setOpen] = useState(false);
  const [packageId, setPackageId] = useState('');

  const hasPackages = packages.length > 0;

  function start() {
    if (!packageId) return;
    window.location.href = `${inquiryHref}?artworkPackageId=${packageId}`;
  }

  const trigger = (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-neutral-0 p-4">
      <div className="mx-auto max-w-md">
        <BottomButton onClick={() => setOpen(true)} disabled={!hasPackages}>
          스마트 문의하기
        </BottomButton>
      </div>
    </div>
  );

  const sheetHeader = (
    <div className="relative flex items-center justify-center px-4 pb-4">
      <h2 className="text-head-3 text-neutral-950">패키지 선택</h2>
      <button
        type="button"
        aria-label="닫기"
        onClick={() => setOpen(false)}
        className="absolute right-4 flex h-8 w-8 items-center justify-center text-neutral-950"
      >
        <X size={24} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );

  const packageField = (
    <div className="flex flex-col gap-2 px-4">
      <span className="text-body-4 text-neutral-950">패키지 옵션</span>
      <Select value={packageId} onValueChange={setPackageId}>
        <SelectTrigger className="h-[56px] rounded-md border-0 bg-neutral-100 px-4 text-body-3 text-neutral-950">
          <SelectValue placeholder="선택 안 함" />
        </SelectTrigger>
        <SelectContent>
          {packages.map((pkg) => (
            <SelectItem key={pkg.artworkPackageId} value={String(pkg.artworkPackageId)}>
              {pkg.packageName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const sheet = (
    <BottomSheet open={open} onOpenChange={setOpen} title="패키지 선택">
      {sheetHeader}
      {packageField}
      <div className="mt-6 px-4">
        <BottomButton onClick={start} disabled={!packageId}>
          스마트 문의하기
        </BottomButton>
      </div>
    </BottomSheet>
  );

  return (
    <>
      {trigger}
      {sheet}
    </>
  );
}
