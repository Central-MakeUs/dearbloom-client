'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 공동보드 목(mock) 스토어 — 백엔드 API 미제공 상태라 클라이언트에서만 관리.
 * localStorage 로 지속(persist)되어 페이지 이동/새로고침에도 유지된다.
 * 추후 보드 API 가 나오면 이 스토어를 서버 연동으로 교체한다.
 */

/** 보드에 담긴 작품 스냅샷(보드가 자체 완결되도록 카드 표시에 필요한 값만 복사) */
export interface BoardArtwork {
  artworkId: number;
  title: string;
  artistNickname: string;
  price: number;
  thumbnailUrl?: string | null;
  /** 한글 지역 라벨 */
  regions: string[];
}

export interface BoardComment {
  id: string;
  author: string;
  text: string;
}

export interface Board {
  id: string;
  name: string;
  /** 공유 코드(#123456) */
  code: string;
  artworks: BoardArtwork[];
  comments: BoardComment[];
}

interface BoardState {
  boards: Board[];
  getBoard: (id: string) => Board | undefined;
  createBoard: (name: string, code?: string) => Board;
  renameBoard: (id: string, name: string) => void;
  deleteBoard: (id: string) => void;
  addArtworks: (id: string, artworks: BoardArtwork[]) => void;
  setArtworks: (id: string, artworks: BoardArtwork[]) => void;
  removeArtwork: (id: string, artworkId: number) => void;
  addComment: (id: string, text: string) => void;
}

const randomCode = () => `#${Math.floor(100000 + Math.random() * 900000)}`;
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: [],
      getBoard: (id) => get().boards.find((b) => b.id === id),
      createBoard: (name, code) => {
        const board: Board = { id: uid(), name: name.trim() || '새 공동보드', code: code ?? randomCode(), artworks: [], comments: [] };
        set((s) => ({ boards: [board, ...s.boards] }));
        return board;
      },
      renameBoard: (id, name) =>
        set((s) => ({ boards: s.boards.map((b) => (b.id === id ? { ...b, name: name.trim() || b.name } : b)) })),
      deleteBoard: (id) => set((s) => ({ boards: s.boards.filter((b) => b.id !== id) })),
      addArtworks: (id, artworks) =>
        set((s) => ({
          boards: s.boards.map((b) => {
            if (b.id !== id) return b;
            const existing = new Set(b.artworks.map((a) => a.artworkId));
            const merged = [...b.artworks, ...artworks.filter((a) => !existing.has(a.artworkId))];
            return { ...b, artworks: merged };
          }),
        })),
      setArtworks: (id, artworks) =>
        set((s) => ({
          boards: s.boards.map((b) => (b.id === id ? { ...b, artworks } : b)),
        })),
      removeArtwork: (id, artworkId) =>
        set((s) => ({
          boards: s.boards.map((b) => (b.id === id ? { ...b, artworks: b.artworks.filter((a) => a.artworkId !== artworkId) } : b)),
        })),
      addComment: (id, text) =>
        set((s) => ({
          boards: s.boards.map((b) =>
            b.id === id ? { ...b, comments: [...b.comments, { id: uid(), author: '나', text: text.trim() }] } : b,
          ),
        })),
    }),
    {
      name: 'dearbloom-board-store',
      version: 1,
      migrate: (persisted) => {
        const state = persisted as BoardState;
        return { ...state, boards: state.boards.filter((board) => board.id !== 'seed-1') };
      },
    },
  ),
);
