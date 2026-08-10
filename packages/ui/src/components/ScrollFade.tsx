'use client';

import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

interface ScrollFadeProps {
  /**
   * 페이드가 앉을 높이(px). 하단에 고정 요소가 있으면 그 높이를 넘겨주세요.
   * 하단탭 화면은 60(탭 높이), 하단 CTA 화면은 68 처럼.
   */
  offset?: number;
  /**
   * 그라데이션 높이. 시안 실측은 72px 이지만 실제로 깔아보니 너무 세서 48px 로 줄였습니다.
   * "더 있다"는 힌트만 주면 되는 장치라 콘텐츠를 가릴 만큼 진할 이유가 없습니다.
   */
  height?: number;
  className?: string;
}

/** 바닥까지 이 정도 남았으면 더 볼 게 없다고 본다(소수점 오차 흡수). */
const BOTTOM_EPSILON = 8;

/**
 * 아래로 더 스크롤할 게 남았을 때만 깔리는 흰색 페이드 — Figma 2269:21567(375x72).
 *
 * 콘텐츠가 잘린 게 아니라 "더 있다"는 걸 알리는 장치라, 끝까지 내려가면 사라집니다.
 * 스크롤이 없는 짧은 화면에서는 아예 뜨지 않습니다.
 */
export function ScrollFade({ offset = 0, height = 48, className }: ScrollFadeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      setVisible(el.scrollHeight - el.scrollTop - el.clientHeight > BOTTOM_EPSILON);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // 무한스크롤로 목록이 늘거나 이미지가 로드되면 스크롤 여부가 바뀐다.
    const observer = new ResizeObserver(update);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-0 z-30 bg-gradient-to-b from-transparent to-neutral-0/70 transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{
        height,
        bottom: `calc(${offset}px + env(safe-area-inset-bottom))`,
      }}
    />
  );
}
