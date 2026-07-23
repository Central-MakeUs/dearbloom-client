'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@dearbloom/ui';
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

  const [menuOpen, setMenuOpen] = useState(false);
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
    <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="더보기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
      <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
      </svg>
    </button>
  );

  const menuSheet = menuOpen ? (
    <>
      <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      <div className="absolute right-2 top-[48px] z-40 w-40 overflow-hidden rounded-md border border-neutral-200 bg-neutral-0 shadow-elevation">
        {[
          ['이름 변경', () => { setRenameText(board.name); setRenameOpen(true); setMenuOpen(false); }],
          ['작품 편집', () => { setEditing((v) => !v); setMenuOpen(false); }],
          ['공유하기', () => { setShareOpen(true); setMenuOpen(false); }],
        ].map(([label, fn]) => (
          <button key={label as string} type="button" onClick={fn as () => void} className="block w-full px-4 py-3 text-left text-body-4 text-neutral-800 hover:bg-neutral-100">
            {label as string}
          </button>
        ))}
        <button type="button" onClick={() => { setDeleteOpen(true); setMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-body-4 text-danger hover:bg-neutral-100">
          보드 삭제
        </button>
      </div>
    </>
  ) : null;

  const emptyBody = (
    <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
      <p className="text-body-4 text-neutral-500">아직 담긴 작품이 없어요.</p>
      <a href={`/app/boards/${board.id}/add`} className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
        작품 추가하기
      </a>
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
              <button
                type="button"
                onClick={() => removeArtwork(board.id, a.artworkId)}
                aria-label="작품 제거"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950/60 text-neutral-0"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
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
      <button type="button" onClick={() => setCommentsOpen(true)} className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-4 py-2.5 text-body-4 text-neutral-700">
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        댓글 {board.comments.length}
      </button>
      <a href={`/app/boards/${board.id}/add`} className="flex-1 rounded-md bg-primary py-2.5 text-center text-body-3 text-neutral-0">
        작품 추가
      </a>
    </div>
  );

  const commentSheet = commentsOpen ? (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-neutral-950/40" onClick={() => setCommentsOpen(false)}>
      <div className="mx-auto flex max-h-[70vh] w-full max-w-md flex-col rounded-t-xl bg-neutral-900 px-5 pb-6 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-body-2 text-neutral-0">댓글 목록</p>
        </div>
        <ul className="flex-1 space-y-4 overflow-y-auto">
          {board.comments.length === 0 ? (
            <li className="py-10 text-center text-body-4 text-neutral-400">아직 댓글이 없어요.</li>
          ) : (
            board.comments.map((c) => (
              <li key={c.id}>
                <span className="mb-1 inline-block rounded-sm bg-neutral-700 px-1.5 py-0.5 text-caption-3 text-neutral-100">{c.author}</span>
                <p className="text-body-4 text-neutral-0">{c.text}</p>
              </li>
            ))
          )}
        </ul>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 남겨보세요"
            className="flex-1 rounded-full bg-neutral-800 px-4 py-2.5 text-body-4 text-neutral-0 placeholder:text-neutral-500 outline-none"
          />
          <button
            type="button"
            disabled={!commentText.trim()}
            onClick={() => { addComment(board.id, commentText); setCommentText(''); }}
            className="shrink-0 rounded-full bg-primary px-4 py-2.5 text-body-4 text-neutral-0 disabled:bg-neutral-700 disabled:text-neutral-500"
          >
            작성
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const renameModal = renameOpen ? (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/50 px-8">
      <div className="w-full max-w-xs rounded-xl bg-neutral-0 px-5 py-6">
        <p className="mb-3 text-body-2 text-neutral-950">보드 이름 변경</p>
        <input
          value={renameText}
          onChange={(e) => setRenameText(e.target.value)}
          maxLength={20}
          className="w-full rounded-md border border-neutral-200 px-3 py-2.5 text-body-3 text-neutral-950 outline-none focus:border-primary"
        />
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setRenameOpen(false)} className="flex-1 rounded-md bg-neutral-100 py-2.5 text-body-3 text-neutral-700">
            취소
          </button>
          <button type="button" onClick={() => { renameBoard(board.id, renameText); setRenameOpen(false); }} className="flex-1 rounded-md bg-primary py-2.5 text-body-3 text-neutral-0">
            변경
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const deleteModal = deleteOpen ? (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/50 px-8">
      <div className="w-full max-w-xs rounded-xl bg-neutral-0 px-5 py-6 text-center">
        <p className="text-body-2 text-neutral-950">보드를 삭제하시겠어요?</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => setDeleteOpen(false)} className="flex-1 rounded-md bg-neutral-100 py-2.5 text-body-3 text-neutral-700">
            취소
          </button>
          <button type="button" onClick={() => { deleteBoard(board.id); router.replace('/saved'); }} className="flex-1 rounded-md bg-danger py-2.5 text-body-3 text-neutral-0">
            삭제
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const shareModal = shareOpen ? (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/50 px-8" onClick={() => setShareOpen(false)}>
      <div className="w-full max-w-xs rounded-xl bg-neutral-0 px-5 py-6" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3 text-body-2 text-neutral-950">공동보드 공유</p>
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-body-4 text-neutral-700">dearbloom.co.kr/boards/{board.code.replace('#', '')}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(`dearbloom.co.kr/boards/${board.code.replace('#', '')}`)}
            className="shrink-0 rounded-md bg-neutral-100 px-3 py-1.5 text-body-4 text-primary"
          >
            복사
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-neutral-100">
      <Header showBack onBack={() => router.replace('/saved')} title={board.name} right={menu} />
      {menuSheet}
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
