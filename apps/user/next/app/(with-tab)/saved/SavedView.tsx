'use client';

import { useState } from 'react';
import { ArtworkCard, Header, cn } from '@dearbloom/ui';
import { regionLabel, type ArtworkListItem } from '@dearbloom/shared';

/** next basePath('/app') 대응 — 저장 프록시 라우트 실제 경로. */
const SAVED_ENDPOINT = '/app/api/saved';

type Tab = 'saved' | 'board';

/**
 * 저장 화면 — 헤더('저장 목록' + 편집) / 탭(내 저장·공동보드) / 편집 모드(다중 선택 삭제).
 * 서버가 넘긴 초기 목록을 클라이언트에서 관리. 카드는 탐색 피드와 동일한 공용 ArtworkCard 사용.
 * 공동보드는 백엔드 API 미제공 상태라 빈 상태만 표시(생성 FAB 비활성).
 */
export function SavedView({ initialItems }: { initialItems: ArtworkListItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<Tab>('saved');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

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

  // 공동보드 — API 미제공. 빈 상태 + 생성 FAB(준비 중, 비활성).
  const boardBody = (
    <div className="relative min-h-[60vh]">
      <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
        <p className="text-body-4 text-neutral-950">공동보드가 없어요</p>
        <p className="text-body-5 text-neutral-500">새 보드를 만들고 친구들과 함께 의견을 나눠보세요.</p>
      </div>
      <button
        type="button"
        disabled
        aria-label="공동보드 만들기 (준비 중)"
        title="준비 중"
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-300 text-neutral-500 shadow-elevation"
      >
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );

  const editBar = editing ? (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md items-center gap-3 border-t border-neutral-200 bg-neutral-0 px-4 py-3">
      <button type="button" onClick={toggleAll} className="flex items-center gap-1.5 text-body-5 text-neutral-700">
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
        onClick={() => setConfirmOpen(true)}
        disabled={selected.size === 0}
        className="rounded-md bg-primary px-4 py-2 text-body-5 text-neutral-0 disabled:bg-neutral-300 disabled:text-neutral-500"
      >
        삭제하기
      </button>
      <button type="button" disabled title="준비 중" className="rounded-md border border-neutral-300 px-4 py-2 text-body-5 text-neutral-400">
        보드에 추가하기 {selected.size}
      </button>
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

  return (
    <div className="mx-auto max-w-md">
      {header}
      {!editing && tabs}
      {tab === 'saved' ? savedBody : boardBody}
      {editBar}
      {confirmDialog}
    </div>
  );
}
