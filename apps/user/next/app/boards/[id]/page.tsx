'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Heart, MessageCircleMore, MoreHorizontal, UserRound, X } from 'lucide-react';
import {
  Header,
  Button,
  Badge,
  BottomButton,
  BottomButtonBar,
  ShareButton,
  Input,
  BottomSheet,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { useBoardStore } from '@/src/stores/boardStore';
import { useHydrated } from '@/src/lib/useHydrated';
import { showCandidateToast } from './CandidateToast';

const formatPrice = (won: number) => `${Math.round(won / 10000).toLocaleString()}만원`;

export default function BoardDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const candidateUpdated = searchParams.get('candidateUpdated') === '1';

  const board = useBoardStore((s) => s.boards.find((b) => b.id === id));
  const renameBoard = useBoardStore((s) => s.renameBoard);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const removeArtwork = useBoardStore((s) => s.removeArtwork);
  const addComment = useBoardStore((s) => s.addComment);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!candidateUpdated) return;
    showCandidateToast('내 후보가 수정되었어요', 'success');
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, [candidateUpdated]);

  if (!hydrated) return <div className="min-h-screen bg-neutral-100" />;

  if (!board) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="더보기"
          className="h-11 w-11 text-neutral-950"
        >
          <MoreHorizontal className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onSelect={() => {
            setRenameText(board.name);
            setRenameOpen(true);
          }}
        >
          이름 변경
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setEditing((v) => !v)}>작품 편집</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setShareOpen(true)}>공유하기</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>
          보드 삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
          멤버 <span className="text-primary">1</span>
        </span>
      </div>
      <span className="rounded-md bg-neutral-200 px-3 py-1.5 text-body-5 text-neutral-800">
        김디어
      </span>
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
      {board.artworks.map((a) => (
        <div key={a.artworkId} className="flex flex-col">
          <div className="relative mb-2 aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
            {a.thumbnailUrl ? (
              <img
                src={a.thumbnailUrl}
                alt={a.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary-100 to-primary-300" />
            )}
            {!editing && (
              <span
                aria-hidden
                className="absolute bottom-[9px] right-[9px] flex size-9 items-center justify-center rounded-full bg-neutral-950/30 text-neutral-0"
              >
                <Heart className="size-6" strokeWidth={1.5} />
              </span>
            )}
            {editing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeArtwork(board.id, a.artworkId)}
                aria-label="작품 제거"
                className="absolute right-2 top-2 h-7 w-7 rounded-full bg-neutral-950/60 text-neutral-0 hover:bg-neutral-950/80 hover:text-neutral-0"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
          <div className="truncate text-body-3 text-neutral-900">{a.title}</div>
          <div className="truncate text-body-6 text-neutral-900">{a.artistNickname}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-body-3 text-primary">{formatPrice(a.price)}</span>
            <div className="flex flex-wrap items-center gap-1">
              {a.regions.map((region) => (
                <RegionTag key={region}>{region}</RegionTag>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const addBar = (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md bg-neutral-100 px-4 pb-6 pt-2">
      <BottomButtonBar leading={<ShareButton onClick={() => setShareOpen(true)} />}>
        <BottomButton
          color={board.artworks.length > 0 ? 'black' : 'green'}
          onClick={() => router.push(`/boards/${board.id}/add`)}
        >
          {board.artworks.length > 0 ? '내 후보 수정하기' : '내 후보 추가하기'}
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
            board.comments.map((c) => (
              <li key={c.id}>
                <Badge className="mb-1">{c.author}</Badge>
                <p className="text-body-4 text-neutral-950">{c.text}</p>
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
            onClick={() => {
              addComment(board.id, commentText);
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

  const renameModal = (
    <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
      <DialogContent hideClose className="max-w-xs">
        <DialogHeader>
          <DialogTitle>보드 이름 변경</DialogTitle>
        </DialogHeader>
        <Input value={renameText} onChange={(e) => setRenameText(e.target.value)} maxLength={20} />
        <DialogFooter className="flex-row gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="flex-1">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              renameBoard(board.id, renameText);
              setRenameOpen(false);
            }}
          >
            변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const deleteModal = (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent className="max-w-[300px] gap-0 border-0 p-4">
        <AlertDialogHeader className="gap-2 pb-6 pt-3 text-center sm:text-center">
          <AlertDialogTitle>보드 삭제하기</AlertDialogTitle>
          <AlertDialogDescription className="text-body-6 text-neutral-800">
            보드를 삭제하면 모든 작품 후보와
            <br />
            활동 기록이 함께 삭제되며 복구할 수 없어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="h-12 flex-1 border-0 bg-neutral-200 text-body-1 text-neutral-800 hover:bg-neutral-300">
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-12 flex-1 text-body-1"
            onClick={() => {
              deleteBoard(board.id);
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

  const boardSharePath = `/boards/${board.code.replace('#', '')}`;
  const boardShareUrl = `${window.location.host}${boardSharePath}`;

  const shareModal = (
    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent hideClose className="max-w-xs">
        <DialogHeader>
          <DialogTitle>공동보드 공유</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-body-4 text-neutral-700">
            {boardShareUrl}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-primary"
            onClick={() => navigator.clipboard?.writeText(boardShareUrl)}
          >
            복사
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-neutral-100">
      <Header
        showBack
        onBack={() => router.replace('/saved?tab=board')}
        title={board.name}
        right={headerActions}
      />
      {members}
      {board.artworks.length === 0 ? emptyBody : grid}
      {addBar}
      {commentSheet}
      {renameModal}
      {deleteModal}
      {shareModal}
      {editing && (
        <div className="fixed left-1/2 top-[60px] z-20 -translate-x-1/2 rounded-full bg-neutral-950/80 px-3 py-1 text-caption-2 text-neutral-0">
          작품 편집 중 — × 로 제거
        </div>
      )}
    </div>
  );
}
