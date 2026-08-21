'use client';

import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  ArtworkCard,
  Button,
  Header,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  showToast,
} from '@dearbloom/ui';
import {
  artistRegionLabel,
  type ArtworkListItem,
  type SharedBoardSummary,
} from '@dearbloom/shared';
import { AppLink } from '@/src/components/common/AppLink';
import { BoardCollage } from '@/src/components/common/BoardCollage';
import { ARTWORK_CARD_WIDTH, optimizedImageUrl } from '@/src/lib/imageUrl';
import { replaceApp } from '@/src/lib/appNavigation';
import { SHARED_BOARDS_REFRESH_KEY } from '@/src/lib/sharedBoardsRefresh';
import { getSwipedTab, type SavedTab } from './savedSwipe';

/** next basePath('/app') 대응 — 저장 프록시 라우트 실제 경로. */
const SAVED_ENDPOINT = '/app/api/saved';

/**
 * 저장 화면 — 헤더('저장 목록' + 편집) / 탭(내 저장·공동보드) / 편집 모드(다중 선택 삭제).
 */
export function SavedView({
  initialItems,
  initialBoards,
  initialTab,
}: {
  initialItems: ArtworkListItem[];
  initialBoards: SharedBoardSummary[];
  initialTab: SavedTab;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<SavedTab>(initialTab);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const refreshSharedBoards = () => {
      if (tab !== 'board' || sessionStorage.getItem(SHARED_BOARDS_REFRESH_KEY) !== '1') return;
      sessionStorage.removeItem(SHARED_BOARDS_REFRESH_KEY);
      router.refresh();
    };

    refreshSharedBoards();
    window.addEventListener('pageshow', refreshSharedBoards);
    window.addEventListener('popstate', refreshSharedBoards);
    return () => {
      window.removeEventListener('pageshow', refreshSharedBoards);
      window.removeEventListener('popstate', refreshSharedBoards);
    };
  }, [router, tab]);

  const changeTab = (value: string) => {
    const nextTab = value as SavedTab;
    const url = new URL(window.location.href);
    if (nextTab === 'board') url.searchParams.set('tab', 'board');
    else url.searchParams.delete('tab');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
    setTab(nextTab);
  };

  const startSwipe = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const endSwipe = (event: TouchEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || editing) return;

    const touch = event.changedTouches[0];
    if (!touch) return;
    const nextTab = getSwipedTab(start, { x: touch.clientX, y: touch.clientY });
    if (!nextTab || nextTab === tab) return;

    event.preventDefault();
    changeTab(nextTab);
  };

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
        replaceApp(router, '/app');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setItems((prev) => prev.filter((x) => !selected.has(x.artworkId)));
      sessionStorage.setItem(SHARED_BOARDS_REFRESH_KEY, '1');
      setConfirmOpen(false);
      exitEdit();
      showToast('저장 목록이 수정되었어요');
    } catch {
      // 실패 시 목록/선택 유지 — 사용자가 재시도 가능.
    } finally {
      setBusy(false);
    }
  }

  const editIcon = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setEditing(true)}
      aria-label="편집"
      className="relative h-11 w-11 p-0"
    >
      <span aria-hidden className="absolute left-2.5 top-[10px] size-6 overflow-clip">
        <span className="absolute inset-[8.33%_8.33%_16.67%_16.67%]">
          <img src="/app/images/saved-edit.svg" alt="" className="absolute inset-[-4.17%] size-full" />
        </span>
      </span>
    </Button>
  );

  const showEditIcon = tab === 'saved' && items.length > 0;
  // 편집 모드에선 빠져나올 뒤로가기가 필요해 타이틀이 '내 저장 편집'으로 바뀝니다.
  const header = editing ? (
    <Header showBack onBack={exitEdit} title="내 저장 편집" />
  ) : (
    <Header showBack={false} title="저장 목록" right={showEditIcon ? editIcon : undefined} />
  );

  const emptySaved = (
    <div className="flex min-h-[calc(100dvh-160px)] flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
      <div className="flex w-[154px] flex-col gap-1.5">
        <p className="text-head-3 text-neutral-950">저장한 작품이 없어요</p>
        <p className="text-body-6 text-neutral-800">탐색 탭에서 원하는 작품을 저장해 보세요.</p>
      </div>
      <Button asChild size="sm" className="h-10 rounded-[6px] px-5">
        <a href="/snaps">작품 탐색하기</a>
      </Button>
    </div>
  );

  const grid = (
    <>
    {!editing && <p className="px-4 pb-3 pt-3 text-body-5 text-neutral-600">전체 {items.length}</p>}
    <div className="grid grid-cols-2 gap-x-2 gap-y-5 px-4 pb-6">
      {items.map((a) => (
        <ArtworkCard
          key={a.artworkId}
          artworkId={a.artworkId}
          title={a.title}
          artistNickname={a.artistNickname}
          price={a.lowestPrice}
          thumbnailUrl={optimizedImageUrl(a.thumbnailUrl, ARTWORK_CARD_WIDTH)}
          regions={a.artistRegionList?.map(artistRegionLabel)}
          initialSaved
          saveEndpoint={SAVED_ENDPOINT}
          unsavedHeartIconSrc="/app/images/save-heart-grid.svg"
          unsavedHeartIconClassName="left-[2.25px] top-[3.79px] h-[17.46px] w-[19.5px]"
          savedHeartIconSrc="/app/images/save-heart-selected.svg"
          savedHeartIconClassName="left-[2.25px] top-[3.79px] h-[17.46px] w-[19.5px]"
          onSavedChange={(saved) => {
            if (!saved) {
              setItems((prev) => prev.filter((x) => x.artworkId !== a.artworkId));
              sessionStorage.setItem(SHARED_BOARDS_REFRESH_KEY, '1');
            }
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

  // 공동보드 카드(콜라주) + 생성 FAB.
  const createFab = (
    <div className="pointer-events-none fixed inset-x-0 bottom-[60px] z-20 mx-auto flex max-w-md justify-end px-4 py-3">
      <Button
        asChild
        size="icon"
        aria-label="공동보드 만들기"
        className="pointer-events-auto h-12 w-12 rounded-full text-neutral-0 shadow-elevation [&_svg]:size-6"
      >
        <AppLink href="/app/boards/new">
          <Plus strokeWidth={2} aria-hidden />
        </AppLink>
      </Button>
    </div>
  );

  const boardBody = (
    <div className="relative min-h-[calc(100dvh-180px)]">
      {initialBoards.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 pb-12 text-center">
          <p className="text-body-1 text-neutral-950">공동보드가 없어요</p>
          <p className="max-w-[170px] text-body-5 text-neutral-800">새 보드를 만들고 친구들과<br/>함께 의견을 나눠보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 py-4">
          {initialBoards.map((board) => (
            <AppLink key={board.sharedBoardId} href={`/app/boards/${board.sharedBoardId}`} className="flex flex-col">
              <BoardCollage
                artworks={board.thumbnailUrlList.map((thumbnailUrl) => ({ thumbnailUrl }))}
                className="mb-2"
              />
              <div className="truncate text-body-4 text-neutral-950">{board.sharedBoardName}</div>
              <div className="text-caption-2 text-neutral-600">{board.sharedArtworkCount}개의 작품</div>
            </AppLink>
          ))}
        </div>
      )}
    </div>
  );

  // 비활성 탭을 DOM 에 남기면 긴 저장 목록 높이가 공동보드에도 남는다.
  const activeBody = tab === 'saved' ? savedBody : boardBody;

  const editBar = editing ? (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-neutral-200 bg-neutral-0 px-4 pb-4 pt-3">
      {selected.size > 0 && (
        <p className="mb-3 text-center text-body-5 text-neutral-600">{selected.size}개의 작품이 선택되었습니다.</p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setConfirmOpen(true)} disabled={selected.size === 0} className="flex-1 py-3">
          삭제하기
        </Button>
      </div>
    </div>
  ) : null;

  const confirmDialog = (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent className="max-w-xs text-center">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">삭제하기</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-body-4 text-neutral-700">
            선택하신 목록을 삭제하시겠어요?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row">
          <AlertDialogCancel className="flex-1">취소</AlertDialogCancel>
          <AlertDialogAction
            className="flex-1 gap-2"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              deleteSelected();
            }}
          >
            {busy ? <Spinner className="size-5 text-current" label="" /> : null}
            {busy ? '삭제 중…' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="mx-auto max-w-md">
      {header}
      <Tabs value={tab} onValueChange={changeTab}>
        {!editing && (
          <TabsList className="sticky top-[calc(52px+env(safe-area-inset-top))] z-30 border-neutral-400 bg-neutral-100">
            <TabsTrigger
              value="saved"
              className="data-[state=inactive]:border-neutral-400 data-[state=active]:border-b-2 data-[state=active]:tracking-[-0.01em]"
            >
              내 저장
            </TabsTrigger>
            <TabsTrigger
              value="board"
              className="data-[state=inactive]:border-neutral-400 data-[state=active]:border-b-2 data-[state=active]:tracking-[-0.01em]"
            >
              공동보드
            </TabsTrigger>
          </TabsList>
        )}
        <div
          className="touch-pan-y"
          onTouchStart={startSwipe}
          onTouchEnd={endSwipe}
          onTouchCancel={() => {
            swipeStart.current = null;
          }}
        >
          {activeBody}
        </div>
      </Tabs>
      {tab === 'board' ? createFab : null}
      {editBar}
      {confirmDialog}
    </div>
  );
}
