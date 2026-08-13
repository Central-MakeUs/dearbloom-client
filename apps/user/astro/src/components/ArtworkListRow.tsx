import { RegionTag, SaveHeart, SkeletonImage } from '@dearbloom/ui';
import { artistRegionLabel, type ArtworkListItem } from '@dearbloom/shared';
import { optimizedImageUrl } from '@/lib/imageUrl';

interface Props {
  artwork: ArtworkListItem;
}

const formatPrice = (won: number) => `${Math.round(won / 10000).toLocaleString()}만원`;

/**
 * 리스트뷰 한 줄 — Figma 1060:16189 실측.
 * 사진 120x150 을 가로로 죽 늘어놓고(스크롤), 그 아래 `제목 │ 가격` / `작가명 + 지역` 을 붙인다.
 * 그리드뷰(ArtworkCard)와 달리 한 작품의 사진을 여러 장 보여주는 게 목적이다.
 */
export function ArtworkListRow({ artwork }: Props) {
  const href = `/snaps/${artwork.artworkId}`;
  // photoList 가 아직 없는 응답(구버전 백엔드)이면 대표 이미지 한 장으로라도 채운다.
  const photos = artwork.photoList?.length ? artwork.photoList : [artwork.thumbnailUrl];

  const photoStrip = (
    // 가로 스크롤이 화면 끝까지 이어지도록 좌우 패딩을 음수 마진으로 되돌린 뒤 안쪽에서 다시 준다.
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {photos.map((url, i) => (
        <a key={`${url}-${i}`} href={href} className="shrink-0">
          <SkeletonImage
            src={optimizedImageUrl(url, 120)}
            alt={i === 0 ? artwork.title : ''}
            loading="lazy"
            className="h-[150px] w-[120px] rounded-md"
          />
        </a>
      ))}
    </div>
  );

  const meta = (
    <div className="flex items-center justify-between pl-1">
      <a href={href} className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-body-3 text-neutral-900">{artwork.title}</span>
          <span className="h-[11px] w-px shrink-0 bg-neutral-600" aria-hidden />
          <span className="shrink-0 text-body-3 text-primary">{formatPrice(artwork.lowestPrice)}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="truncate text-body-6 text-neutral-900">{artwork.artistNickname}</span>
          {!!artwork.artistRegionList?.length && (
            <span className="flex shrink-0 items-center gap-1">
              {artwork.artistRegionList.map((r) => (
                <RegionTag key={r}>{artistRegionLabel(r)}</RegionTag>
              ))}
            </span>
          )}
        </span>
      </a>
      <SaveHeart
        artworkId={artwork.artworkId}
        initialSaved={!!artwork.isSaved}
        size={24}
        strokeWidth={1.8}
        className="flex h-12 w-12 shrink-0 items-center justify-center text-error transition-transform active:scale-90"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {photoStrip}
      {meta}
    </div>
  );
}
