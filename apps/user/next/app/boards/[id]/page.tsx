'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Heart, MessageCircleMore, MoreHorizontal, UserRound } from 'lucide-react';
import {
  Header,
  Button,
  Badge,
  BottomButton,
  BottomButtonBar,
  ShareButton,
  Input,
  BottomSheet,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  RegionTag,
} from '@dearbloom/ui';
import type {
  SharedArtwork,
  SharedBoardPage,
  SharedBoardSummary,
  SharedComment,
} from '@dearbloom/shared';
import { artistRegionLabel } from '@dearbloom/shared';
import { useHydrated } from '@/src/lib/useHydrated';
import { showCandidateToast } from './CandidateToast';
import { ShareBoardSheet } from './ShareBoardSheet';

const formatPrice = (won: number) => `${Math.round(won / 10000).toLocaleString()}만원`;
const artworkHref = (artworkId: number, boardId: number) =>
  `/snaps/${artworkId}?returnTo=${encodeURIComponent(`/app/boards/${boardId}`)}`;

type BoardDetail = SharedBoardSummary &
  SharedBoardPage & { comments: SharedComment[]; hasMySharedArtworks: boolean; isOwner: boolean };

export default function BoardDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const candidateUpdated = searchParams.get('candidateUpdated') === '1';
  const boardRenamed = searchParams.get('boardRenamed') === '1';

  const [board, setBoard] = useState<BoardDetail>();
  const [loading, setLoading] = useState(true);

  const [manageOpen, setManageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/app/api/boards/${id}`)
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = `/app/login?returnUrl=${encodeURIComponent(`/app/boards/${id}`)}`;
          return undefined;
        }
        if (!response.ok) throw new Error('공동보드 조회 실패');
        return response.json() as Promise<BoardDetail>;
      })
      .then((data) => {
        if (active && data) setBoard(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!candidateUpdated) return;
    showCandidateToast('내 후보가 수정되었어요', 'success');
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, [candidateUpdated]);

  useEffect(() => {
    if (!boardRenamed) return;
    showCandidateToast('보드 이름이 변경되었어요', 'success');
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, [boardRenamed]);

  if (!hydrated || loading) {
    return <div className="board-detail-background min-h-dvh bg-neutral-100" />;
  }

  if (!board) {
    return (
      <div className="board-detail-background mx-auto flex min-h-dvh max-w-md flex-col bg-neutral-100">
        <Header showBack onBack={() => router.replace('/saved?tab=board')} title="공동보드" />
        <p className="px-6 py-24 text-center text-body-4 text-neutral-500">
          보드를 찾을 수 없어요.
        </p>
      </div>
    );
  }

  const messageButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setCommentsOpen(true)}
      aria-label="댓글"
      className="h-11 w-11 text-neutral-800"
    >
      <MessageCircleMore className="size-6" strokeWidth={1.5} />
    </Button>
  );

  const menuButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="공동보드 관리"
      className="h-11 w-11 text-neutral-950"
      onClick={() => setManageOpen(true)}
    >
      <MoreHorizontal className="size-6" />
    </Button>
  );

  const headerActions = (
    <div className="flex">
      {messageButton}
      {menuButton}
    </div>
  );

  const members = (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 text-body-1 text-neutral-800">
        <UserRound className="size-4" fill="currentColor" aria-hidden />
        <span className="font-semibold">
          멤버 <span className="text-primary">{board.sharedMemberCount}</span>
        </span>
      </div>
      {board.sharedMemberList.map((member) => (
        <span
          key={member.customerId}
          className="rounded-md bg-neutral-200 px-3 py-1.5 text-body-5 text-neutral-800"
        >
          {member.sharedMemberName}
        </span>
      ))}
    </div>
  );

  const emptyBody = (
    <div className="flex min-h-[calc(100dvh-220px)] flex-col items-center justify-center gap-1 px-6 pb-16 text-center">
      <p className="text-body-1 text-neutral-950">공동보드가 생성되었어요</p>
      <div className="max-w-[190px] text-body-5 text-neutral-800">
        <p>친구에게 공동보드를 공유하고</p>
        <p>작품 후보를 추가해 보세요.</p>
      </div>
    </div>
  );

  const grid = (
    <div className="grid grid-cols-2 gap-x-2 gap-y-5 px-4 pb-28 pt-3">
      {board.sharedArtworkList.map((artwork: SharedArtwork) => (
        <div key={artwork.sharedArtworkId} className="flex flex-col">
          <div className="relative mb-2 aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
            <a
              href={artworkHref(artwork.artworkId, board.sharedBoardId)}
              className="block h-full w-full"
            >
              {artwork.thumbnailUrl ? (
                <img
                  src={artwork.thumbnailUrl}
                  alt={artwork.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary-100 to-primary-300" />
              )}
            </a>
            <span
              aria-hidden
              className="absolute bottom-[9px] right-[9px] flex size-9 items-center justify-center rounded-full bg-neutral-950/30 text-neutral-0"
            >
              <Heart
                className="size-6"
                fill={artwork.isLiked ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </span>
          </div>
          <a href={artworkHref(artwork.artworkId, board.sharedBoardId)} className="block">
            <div className="truncate text-body-3 text-neutral-900">{artwork.title}</div>
            <div className="truncate text-body-6 text-neutral-900">{artwork.artistNickname}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-body-3 text-primary">{formatPrice(artwork.lowestPrice)}</span>
              <div className="flex flex-wrap items-center gap-1">
                {artwork.artistRegionList.map((region) => (
                  <RegionTag key={region}>{artistRegionLabel(region)}</RegionTag>
                ))}
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

  const addBar = (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md bg-neutral-100 px-4 pb-6 pt-2">
      <BottomButtonBar leading={<ShareButton onClick={() => setShareOpen(true)} />}>
        <BottomButton
          color={board.hasMySharedArtworks ? 'black' : 'green'}
          onClick={() => router.push(`/boards/${board.sharedBoardId}/add`)}
        >
          {board.hasMySharedArtworks ? '내 후보 수정하기' : '내 후보 추가하기'}
        </BottomButton>
      </BottomButtonBar>
    </div>
  );

  const commentSheet = (
    <BottomSheet open={commentsOpen} onOpenChange={setCommentsOpen} title="댓글 목록">
      <div className="flex max-h-[70vh] flex-col px-5 pb-2 pt-1">
        <p className="mb-3 text-body-2 text-neutral-950">댓글 목록</p>
        <ul className="flex-1 space-y-4 overflow-y-auto">
          {board.comments.length === 0 ? (
            <li className="py-10 text-center text-body-4 text-neutral-400">아직 댓글이 없어요.</li>
          ) : (
            board.comments.map((comment) => (
              <li key={comment.sharedCommentId}>
                <Badge className="mb-1">{comment.sharedMemberName}</Badge>
                <p className="text-body-4 text-neutral-950">{comment.content}</p>
              </li>
            ))
          )}
        </ul>
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 남겨보세요"
            className="flex-1 rounded-full"
          />
          <Button
            type="button"
            disabled={!commentText.trim()}
            onClick={async () => {
              const response = await fetch(`/app/api/boards/${board.sharedBoardId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentText }),
              });
              if (!response.ok) return;
              const comments = (await response.json()) as SharedComment[];
              setBoard((current) => (current ? { ...current, comments } : current));
              setCommentText('');
            }}
            className="shrink-0 rounded-full"
          >
            작성
          </Button>
        </div>
      </div>
    </BottomSheet>
  );

  const managementSheet = (
    <BottomSheet open={manageOpen} onOpenChange={setManageOpen} title="공동보드 관리">
      <h2 className="px-5 pb-4 pt-2 text-head-2 text-neutral-950 text-center">공동보드 관리</h2>

      <div className="flex flex-col px-5">
        {board.isOwner ? (
          <>
            <button
              type="button"
              className="h-14 border-b border-neutral-200 text-left text-body-2 text-neutral-950"
              onClick={() => router.push(`/boards/${board.sharedBoardId}/edit-name`)}
            >
              보드 이름 변경하기
            </button>
            {/* <button
              type="button"
              disabled
              className="h-14 border-b border-neutral-200 text-left text-body-2 text-neutral-950"
            >
              <span className="text-neutral-400">멤버 편집하기 (준비 중)</span>
            </button> */}
            <button
              type="button"
              className="h-14 text-left text-body-2 text-neutral-950"
              onClick={() => {
                setManageOpen(false);
                setDeleteOpen(true);
              }}
            >
              보드 삭제하기
            </button>
          </>
        ) : (
          <button
            type="button"
            className="h-14 text-left text-body-2 text-neutral-950"
            onClick={() => {
              setManageOpen(false);
              setLeaveOpen(true);
            }}
          >
            보드 나가기
          </button>
        )}
      </div>
    </BottomSheet>
  );

  const deleteModal = (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent className="w-[303px] max-w-[calc(100%-2.5rem)] gap-0 rounded-md border-0 p-4">
        <AlertDialogHeader className="gap-2 pb-6 pt-3 text-center sm:text-center">
          <AlertDialogTitle>보드 삭제하기</AlertDialogTitle>
          <AlertDialogDescription className="text-body-6 text-neutral-800">
            보드를 삭제하면 모든 작품 후보와
            <br />
            활동 기록이 함께 삭제되며 복구할 수 없어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-center gap-2 sm:justify-center">
          <AlertDialogCancel className="h-12 w-[130px] flex-none rounded-[6px] border-0 bg-neutral-200 text-body-1 text-neutral-800 hover:bg-neutral-300">
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-12 w-[130px] flex-none rounded-[6px] text-body-1"
            onClick={async (event) => {
              event.preventDefault();
              const response = await fetch(`/app/api/boards/${board.sharedBoardId}`, {
                method: 'DELETE',
              });
              if (!response.ok) return;
              showCandidateToast('보드가 삭제되었어요', 'success');
              router.replace('/saved?tab=board');
            }}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const leaveModal = (
    <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
      <AlertDialogContent className="max-w-[300px] gap-0 border-0 p-4">
        <AlertDialogHeader className="gap-2 pb-6 pt-3 text-center sm:text-center">
          <AlertDialogTitle>보드 나가기</AlertDialogTitle>
          <AlertDialogDescription className="text-body-6 text-neutral-800">
            보드에서 나가면 이후에는 이곳에서의
            <br />
            활동 기록을 볼 수 없어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="h-12 flex-1 border-0 bg-neutral-200 text-body-1 text-neutral-800 hover:bg-neutral-300">
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-12 flex-1 text-body-1"
            onClick={async (event) => {
              event.preventDefault();
              const response = await fetch(`/app/api/boards/${board.sharedBoardId}/members/me`, {
                method: 'DELETE',
              });
              if (!response.ok) return;
              showCandidateToast('공동보드에서 나갔어요', 'success');
              router.replace('/saved?tab=board');
            }}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const shareSheet = (
    <ShareBoardSheet
      boardId={board.sharedBoardId}
      boardName={board.sharedBoardName}
      open={shareOpen}
      onOpenChange={setShareOpen}
    />
  );

  return (
    <div className="board-detail-background relative mx-auto min-h-dvh max-w-md bg-neutral-100">
      <Header
        showBack
        onBack={() => router.replace('/saved?tab=board')}
        title={board.sharedBoardName}
        right={headerActions}
      />
      {members}
      {board.sharedArtworkCount === 0 ? emptyBody : grid}
      {addBar}
      {commentSheet}
      {managementSheet}
      {deleteModal}
      {leaveModal}
      {shareSheet}
    </div>
  );
}
