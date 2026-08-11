'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Header } from '@dearbloom/ui';
import type { ChatMessage, ChatRole } from '@dearbloom/shared';
import { ChatComposer } from './ChatComposer';
import { ChatRoomMenu } from './ChatRoomMenu';
import { ChatToast } from './ChatToast';
import { MessageRow } from './MessageRow';
import { useLiveMessages } from './useLiveMessages';

/** 서버가 한 번에 주는 히스토리 크기. 이보다 적게 오면 더 이상 위쪽 페이지가 없다는 뜻. */
const PAGE_SIZE = 30;

interface ChatRoomViewProps {
  roomId: number;
  myRole: ChatRole;
  peerName: string;
  /** SSR 로 받은 최신 히스토리(오래된 → 최신). */
  initialMessages: ChatMessage[];
  /** 뒤로가기 목적지(고객/작가 채팅 목록). */
  backHref: string;
  /** 프록시 라우트 prefix. */
  apiBase?: string;
}

/**
 * 채팅방 — 히스토리(위로 무한 스크롤) + 실시간 수신 + 텍스트 전송.
 *
 * ⋯ 메뉴(알림 끄기/신고하기/나가기)는 Figma 대로 렌더하되 백엔드 API 가 없어
 * 선택하면 '준비 중' 토스트로 수렴한다.
 */
export function ChatRoomView({
  roomId,
  myRole,
  peerName,
  initialMessages,
  backHref,
  apiBase = '/app/api',
}: ChatRoomViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [hasMore, setHasMore] = useState(initialMessages.length >= PAGE_SIZE);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  /** 과거 페이지를 붙이기 직전의 스크롤 높이 — 붙인 뒤 보던 위치를 유지하는 데 쓴다. */
  const restoreHeight = useRef<number | null>(null);
  const roomPath = `${apiBase}/chat/rooms/${roomId}`;

  /** 토스트 자동 닫기 타이머가 리렌더마다 다시 걸리지 않도록 참조를 고정한다. */
  const dismissToast = useCallback(() => setToast(null), []);

  /** STOMP 와 전송 응답이 같은 메시지를 두 번 넣지 않도록 messageId 로 정리한다. */
  const append = useCallback((incoming: ChatMessage) => {
    setMessages((prev) =>
      prev.some((m) => m.messageId === incoming.messageId) ? prev : [...prev, incoming],
    );
  }, []);

  useLiveMessages(roomId, append);

  // 방에 들어오면 읽음 처리(내 쪽 안읽음 0).
  useEffect(() => {
    void fetch(`${roomPath}/read`, { method: 'POST' }).catch(() => {});
  }, [roomPath]);

  // 새 메시지가 붙으면 맨 아래로. 과거 페이지를 붙인 경우엔 보던 위치를 유지한다.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (restoreHeight.current !== null) {
      el.scrollTop = el.scrollHeight - restoreHeight.current;
      restoreHeight.current = null;
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function loadOlder() {
    const oldest = messages[0];
    if (!oldest || loadingOlder || !hasMore) return;

    setLoadingOlder(true);
    try {
      const res = await fetch(`${roomPath}/messages?cursor=${oldest.messageId}&size=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(String(res.status));

      const older = (await res.json()) as ChatMessage[];
      if (older.length < PAGE_SIZE) setHasMore(false);
      if (older.length > 0) {
        restoreHeight.current = scrollRef.current?.scrollHeight ?? null;
        setMessages((prev) => [...older, ...prev]);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingOlder(false);
    }
  }

  async function sendText(content: string) {
    setError(null);
    try {
      const res = await fetch(`${roomPath}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(String(res.status));
      append((await res.json()) as ChatMessage);
    } catch {
      setError('메시지를 보내지 못했어요.');
    }
  }

  // 말풍선은 왼쪽 8 / 오른쪽 16 에서 시작한다(Figma 234:6470 — 수신 x=8, 발신 오른쪽 끝 x=359).
  const list = (
    <div
      ref={scrollRef}
      onScroll={(e) => {
        if (e.currentTarget.scrollTop < 40) void loadOlder();
      }}
      className="h-[calc(100dvh-113px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto pb-4 pl-2 pr-4 pt-2"
    >
      {loadingOlder && (
        <p className="pb-3 text-center text-caption-2 text-neutral-500">이전 대화를 불러오는 중…</p>
      )}
      <div className="flex flex-col gap-5">
        {messages.map((message) => (
          <MessageRow key={message.messageId} message={message} myRole={myRole} />
        ))}
      </div>
      {error && <p className="pt-3 text-center text-caption-2 text-danger">{error}</p>}
    </div>
  );

  const menuButton = (
    <button
      type="button"
      aria-label="채팅방 메뉴"
      onClick={() => setMenuOpen(true)}
      className="flex h-11 w-11 items-center justify-center text-neutral-800"
    >
      <MoreHorizontal size={24} strokeWidth={2} aria-hidden />
    </button>
  );

  // 채팅방은 (with-tab) 레이아웃 밖이라 배경을 직접 준다.
  // 이게 없으면 페이지가 흰 바탕이 되어 수신 말풍선(neutral-0)이 배경에 묻힌다.
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-neutral-100">
      <Header title={peerName} onBack={() => (window.location.href = backHref)} right={menuButton} />
      {list}
      <ChatComposer onSendText={sendText} />
      <ChatRoomMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onSelect={() => {
          setMenuOpen(false);
          setToast('아직 준비 중인 기능이에요.');
        }}
      />
      <ChatToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
