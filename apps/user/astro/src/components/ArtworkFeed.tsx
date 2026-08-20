import { useCallback, useEffect, useRef, useState } from 'react';
import { ArtworkCard, Spinner } from '@dearbloom/ui';
import { ArtworkListRow } from './ArtworkListRow';
import { optimizedImageUrl } from '@/lib/imageUrl';
import {
  ARTWORK_PAGE_SIZE,
  artistRegionLabel,
  type ArtistRegionCode,
  type ArtworkListItem,
  type ArtworkPage,
} from '@dearbloom/shared';
import { summarizeExploreRegions } from '@/lib/artistRegion';

interface Props {
  /** SSR 로 이미 그린 첫 페이지. 하이드레이션 후 이 상태에서 이어갑니다. */
  initialPage: ArtworkPage;
  /** 현재 필터·정렬 쿼리스트링('?region=SEOUL' 또는 ''). 다음 페이지 요청에 그대로 실립니다. */
  query: string;
  /** 선택 지역. 응답에 실제 포함된 경우에만 지역 칩 첫 번째로 보입니다. */
  selectedRegion?: ArtistRegionCode;
  /** 보기 방식. 격자 버튼으로 grid(2열 카드) ↔ list(작품별 사진 가로 스크롤)를 오갑니다. */
  view?: 'grid' | 'list';
}

/**
 * 작품 피드 — SSR 첫 페이지 + 커서 무한스크롤.
 *
 * 필터/정렬이 바뀌면 URL 이 바뀌면서 페이지가 통째로 다시 그려지므로, 이 컴포넌트는
 * "고정된 필터 안에서 커서를 이어받는" 일만 합니다. 커서 도중에 조건이 바뀔 일이 없습니다.
 */
export function ArtworkFeed({ initialPage, query, selectedRegion, view = 'grid' }: Props) {
  const [items, setItems] = useState<ArtworkListItem[]>(initialPage.artworkList);
  const [cursor, setCursor] = useState<string | null>(initialPage.nextCursor);
  const [hasNext, setHasNext] = useState(initialPage.hasNext);
  const [failed, setFailed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // 관찰자가 연달아 발화해도 요청은 한 번만 나가게 하는 잠금. 렌더와 무관하므로 ref.
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasNext || !cursor) return;
    loadingRef.current = true;
    setFailed(false);

    try {
      const qs = new URLSearchParams(query);
      qs.set('cursor', cursor);
      qs.set('size', String(ARTWORK_PAGE_SIZE.DEFAULT));

      const res = await fetch(`/api/artworks?${qs}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const page: ArtworkPage = await res.json();

      setItems((prev) => [...prev, ...page.artworkList]);
      setCursor(page.nextCursor);
      setHasNext(page.hasNext);
    } catch (e) {
      console.error('[ArtworkFeed] 다음 페이지 로드 실패', e);
      // hasNext 는 유지 — 재시도 버튼으로 같은 커서를 다시 시도할 수 있게 둡니다.
      setFailed(true);
    } finally {
      loadingRef.current = false;
    }
  }, [cursor, hasNext, query]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNext || failed) return;

    // rootMargin 으로 화면에 닿기 전에 미리 받아, 스크롤이 빈 화면에 닿지 않게 합니다.
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && void loadMore(), {
      rootMargin: '400px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasNext, failed]);

  const list = (
    // 아이템 간 20(시안). 사진 스트립이 화면 끝까지 흐르도록 좌우 패딩은 각 행이 처리한다.
    <div className="flex flex-col gap-5 px-4 pb-6">
      {items.map((a) => (
        <ArtworkListRow key={a.artworkId} artwork={a} selectedRegion={selectedRegion} />
      ))}
    </div>
  );

  // 카드 폭 = (컨테이너 max-w-md 448 - 좌우 패딩 32 - 열 간격 8) / 2 ≈ 204
  const CARD_WIDTH = 204;

  const grid = (
    <div className="grid grid-cols-2 gap-x-2 gap-y-5 px-4 pb-6">
      {items.map((a) => {
        const { shownRegions, hiddenRegionCount } = summarizeExploreRegions(a.artistRegionList, selectedRegion);

        return (
          <ArtworkCard
            key={a.artworkId}
            artworkId={a.artworkId}
            title={a.title}
            artistNickname={a.artistNickname}
            price={a.lowestPrice}
            thumbnailUrl={optimizedImageUrl(a.thumbnailUrl, CARD_WIDTH)}
            regions={shownRegions.map(artistRegionLabel)}
            regionOverflowCount={hiddenRegionCount}
            initialSaved={!!a.isSaved}
            unsavedHeartIconSrc="/images/save-heart-grid.svg"
            unsavedHeartIconClassName="left-[2.25px] top-[3.79px] h-[17.46px] w-[19.5px]"
            savedHeartIconSrc="/images/save-heart-selected.svg"
            savedHeartIconClassName="left-[2.25px] top-[3.79px] h-[17.46px] w-[19.5px]"
          />
        );
      })}
    </div>
  );

  const footer = failed ? (
    <div className="px-4 pb-8 text-center">
      <p className="text-body-6 text-neutral-600">작품을 더 불러오지 못했어요.</p>
      <button
        type="button"
        onClick={() => void loadMore()}
        className="mt-2 rounded-md border border-neutral-400 px-4 py-2 text-body-5 text-neutral-800"
      >
        다시 시도
      </button>
    </div>
  ) : hasNext ? (
    <div ref={sentinelRef} className="flex justify-center pb-8">
      <Spinner label="작품을 더 불러오는 중" />
    </div>
  ) : null;

  return (
    <>
      {view === 'list' ? list : grid}
      {footer}
    </>
  );
}
