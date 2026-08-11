import { apiDelete, apiGet, apiPatch, apiPost, type RequestOptions } from './http';
import type { ArtistRegionCode } from './regions';

export interface SharedBoardSummary {
  sharedBoardId: number;
  sharedBoardName: string;
  sharedArtworkCount: number;
  thumbnailUrlList: string[];
}

export interface SharedBoard {
  sharedBoardId: number;
  ownerId: number;
  sharedBoardName: string;
}

export interface SharedMember {
  customerId: number;
  sharedMemberName: string;
  profileColor: string;
}

export interface SharedArtwork {
  sharedArtworkId: number;
  artworkId: number;
  title: string;
  lowestPrice: number;
  minHeadCount: number;
  maxHeadCount: number | null;
  artistNickname: string;
  artistRegionList: ArtistRegionCode[];
  thumbnailUrl: string;
  isLiked: boolean;
}

export interface SharedBoardPage {
  sharedMemberCount: number;
  sharedMemberList: SharedMember[];
  sharedArtworkList: SharedArtwork[];
  sharedArtworkCount: number;
}

export interface SharedBoardInvite {
  sharedBoardId: number;
  boardName: string;
  ownerName: string;
  memberCount: number;
  alreadyJoined: boolean;
}

export interface SharedBoardJoinResult {
  customerId: number;
  sharedBoardId: number;
  sharedBoardName: string;
}

export interface SharedBoardInviteCode {
  sharedBoardId: number;
  inviteCode: string;
}

export interface SharedComment {
  sharedCommentId: number;
  sharedMemberName: string;
  content: string;
  createdAt: string;
}

export const getSharedBoards = (opts: RequestOptions) =>
  apiGet<SharedBoardSummary[]>('/api/shared-boards', opts);

export const createSharedBoard = (sharedBoardName: string, opts: RequestOptions) =>
  apiPost<SharedBoard>('/api/shared-boards', { sharedBoardName }, opts);

export const updateSharedBoardName = (
  sharedBoardId: number | string,
  sharedBoardName: string,
  opts: RequestOptions,
) => apiPatch<SharedBoard>(`/api/shared-boards/${sharedBoardId}`, { sharedBoardName }, opts);

export const deleteSharedBoard = (sharedBoardId: number | string, opts: RequestOptions) =>
  apiDelete<SharedBoard>(`/api/shared-boards/${sharedBoardId}`, undefined, opts);

export const leaveSharedBoard = (sharedBoardId: number | string, opts: RequestOptions) =>
  apiDelete<void>(`/api/shared-boards/${sharedBoardId}/members/me`, undefined, opts);

export const getSharedBoardPage = (sharedBoardId: number | string, opts: RequestOptions) =>
  apiGet<SharedBoardPage>(`/api/shared-boards/${sharedBoardId}/artworks`, opts);

export const getSharedBoardInvite = (inviteCode: string, opts?: RequestOptions) =>
  apiGet<SharedBoardInvite>(`/api/shared-boards/invite/${encodeURIComponent(inviteCode)}`, opts);

export const getSharedBoardInviteCode = (sharedBoardId: number | string, opts: RequestOptions) =>
  apiGet<SharedBoardInviteCode>(`/api/shared-boards/${sharedBoardId}/invite-code`, opts);

export const joinSharedBoard = (inviteCode: string, opts: RequestOptions) =>
  apiPost<SharedBoardJoinResult>(
    `/api/shared-boards/invite/${encodeURIComponent(inviteCode)}/members`,
    undefined,
    opts,
  );

export const getSharedComments = (sharedBoardId: number | string, opts: RequestOptions) =>
  apiGet<SharedComment[]>(`/api/shared-boards/${sharedBoardId}/comments`, opts);

export const createSharedComment = (
  sharedBoardId: number | string,
  content: string,
  opts: RequestOptions,
) => apiPost<string>(`/api/shared-boards/${sharedBoardId}/comments`, { content }, opts);
