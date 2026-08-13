import { apiGet, apiPut, type RequestOptions } from './http';
import type { ArtworkListItem } from './artworks';

export interface SharedSavedArtwork {
  artworkSummaryResponse: ArtworkListItem;
  isShared: boolean;
  sharedBy: {
    customerId: number;
    sharedMemberName: string;
    profileColor: string;
  } | null;
}

export interface SharedArtworkUpdateResult {
  sharedBoardId: number;
  sharedBoardName: string;
  sharedArtworkList: { sharedArtworkId: number; title: string }[];
}

/** 공동보드 후보 선택용 내 저장 목록. 공유 중인 작품이 먼저 오며 isShared 를 포함한다. */
export function getSharedBoardSavedArtworks(
  sharedBoardId: number | string,
  opts: RequestOptions,
): Promise<SharedSavedArtwork[]> {
  return apiGet<SharedSavedArtwork[]>(
    `/api/shared-boards/${sharedBoardId}/saved-artworks`,
    opts,
  );
}

/** 이 보드에 내가 최종 공유할 작품 전체 목록을 교체한다. */
export function updateSharedBoardArtworks(
  sharedBoardId: number | string,
  artworkIdList: number[],
  opts: RequestOptions,
): Promise<SharedArtworkUpdateResult> {
  return apiPut<SharedArtworkUpdateResult>(
    `/api/shared-boards/${sharedBoardId}/artworks`,
    { artworkIdList },
    opts,
  );
}
