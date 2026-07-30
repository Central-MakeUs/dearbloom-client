import { Tabs, TabsList, TabsTrigger } from '@dearbloom/ui';

/**
 * 작품 상세 인페이지 탭 — 작품정보 / 리뷰(준비중).
 * 작품정보 콘텐츠는 SEO 위해 .astro 에서 서버 렌더되므로 여기선 탭 바만 담당한다.
 * 리뷰 탭은 백엔드 준비 전이라 출시 전 숨김 — 백엔드 준비 후 아래 TabsTrigger 주석 해제로 복구.
 */
export function SnapDetailTabs() {
  return (
    <Tabs defaultValue="info" className="mt-3">
      <TabsList>
        <TabsTrigger value="info" className="text-head-3">
          작품정보
        </TabsTrigger>
        {/*
        <TabsTrigger value="review" disabled title="준비 중" className="cursor-not-allowed">
          리뷰 <span className="text-caption-2">(준비중)</span>
        </TabsTrigger>
        */}
      </TabsList>
    </Tabs>
  );
}
