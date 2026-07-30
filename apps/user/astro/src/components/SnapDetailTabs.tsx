import { Tabs, TabsList, TabsTrigger } from '@dearbloom/ui';

/**
 * 작품 상세 인페이지 탭 — 상세정보 / 리뷰.
 * 컨텐츠는 SEO 위해 .astro 에서 SSR 되므로 여기선 탭 바만 담당.
 * 리뷰 콘텐츠 스위칭은 백엔드 리뷰 API 준비 후 별도 처리.
 */
export function SnapDetailTabs() {
  return (
    <Tabs defaultValue="info" className="mt-3">
      <TabsList>
        <TabsTrigger value="info" className="text-head-3">
          상세정보
        </TabsTrigger>
        <TabsTrigger value="review" className="text-head-3">
          리뷰
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
