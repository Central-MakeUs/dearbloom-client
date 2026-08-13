'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MoreHorizontal, UserRound } from 'lucide-react';
import {
  Header,
  Button,
  Badge,
  BottomButton,
  BottomButtonBar,
  ShareButton,
  BottomSheet,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  RegionTag,
  SkeletonImage,
  cn,
} from '@dearbloom/ui';
import type {
  SharedArtwork,
  SharedBoardPage,
  SharedBoardSummary,
  SharedComment,
} from '@dearbloom/shared';
import { artistRegionLabel } from '@dearbloom/shared';
import { useHydrated } from '@/src/lib/useHydrated';
import { getNextSharedArtworkLike, getRankedSharedArtworks } from '@/src/lib/sharedArtworkLike';
import { formatSharedCommentTime, sortSharedCommentsNewestFirst } from '@/src/lib/sharedComments';
import { showCandidateToast } from './CandidateToast';
import { ShareBoardSheet } from './ShareBoardSheet';
import { SharedLikeIcon } from './SharedLikeIcon';

const formatPrice = (won: number) => `${Math.round(won / 10000).toLocaleString()}만원`;
const artworkHref = (artworkId: number, boardId: number) =>
  `/snaps/${artworkId}?returnTo=${encodeURIComponent(`/app/boards/${boardId}`)}`;

type BoardDetail = SharedBoardSummary &
  SharedBoardPage & {
    comments: SharedComment[];
    hasMySharedArtworks: boolean;
    isOwner: boolean;
  };

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
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<number>();
  const [commentDeleting, setCommentDeleting] = useState(false);
  const likingArtworkIds = useRef(new Set<number>());

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

  const openComments = async () => {
    setCommentsOpen(true);
    setBoard((current) => (current ? { ...current, unreadCommentCount: 0 } : current));
    const [commentsResponse] = await Promise.all([
      fetch(`/app/api/boards/${board.sharedBoardId}/comments`),
      fetch(`/app/api/boards/${board.sharedBoardId}/comments/read`, { method: 'POST' }),
    ]);
    if (commentsResponse.ok) {
      const comments = (await commentsResponse.json()) as BoardDetail['comments'];
      setBoard((current) => (current ? { ...current, comments } : current));
    }
  };

  const submitComment = async () => {
    const content = commentText.trim();
    if (!content || commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      const response = await fetch(`/app/api/boards/${board.sharedBoardId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        const comments = (await response.json()) as BoardDetail['comments'];
        setBoard((current) => (current ? { ...current, comments } : current));
        setCommentText('');
      }
    } finally {
      setCommentSubmitting(false);
    }
  };

  const toggleArtworkLike = async (artwork: SharedArtwork) => {
    if (likingArtworkIds.current.has(artwork.sharedArtworkId)) return;
    likingArtworkIds.current.add(artwork.sharedArtworkId);

    const currentLikeCount = artwork.likeCount;
    const { isLiked: nextIsLiked, likeCount: nextLikeCount } = getNextSharedArtworkLike(
      artwork.isLiked,
      currentLikeCount,
    );
    const updateArtwork = (isLiked: boolean, likeCount: number) =>
      setBoard((current) =>
        current
          ? {
              ...current,
              sharedArtworkList: current.sharedArtworkList.map((item) =>
                item.sharedArtworkId === artwork.sharedArtworkId
                  ? { ...item, isLiked, likeCount }
                  : item,
              ),
            }
          : current,
      );

    updateArtwork(nextIsLiked, nextLikeCount);
    try {
      const response = await fetch(
        `/app/api/boards/${board.sharedBoardId}/artworks/${artwork.sharedArtworkId}/likes`,
        { method: nextIsLiked ? 'POST' : 'DELETE' },
      );
      if (!response.ok) updateArtwork(artwork.isLiked, currentLikeCount);
    } catch {
      updateArtwork(artwork.isLiked, currentLikeCount);
    } finally {
      likingArtworkIds.current.delete(artwork.sharedArtworkId);
    }
  };

  const messageButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={openComments}
      aria-label={
        board.unreadCommentCount > 0 ? `댓글, 읽지 않은 댓글 ${board.unreadCommentCount}개` : '댓글'
      }
      className="relative h-11 w-11 text-neutral-800"
    >
      <span aria-hidden className="relative size-6 -translate-y-0.5 overflow-hidden">
        <img src="/app/images/shared-comment.png" alt="" className="size-6 max-w-none" />
      </span>
      {board.unreadCommentCount > 0 && (
        <span className="absolute left-[25px] top-2 flex h-3 min-w-3 items-center justify-center rounded-full bg-danger px-0.5 text-[9px] font-medium leading-3 text-neutral-0">
          {board.unreadCommentCount > 99 ? '99+' : board.unreadCommentCount}
        </span>
      )}
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
      {getRankedSharedArtworks(board.sharedArtworkList).map(({ artwork, rank }) => (
        <div key={artwork.sharedArtworkId} className="flex flex-col">
          <div className="relative mb-2 aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
            <a
              href={artworkHref(artwork.artworkId, board.sharedBoardId)}
              className="block h-full w-full"
            >
              {artwork.thumbnailUrl ? (
                <SkeletonImage
                  src={artwork.thumbnailUrl}
                  alt={artwork.title}
                  loading="lazy"
                  className="h-full w-full"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary-100 to-primary-300" />
              )}
            </a>
            {rank && (
              <div className="absolute left-0 top-0 flex h-7 w-[67px] items-center justify-center gap-1 rounded-br-md bg-primary text-caption-1 text-neutral-0">
                <span aria-hidden className="flex size-4 items-center justify-center overflow-hidden">
                  <img
                    src="/app/images/shared-rank-crown.svg"
                    alt=""
                    className="h-[12.137px] w-[13.334px] max-w-none"
                  />
                </span>
                <span>{rank}순위</span>
              </div>
            )}
            <button
              type="button"
              aria-label={artwork.isLiked ? '좋아요 취소' : '좋아요'}
              aria-pressed={artwork.isLiked}
              className={cn(
                'absolute bottom-[9px] right-[9px] flex h-9 min-w-9 items-center justify-center gap-1 rounded-full bg-neutral-950/30 text-neutral-0',
                artwork.likeCount > 0 ? 'px-2.5' : 'w-9 px-1.5',
              )}
              onClick={() => void toggleArtworkLike(artwork)}
            >
              <SharedLikeIcon active={artwork.isLiked} />
              {artwork.likeCount > 0 && <span className="text-body-5">{artwork.likeCount}</span>}
            </button>
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
    <BottomSheet
      open={commentsOpen}
      onOpenChange={(open) => {
        if (!open && deleteCommentId !== undefined) return;
        setCommentsOpen(open);
      }}
      title="댓글 목록"
      showHandle={false}
      className="h-[min(71vh,576px)] rounded-t-md pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-8px_8px_rgba(0,0,0,0.12)]"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          aria-hidden
          className="mx-auto mb-[13.5px] mt-[6.5px] h-[3.7px] w-[45px] shrink-0 rounded-full bg-neutral-800"
        />
        <h2 className="px-4 pb-[2.5px] pt-[6.5px] text-center text-head-3 text-neutral-950">
          댓글 목록
        </h2>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2">
          {board.comments.length === 0 ? (
            <li className="flex h-full min-h-48 flex-col items-center justify-center gap-1 text-center">
              <p className="text-body-1 text-neutral-950">아직 댓글이 없어요</p>
              <p className="w-[154px] text-body-6 text-neutral-800">
                추가한 후보에 대한 의견을 친구와 함께 나눠보세요.
              </p>
            </li>
          ) : (
            sortSharedCommentsNewestFirst(board.comments).map((comment) => (
              <li
                key={comment.sharedCommentId}
                className="border-b border-neutral-200 pt-4 first:pt-0 last:border-b-0"
              >
                <div
                  className={cn(
                    'ml-2 -mr-1 flex items-center justify-between gap-2',
                    comment.isMine ? 'h-11' : 'h-[26px]',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge className="h-[26px] shrink-0 rounded-sm bg-primary-100 px-2 py-1.5 text-caption-1 text-neutral-800">
                      {comment.sharedMemberName}
                    </Badge>
                    <span className="shrink-0 text-caption-1 text-neutral-600">
                      {formatSharedCommentTime(comment.createdAt)}
                    </span>
                  </div>
                  {comment.isMine && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex size-11 shrink-0 items-center justify-center rounded-md text-neutral-800"
                          aria-label="댓글 메뉴"
                        >
                          <img
                            src="/app/images/shared-comment-menu.svg"
                            alt=""
                            aria-hidden
                            className="h-[13.1667px] w-[3.16667px] max-w-none rotate-90"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        alignOffset={-6}
                        sideOffset={-12}
                        className="z-[80] min-w-0 rounded-md border-0 p-0 shadow-elevation"
                      >
                        <DropdownMenuItem
                          className="px-4 py-2 text-body-1 text-neutral-800"
                          onSelect={() => setDeleteCommentId(comment.sharedCommentId)}
                        >
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p
                  className={cn(
                    'whitespace-pre-wrap break-words px-3 pb-4 text-body-2 text-neutral-950',
                    comment.isMine ? '-mt-px' : 'mt-2',
                  )}
                >
                  {comment.content}
                </p>
              </li>
            ))
          )}
        </ul>
        <form
          className="relative bg-neutral-0 p-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submitComment();
          }}
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 남겨보세요."
            maxLength={500}
            className="h-11 w-full rounded-md bg-neutral-100 pl-[9.5px] pr-[45px] text-body-2 text-neutral-950 outline-none placeholder:text-neutral-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!commentText.trim() || commentSubmitting}
            aria-label="댓글 작성"
            className="absolute right-[14px] top-[13px] size-[34px] rounded-[6px] disabled:bg-neutral-300 disabled:opacity-100"
          >
            <img
              src="/app/images/shared-comment-send.svg"
              alt=""
              aria-hidden
              className="h-[15.8px] w-[13.8px] max-w-none"
            />
          </Button>
        </form>
      </div>
    </BottomSheet>
  );

  const deleteCommentModal = (
    <AlertDialog
      open={deleteCommentId !== undefined}
      onOpenChange={(open) => {
        if (open || commentDeleting) return;
        setDeleteCommentId(undefined);
      }}
    >
      <AlertDialogContent
        overlayClassName="z-[80]"
        className="z-[90] w-[303px] max-w-[calc(100%-2.5rem)] gap-0 rounded-md border-0 p-4"
      >
        <AlertDialogHeader className="pb-6 pt-3 text-center sm:text-center">
          <AlertDialogTitle>댓글을 삭제하시겠어요?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-center gap-2 sm:justify-center">
          <AlertDialogCancel className="h-12 w-[130px] flex-none rounded-[6px] border-0 bg-neutral-200 text-body-1 text-neutral-800 hover:bg-neutral-300">
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-12 w-[130px] flex-none rounded-[6px] text-body-1"
            disabled={commentDeleting}
            onClick={async (event) => {
              event.preventDefault();
              if (deleteCommentId === undefined) return;
              setCommentDeleting(true);
              try {
                const response = await fetch(
                  `/app/api/boards/${board.sharedBoardId}/comments/${deleteCommentId}`,
                  { method: 'DELETE' },
                );
                if (response.ok) {
                  setBoard((current) =>
                    current
                      ? {
                          ...current,
                          comments: current.comments.filter(
                            (comment) => comment.sharedCommentId !== deleteCommentId,
                          ),
                        }
                      : current,
                  );
                  setDeleteCommentId(undefined);
                }
              } finally {
                setCommentDeleting(false);
              }
            }}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
      {deleteCommentModal}
      {managementSheet}
      {deleteModal}
      {leaveModal}
      {shareSheet}
    </div>
  );
}
