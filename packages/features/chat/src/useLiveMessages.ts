'use client';

import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { CHAT_WS_URL, chatRoomTopic, type ChatMessage } from '@dearbloom/shared';

/**
 * 방 토픽(STOMP)을 구독해 새 메시지를 실시간으로 받는다.
 *
 * 인증은 핸드셰이크에 실리는 httpOnly `accessToken` 쿠키로 이뤄지므로 프론트와 API 가
 * 같은 사이트일 때만 연결된다(로컬 개발에서는 쿠키가 API 도메인으로 가지 않아 연결이 거부됨).
 * 연결이 안 되는 환경에서도 화면이 깨지지 않도록 실패는 조용히 흘려보내고, 전송·재조회로 동작한다.
 */
export function useLiveMessages(roomId: number, onMessage: (message: ChatMessage) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const client = new Client({
      brokerURL: CHAT_WS_URL,
      reconnectDelay: 5000,
      // 연결이 불가능한 환경(로컬 등)에서 콘솔을 오염시키지 않는다.
      debug: () => {},
      onStompError: () => {},
      onWebSocketError: () => {},
    });

    client.onConnect = () => {
      client.subscribe(chatRoomTopic(roomId), (frame) => {
        try {
          onMessage(JSON.parse(frame.body) as ChatMessage);
        } catch {
          // 파싱 불가한 프레임은 무시
        }
      });
    };

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [roomId, onMessage]);
}
