'use client';

import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

interface ScrollFadeProps {
  /**
   * 페이드가 앉을 높이(px). 하단에 고정 요소가 있으면 그 높이를 넘겨주세요.
   * 하단탭 화면은 60(탭 높이), 하단 CTA 화면은 68 처럼.
   */
  offset?: number;
  /** 그라데이션 높이. 시안 실측은 72px 이지만 그만큼 깔면 콘텐츠를 덮어서 32px 로 줄였습니다. */
  height?: number;
  className?: string;
}

/** 바닥까지 이 정도 남았으면 더 볼 게 없다고 본다(소수점 오차 흡수). */
const BOTTOM_EPSILON = 8;

/**
 * 아래로 더 스크롤할 게 남았을 때만 깔리는 페이드 — Figma 2269:21567.
 *
 * 색은 흰색이 아니라 **배경색(neutral-100)** 입니다. 시안은 흰색이지만 배경이 #F8F8F8 이라
 * 흰색으로 깔면 콘텐츠가 배경에 묻히는 대신 흰 띠가 얹힌 것처럼 보입니다. 배경과 같은 색이어야
 * "아래 내용이 서서히 사라지는" 효과만 남습니다. 배경이 다른 화면에서는 className 으로 덮으세요.
 *
 * 콘텐츠가 잘린 게 아니라 "더 있다"는 걸 알리는 장치라, 끝까지 내려가면 사라집니다.
 * 스크롤이 없는 짧은 화면에서는 아예 뜨지 않습니다.
 */
export function ScrollFade({ offset = 0, height = 32, className }: ScrollFadeProps) {
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
        'pointer-events-none fixed inset-x-0 z-30 bg-gradient-to-b from-transparent to-neutral-100 transition-opacity duration-200',
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
