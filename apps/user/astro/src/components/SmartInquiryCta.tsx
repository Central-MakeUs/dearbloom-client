import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  BottomButton,
  BottomButtonBar,
  BottomSheet,
  SaveHeart,
  bottomIconButtonClass,
  cn,
} from '@dearbloom/ui';

interface PackageOption {
  artworkPackageId: number;
  packageName: string;
}

interface SmartInquiryCtaProps {
  packages: PackageOption[];
  /** 저장(하트) — 헤더 버튼이 많아져 CTA 좌측으로 내려왔다. */
  artworkId: number;
  initialSaved?: boolean;
  /** 스마트 문의 플로우 진입 경로. 선택한 패키지 ID 를 쿼리로 붙인다. */
  inquiryHref?: string;
}

/**
 * 작품 상세 하단 sticky CTA — '스마트 문의하기'(island).
 * 패키지를 하나 고른 뒤 next 앱의 문의 플로우로 넘긴다. 로그인 여부는 이동한 페이지에서 판정한다.
 */
export function SmartInquiryCta({
  packages,
  artworkId,
  initialSaved = false,
  inquiryHref = '/app/inquiries/new',
}: SmartInquiryCtaProps) {
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [packageId, setPackageId] = useState('');

  const hasPackages = packages.length > 0;
  const selected = packages.find((p) => String(p.artworkPackageId) === packageId);

  function start() {
    if (!packageId) return;
    window.location.href = `${inquiryHref}?artworkPackageId=${packageId}`;
  }

  // 높이 = border 1 + padding 16 + 버튼 52 + padding 16 = 85(+safe-area).
  const trigger = (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-neutral-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md">
        <BottomButtonBar
          leading={
            <SaveHeart
              artworkId={artworkId}
              initialSaved={initialSaved}
              size={24}
              unsavedIconSrc="/images/save-heart-detail.svg"
              unsavedIconClassName="left-[2.1px] top-[3.64px] h-[17.76px] w-[19.8px]"
              savedIconSrc="/images/save-heart-selected.svg"
              savedIconClassName="left-[2.25px] top-[3.79px] h-[17.46px] w-[19.5px]"
              className={cn(bottomIconButtonClass, 'text-error')}
            />
          }
        >
          <BottomButton onClick={() => setOpen(true)} disabled={!hasPackages}>
            스마트 문의하기
          </BottomButton>
        </BottomButtonBar>
      </div>
    </div>
  );

  const sheetHeader = (
    <div className="relative flex h-[57px] items-center justify-center px-4">
      <h2 className="text-head-3 text-neutral-950">패키지 선택</h2>
      <button
        type="button"
        aria-label="닫기"
        onClick={() => setOpen(false)}
        className="absolute right-1 flex size-11 items-center justify-center"
      >
        <img
          src="/images/inquiry-package-close.svg"
          alt=""
          aria-hidden
          className="h-[13.8px] w-[13.8px]"
        />
      </button>
    </div>
  );

  /**
   * 시트 안에서 목록을 인라인으로 펼친다.
   * Radix Select 는 포털로 body 에 붙어서 바텀시트(z-70) 뒤로 가려지고, 시트가 화면 최하단이라
   * 아래로 펼쳐지며 뷰포트를 벗어난다. 접힌 모습만 드롭다운처럼 두고 목록은 시트 흐름 안에 둔다.
   */
  const packageField = (
    <div className="flex flex-col gap-2 px-4">
      <span className="text-body-4 text-neutral-950">패키지 옵션</span>

      <button
        type="button"
        aria-expanded={listOpen}
        onClick={() => setListOpen((v) => !v)}
        className="flex h-[56px] items-center justify-between rounded-md bg-neutral-100 pl-4 pr-1 text-body-2 text-neutral-950"
      >
        <span className={cn(!selected && 'text-neutral-500')}>{selected?.packageName ?? '선택 안 함'}</span>
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center transition-transform',
            listOpen && 'rotate-180',
          )}
          aria-hidden
        >
          <img
            src="/images/inquiry-package-arrow-down.svg"
            alt=""
            className="h-[4.833px] w-[8.167px]"
          />
        </span>
      </button>

      {listOpen && (
        <ul className="max-h-56 overflow-y-auto rounded-md bg-neutral-100">
          {packages.map((pkg) => {
            const isSelected = String(pkg.artworkPackageId) === packageId;
            return (
              <li key={pkg.artworkPackageId}>
                <button
                  type="button"
                  onClick={() => {
                    setPackageId(String(pkg.artworkPackageId));
                    setListOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left text-body-3',
                    isSelected ? 'font-semibold text-primary' : 'text-neutral-800',
                  )}
                >
                  {pkg.packageName}
                  {isSelected && <Check size={18} strokeWidth={2.5} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const sheet = (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setListOpen(false);
      }}
      title="패키지 선택"
      showHandle={false}
    >
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
