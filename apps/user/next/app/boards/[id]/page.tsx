'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MoreVertical, MessageSquare, X } from 'lucide-react';
import {
  Header,
  Button,
  Badge,
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
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@dearbloom/ui';
import { useBoardStore } from '@/src/stores/boardStore';
import { useHydrated } from '@/src/lib/useHydrated';

const formatPrice = (won: number) => `${Math.round(won / 10000).toLocaleString()}만원~`;

export default function BoardDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();

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

  if (!hydrated) return <div className="min-h-screen bg-neutral-100" />;

  if (!board) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
        <Header showBack onBack={() => router.replace('/saved')} title="공동보드" />
        <p className="px-6 py-24 text-center text-body-4 text-neutral-500">보드를 찾을 수 없어요.</p>
      </div>
    );
  }

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="더보기" className="h-11 w-11 text-neutral-950">
          <MoreVertical className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => { setRenameText(board.name); setRenameOpen(true); }}>이름 변경</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setEditing((v) => !v)}>작품 편집</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setShareOpen(true)}>공유하기</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>보드 삭제</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const emptyBody = (
    <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
      <p className="text-body-4 text-neutral-500">아직 담긴 작품이 없어요.</p>
      <Button asChild>
        <a href={`/app/boards/${board.id}/add`}>작품 추가하기</a>
      </Button>
    </div>
  );

  const grid = (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pb-28 pt-3">
      {board.artworks.map((a) => (
        <div key={a.artworkId} className="flex flex-col">
          <div className="relative mb-2 aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
            {a.thumbnailUrl ? (
              <img src={a.thumbnailUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary-100 to-primary-300" />
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
          <div className="truncate text-body-3 text-neutral-950">{a.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-body-5 text-neutral-600">
            <span className="truncate">{a.regions.join(', ')}</span>
            {a.regions.length > 0 && <span className="h-3 w-px bg-neutral-400" />}
            <span className="shrink-0 font-semibold text-primary">{formatPrice(a.price)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const addBar = (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-center gap-2 border-t border-neutral-200 bg-neutral-0 px-4 py-3">
      <Button type="button" variant="outline" onClick={() => setCommentsOpen(true)}>
        <MessageSquare className="size-4" />
        댓글 {board.comments.length}
      </Button>
      <Button asChild className="flex-1">
        <a href={`/app/boards/${board.id}/add`}>작품 추가</a>
      </Button>
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
            onClick={() => { addComment(board.id, commentText); setCommentText(''); }}
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
            <Button type="button" variant="secondary" className="flex-1">취소</Button>
          </DialogClose>
          <Button type="button" className="flex-1" onClick={() => { renameBoard(board.id, renameText); setRenameOpen(false); }}>
            변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const deleteModal = (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">보드를 삭제하시겠어요?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="flex-1">취소</AlertDialogCancel>
          <AlertDialogAction
            className="flex-1 bg-danger text-neutral-0 hover:bg-danger/90"
            onClick={() => { deleteBoard(board.id); router.replace('/saved'); }}
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const shareModal = (
    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent hideClose className="max-w-xs">
        <DialogHeader>
          <DialogTitle>공동보드 공유</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-body-4 text-neutral-700">dearbloom.co.kr/boards/{board.code.replace('#', '')}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-primary"
            onClick={() => navigator.clipboard?.writeText(`dearbloom.co.kr/boards/${board.code.replace('#', '')}`)}
          >
            복사
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-neutral-100">
      <Header showBack onBack={() => router.replace('/saved')} title={board.name} right={menu} />
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
