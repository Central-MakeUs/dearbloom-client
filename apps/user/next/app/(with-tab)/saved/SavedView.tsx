'use client';

import { useState } from 'react';
import { ArtworkCard, BottomSheet, Header, cn } from '@dearbloom/ui';
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
  price: a.lowestPrice,
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
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10.0002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2839 19.7822 18.9076C20 18.4802 20 17.921 20 16.8031V14M16 5L10 11V14H13L19 8M16 5L19 2L22 5L19 8M16 5L19 8" />
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
          className={cn('relative flex-1 py-3 text-body-4 transition-colors', tab === key ? 'text-neutral-950' : 'text-neutral-500')}
        >
          {label}
          {tab === key && <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-primary" aria-hidden />}
        </button>
      ))}
    </div>
  );

  const emptySaved = (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-body-5 text-neutral-500">아직 저장한 작품이 없어요.</p>
      <a href="/snaps" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">
        작품 탐색하기
      </a>
    </div>
  );

  const grid = (
    <>
    {!editing && <p className="px-4 pb-3 pt-3 text-caption-1 text-neutral-600">전체 {items.length}</p>}
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pb-6">
      {items.map((a) => (
        <ArtworkCard
          key={a.artworkId}
          artworkId={a.artworkId}
          title={a.title}
          artistNickname={a.artistNickname}
          price={a.lowestPrice}
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
    </>
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
          <p className="text-body-4 text-neutral-950">공동보드가 없어요</p>
          <p className="text-body-5 text-neutral-500">새 보드를 만들고 친구들과 함께 의견을 나눠보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 py-4">
          {boards.map((b) => (
            <a key={b.id} href={`/app/boards/${b.id}`} className="flex flex-col">
              <BoardCollage artworks={b.artworks} className="mb-2" />
              <div className="truncate text-body-4 text-neutral-950">{b.name}</div>
              <div className="text-caption-2 text-neutral-600">{b.artworks.length}개의 작품</div>
            </a>
          ))}
        </div>
      )}
      {createFab}
    </div>
  );

  const editBar = editing ? (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-neutral-200 bg-neutral-0 px-4 pb-4 pt-3">
      {selected.size > 0 && (
        <p className="mb-3 text-center text-body-5 text-neutral-600">{selected.size}개의 작품이 선택되었습니다.</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={selected.size === 0}
          className="flex-1 rounded-md border border-neutral-300 bg-neutral-0 py-3 text-body-4 text-neutral-800 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          삭제하기
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={selected.size === 0}
          className="flex-1 rounded-md border border-neutral-300 bg-neutral-0 py-3 text-body-4 text-neutral-800 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          보드에 추가하기
        </button>
      </div>
    </div>
  ) : null;

  const confirmDialog = confirmOpen ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/50 px-8">
      <div className="w-full max-w-xs rounded-xl bg-neutral-0 px-5 py-6 text-center">
        <p className="text-body-2 text-neutral-950">선택하신 목록을 삭제하시겠어요?</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => setConfirmOpen(false)} className="flex-1 rounded-md bg-neutral-100 py-2.5 text-body-4 text-neutral-700">
            취소
          </button>
          <button type="button" onClick={deleteSelected} disabled={busy} className="flex-1 rounded-md bg-primary py-2.5 text-body-4 text-neutral-0 disabled:opacity-60">
            삭제
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // 보드에 추가 — 보드 선택 시트(보드 없으면 생성 유도)
  const boardPicker = (
    <BottomSheet open={pickerOpen} onOpenChange={setPickerOpen} title="보드에 추가하기">
      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 pb-2 pt-6 text-center">
          <p className="text-body-3 text-neutral-950">공동보드가 없어요</p>
          <p className="text-body-5 text-neutral-500">새 보드를 만들고 선택한 작품을 바로 추가해 보세요.</p>
          <a href="/app/boards/new" className="mt-4 w-full rounded-md bg-primary py-3 text-center text-body-2 text-neutral-0">
            공동보드 만들기
          </a>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-5 pb-1 pt-1">
            <span className="text-body-2 text-neutral-950">보드에 추가하기</span>
            <a href="/app/boards/new" className="text-body-4 text-primary">
              새 보드
            </a>
          </div>
          <ul className="overflow-y-auto">
            {boards.map((b) => (
              <li key={b.id} className="border-t border-neutral-100 first:border-t-0">
                <button
                  type="button"
                  onClick={() => addSelectedToBoard(b.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="truncate text-body-3 text-neutral-950">{b.name}</span>
                  <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </BottomSheet>
  );

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
