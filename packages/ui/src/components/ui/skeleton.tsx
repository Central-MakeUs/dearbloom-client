'use client';

import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

/**
 * 로딩 자리표시자 — `animate-pulse` + neutral-200.
 * 크기는 넘기는 클래스로 정합니다: `<Skeleton className="h-5 w-40" />`
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-neutral-200', className)} {...props} />;
}

interface SkeletonImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className'> {
  /** 이미지 영역(비율·크기·radius). 스켈레톤이 이 영역을 그대로 채웁니다. */
  className?: string;
  /** img 자체에 붙일 클래스. 기본 object-cover 를 바꿀 때만 쓰세요. */
  imgClassName?: string;
  /** 이미지 위에 겹칠 요소(하트 오버레이 등). */
  children?: ReactNode;
}

/**
 * 이미지가 뜨기 전까지 스켈레톤을 보여주는 이미지 — 목록의 썸네일용.
 *
 * src 가 없으면 스켈레톤 대신 회색 배경만 둡니다(영영 안 올 이미지를 계속 깜빡이게 두지 않기 위해).
 */
export function SkeletonImage({
  className,
  imgClassName,
  src,
  onLoad,
  onError,
  children,
  ...rest
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  /**
   * SSR 로 내려간 img 가 hydration 전에 이미 로드를 끝내면(대개 캐시) load 이벤트가
   * React 가 리스너를 붙이기 전에 지나가버려 onLoad 가 오지 않는다.
   * 마운트 후 한 번 `complete` 를 직접 확인해 그 경합을 닫는다.
   * 깨진 이미지도 complete 가 true 라, 영원히 깜빡이는 상태로 남지 않는다.
   */
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div className={cn('relative overflow-hidden bg-neutral-200', className)}>
      {src && (
        <img
          ref={imgRef}
          src={src}
          {...rest}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setLoaded(true);
            onError?.(e);
          }}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
      {src && !loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      {children}
    </div>
  );
}
