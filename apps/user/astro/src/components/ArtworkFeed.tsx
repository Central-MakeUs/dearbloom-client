import { useCallback, useEffect, useRef, useState } from 'react';
import { ArtworkCard } from '@dearbloom/ui';
import {
  ARTWORK_PAGE_SIZE,
  artistRegionLabel,
  type ArtworkListItem,
  type ArtworkPage,
} from '@dearbloom/shared';

interface Props {
  /** SSR 로 이미 그린 첫 페이지. 하이드레이션 후 이 상태에서 이어갑니다. */
  initialPage: ArtworkPage;
  /** 현재 필터·정렬 쿼리스트링('?region=SEOUL' 또는 ''). 다음 페이지 요청에 그대로 실립니다. */
  query: string;
  /** 한 줄에 놓을 카드 수. 격자 버튼으로 2 ↔ 3 을 오갑니다. */
  columns?: 2 | 3;
}

/**
 * 작품 피드 — SSR 첫 페이지 + 커서 무한스크롤.
 *
 * 필터/정렬이 바뀌면 URL 이 바뀌면서 페이지가 통째로 다시 그려지므로, 이 컴포넌트는
 * "고정된 필터 안에서 커서를 이어받는" 일만 합니다. 커서 도중에 조건이 바뀔 일이 없습니다.
 */
export function ArtworkFeed({ initialPage, query, columns = 2 }: Props) {
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

  const grid = (
    // 3열은 카드가 좁아 제목이 잘 넘치므로 열 간격만 줄인다(행 간격은 시안 20 유지).
    <div className={`grid gap-y-5 px-4 pb-6 ${columns === 3 ? 'grid-cols-3 gap-x-1.5' : 'grid-cols-2 gap-x-2'}`}>
      {items.map((a) => (
        <ArtworkCard
          key={a.artworkId}
          artworkId={a.artworkId}
          title={a.title}
          artistNickname={a.artistNickname}
          price={a.lowestPrice}
          thumbnailUrl={a.thumbnailUrl}
          regions={a.artistRegionList?.map(artistRegionLabel)}
          initialSaved={!!a.isSaved}
        />
      ))}
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
    <div ref={sentinelRef} className="pb-8 text-center text-body-6 text-neutral-500">
      불러오는 중…
    </div>
  ) : null;

  return (
    <>
      {grid}
      {footer}
    </>
  );
}
