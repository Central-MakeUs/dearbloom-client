import { Tabs, TabsList, TabsTrigger } from '@dearbloom/ui';

/**
 * 작품 상세 인페이지 탭 — 상세정보만 활성.
 * 리뷰 탭은 백엔드 리뷰 API 준비 전이라 잠시 숨김.
 * 컨텐츠는 SEO 위해 .astro 에서 SSR 되므로 여기선 탭 바만 담당.
 */
export function SnapDetailTabs() {
  return (
    <Tabs defaultValue="info" className="mt-3">
      <TabsList>
        <TabsTrigger value="info">상세정보</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
