'use client';

import { useState } from 'react';
import { ArtworkCard, Header, cn } from '@dearbloom/ui';
import { regionLabel, type ArtworkListItem } from '@dearbloom/shared';
import { useBoardStore, type BoardArtwork } from '@/src/stores/boardStore';
import { BoardCollage } from '@/src/components/common/BoardCollage';

/** next basePath('/app') 대응 — 저장 프록시 라우트 실제 경로. */
const SAVED_ENDPOINT = '/app/api/saved';

type Tab = 'saved' | 'board';

const toBoardArtwork = (a: ArtworkListItem): BoardArtwork => ({
  artworkId: a.artworkId,
  title: a.title,
  artistNickname: a.artistNickname,
  price: a.price,
  thumbnailUrl: a.thumbnailUrl,
  regions: a.artistRegionList?.map(regionLabel) ?? [],
});

/**
 * 저장 화면 — 헤더('저장 목록' + 편집) / 탭(내 저장·공동보드) / 편집 모드(다중 선택 삭제·보드에 추가).
 * 내 저장은 서버 목록, 공동보드는 목(zustand) 스토어로 관리한다.
 */
export function SavedView({ initialItems }: { initialItems: ArtworkListItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<Tab>('saved');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const boards = useBoardStore((s) => s.boards);
  const addArtworks = useBoardStore((s) => s.addArtworks);

  const exitEdit = () => {
    setEditing(false);
    setSelected(new Set());
  };

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.artworkId)));

  async function deleteSelected() {
    if (selected.size === 0 || busy) return;
    setBusy(true);
    try {
      const res = await fetch(SAVED_ENDPOINT, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkIdList: [...selected] }),
      });
      if (res.status === 401) {
        window.location.href = '/app';
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setItems((prev) => prev.filter((x) => !selected.has(x.artworkId)));
      setConfirmOpen(false);
      exitEdit();
    } catch {
      // 실패 시 목록/선택 유지 — 사용자가 재시도 가능.
    } finally {
      setBusy(false);
    }
  }

  function addSelectedToBoard(boardId: string) {
    const chosen = items.filter((a) => selected.has(a.artworkId)).map(toBoardArtwork);
    addArtworks(boardId, chosen);
    setPickerOpen(false);
    exitEdit();
    setToast(`${chosen.length}개 작품을 보드에 추가했어요.`);
    setTimeout(() => setToast(null), 2000);
  }

  const editIcon = (
    <button type="button" onClick={() => setEditing(true)} aria-label="편집" className="flex h-11 w-11 items-center justify-center text-neutral-950">
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
  );

  const showEditIcon = tab === 'saved' && items.length > 0;
  const header = editing ? (
    <Header showBack onBack={exitEdit} title="내 저장 편집" />
  ) : (
    <Header showBack={false} title="저장 목록" right={showEditIcon ? editIcon : undefined} />
  );

  const tabs = (
    <div className="flex border-b border-neutral-200 px-4">
      {(
        [
          ['saved', '내 저장'],
          ['board', '공동보드'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setTab(key)}
          className={cn('relative flex-1 py-3 text-body-3 transition-colors', tab === key ? 'text-neutral-950' : 'text-neutral-500')}
        >
          {label}
          {tab === key && <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-primary" aria-hidden />}
        </button>
      ))}
    </div>
  );

  const emptySaved = (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-body-4 text-neutral-500">아직 저장한 작품이 없어요.</p>
      <a href="/snaps" className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
        작품 탐색하기
      </a>
    </div>
  );

  const grid = (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pb-6">
      {items.map((a) => (
        <ArtworkCard
          key={a.artworkId}
          artworkId={a.artworkId}
          title={a.title}
          artistNickname={a.artistNickname}
          price={a.price}
          thumbnailUrl={a.thumbnailUrl}
          regions={a.artistRegionList?.map(regionLabel)}
          initialSaved
          saveEndpoint={SAVED_ENDPOINT}
          onSavedChange={(saved) => {
            if (!saved) setItems((prev) => prev.filter((x) => x.artworkId !== a.artworkId));
          }}
          selectable={editing}
          selected={selected.has(a.artworkId)}
          onSelect={() => toggleSelect(a.artworkId)}
        />
      ))}
    </div>
  );

  const savedBody = items.length === 0 ? emptySaved : grid;

  // 공동보드 목록 — 목 스토어. 보드 카드(콜라주) + 생성 FAB.
  const createFab = (
    <a
      href="/app/boards/new"
      aria-label="공동보드 만들기"
      className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-neutral-0 shadow-elevation"
    >
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
    </a>
  );

  const boardBody = (
    <div className="relative min-h-[60vh]">
      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
          <p className="text-body-3 text-neutral-950">공동보드가 없어요</p>
          <p className="text-body-4 text-neutral-500">새 보드를 만들고 친구들과 함께 의견을 나눠보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 py-4">
          {boards.map((b) => (
            <a key={b.id} href={`/app/boards/${b.id}`} className="flex flex-col">
              <BoardCollage artworks={b.artworks} className="mb-2" />
              <div className="truncate text-body-3 text-neutral-950">{b.name}</div>
              <div className="text-caption-2 text-neutral-600">{b.artworks.length}개의 작품</div>
            </a>
          ))}
        </div>
      )}
      {createFab}
    </div>
  );

  const editBar = editing ? (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center gap-3 border-t border-neutral-200 bg-neutral-0 px-4 py-3">
      <button type="button" onClick={toggleAll} className="flex items-center gap-1.5 text-body-4 text-neutral-700">
        <span
          aria-hidden
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border',
            allSelected ? 'border-primary bg-primary text-neutral-0' : 'border-neutral-400',
          )}
        >
          {allSelected && (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </span>
        전체 {selected.size}
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        disabled={selected.size === 0}
        className="rounded-md border border-primary px-4 py-2 text-body-4 text-primary disabled:border-neutral-300 disabled:text-neutral-400"
      >
        보드에 추가하기
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={selected.size === 0}
        className="rounded-md bg-primary px-4 py-2 text-body-4 text-neutral-0 disabled:bg-neutral-300 disabled:text-neutral-500"
      >
        삭제하기
      </button>
    </div>
  ) : null;

  const confirmDialog = confirmOpen ? (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/50 px-8">
      <div className="w-full max-w-xs rounded-xl bg-neutral-0 px-5 py-6 text-center">
        <p className="text-body-2 text-neutral-950">선택하신 목록을 삭제하시겠어요?</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => setConfirmOpen(false)} className="flex-1 rounded-md bg-neutral-100 py-2.5 text-body-3 text-neutral-700">
            취소
          </button>
          <button type="button" onClick={deleteSelected} disabled={busy} className="flex-1 rounded-md bg-primary py-2.5 text-body-3 text-neutral-0 disabled:opacity-60">
            삭제
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // 보드에 추가 — 보드 선택 시트(보드 없으면 생성 유도)
  const boardPicker = pickerOpen ? (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-neutral-950/50" onClick={() => setPickerOpen(false)}>
      <div className="mx-auto w-full max-w-md rounded-t-xl bg-neutral-0 px-5 pb-8 pt-5" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3 text-body-2 text-neutral-950">보드에 추가</p>
        {boards.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-body-4 text-neutral-500">공동보드가 없어요. 먼저 보드를 만들어 주세요.</p>
            <a href="/app/boards/new" className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
              공동보드 만들기
            </a>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {boards.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => addSelectedToBoard(b.id)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-neutral-100"
                >
                  <BoardCollage artworks={b.artworks} className="h-12 w-12" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-3 text-neutral-950">{b.name}</span>
                    <span className="block text-caption-2 text-neutral-600">{b.artworks.length}개의 작품</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  ) : null;

  const toastEl = toast ? (
    <div className="fixed inset-x-0 bottom-28 z-50 mx-auto w-max max-w-[80%] rounded-full bg-neutral-950/85 px-4 py-2 text-caption-1 text-neutral-0">
      {toast}
    </div>
  ) : null;

  return (
    <div className="mx-auto max-w-md">
      {header}
      {!editing && tabs}
      {tab === 'saved' ? savedBody : boardBody}
      {editBar}
      {confirmDialog}
      {boardPicker}
      {toastEl}
    </div>
  );
}
