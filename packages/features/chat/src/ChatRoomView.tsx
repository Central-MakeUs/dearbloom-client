'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Header } from '@dearbloom/ui';
import type { ChatMessage, ChatRole } from '@dearbloom/shared';
import { ChatComposer } from './ChatComposer';
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

/** 채팅방 — 히스토리(위로 무한 스크롤) + 실시간 수신 + 텍스트/사진 전송. */
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

  const scrollRef = useRef<HTMLDivElement>(null);
  /** 과거 페이지를 붙이기 직전의 스크롤 높이 — 붙인 뒤 보던 위치를 유지하는 데 쓴다. */
  const restoreHeight = useRef<number | null>(null);
  const roomPath = `${apiBase}/chat/rooms/${roomId}`;

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

  async function sendImage(file: File) {
    setError(null);
    try {
      const presign = await fetch(`${apiBase}/presigned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: 'CHAT_IMAGE', fileName: file.name }),
      });
      if (!presign.ok) throw new Error('presigned');

      const { presignedUrl, fileUrl } = (await presign.json()) as {
        presignedUrl: string;
        fileUrl: string;
      };
      const put = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!put.ok) throw new Error('s3');

      const res = await fetch(`${roomPath}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: fileUrl }),
      });
      if (!res.ok) throw new Error(String(res.status));
      append((await res.json()) as ChatMessage);
    } catch {
      setError('사진을 보내지 못했어요.');
    }
  }

  const list = (
    <div
      ref={scrollRef}
      onScroll={(e) => {
        if (e.currentTarget.scrollTop < 40) void loadOlder();
      }}
      className="h-[calc(100dvh-52px-56px)] overflow-y-auto px-4 py-4"
    >
      {loadingOlder && (
        <p className="pb-3 text-center text-caption-2 text-neutral-500">이전 대화를 불러오는 중…</p>
      )}
      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <MessageRow key={message.messageId} message={message} myRole={myRole} />
        ))}
      </div>
      {error && <p className="pt-3 text-center text-caption-2 text-danger">{error}</p>}
    </div>
  );

  // 채팅방은 (with-tab) 레이아웃 밖이라 배경을 직접 준다.
  // 이게 없으면 페이지가 흰 바탕이 되어 수신 말풍선(neutral-0)이 배경에 묻힌다.
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-neutral-100">
      <Header title={peerName} onBack={() => (window.location.href = backHref)} />
      {list}
      <ChatComposer onSendText={sendText} onSendImage={sendImage} />
    </div>
  );
}
