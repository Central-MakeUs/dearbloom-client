import { useLayoutEffect, useRef, useState } from 'react';
import { ArtworkImageHeader } from './ArtworkImageHeader';

interface Props {
  backHref: string;
  images: Array<{ url: string; universityName: string | null }>;
  initialIndex: number;
  title: string;
}

export function ArtworkImageViewer({ backHref, images, initialIndex, title }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = scroller.clientWidth * initialIndex;
    setReady(true);
  }, [initialIndex]);

  const photoFrame = (image: Props['images'][number], index: number) => (
    <div className="relative aspect-[375/494] max-h-full w-full max-w-md overflow-hidden">
      <img
        src={image.url}
        alt={`${title} ${index + 1}번 사진`}
        className="absolute inset-0 size-full object-contain"
        draggable={false}
      />
    </div>
  );

  const slides = images.map((image, index) => (
    <div
      key={`${image.url}-${index}`}
      className="flex h-full w-full shrink-0 snap-center items-center justify-center py-[52px]"
    >
      {photoFrame(image, index)}
    </div>
  ));

  const counter = (
    <div className="flex items-center gap-0.5 text-body-1" aria-live="polite">
      <strong className="font-semibold text-neutral-950">{currentIndex + 1}</strong>
      <span className="text-neutral-600">/</span>
      <span className="text-neutral-600">{images.length}</span>
    </div>
  );

  const currentSchool = images[currentIndex]?.universityName;
  const schoolBadge = currentSchool ? (
    <span
      className="pointer-events-none absolute bottom-4 right-4 z-20 rounded-[6px] bg-neutral-950/40 px-3 py-2 text-body-5 text-neutral-0"
      aria-live="polite"
    >
      {currentSchool}
    </span>
  ) : null;

  const initialImage = !ready ? (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 py-[52px]">
      {photoFrame(images[initialIndex]!, initialIndex)}
    </div>
  ) : null;

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-100">
      <ArtworkImageHeader backHref={backHref} right={counter} className="absolute inset-x-0 top-0" />
      {initialImage}
      {schoolBadge}
      <div
        ref={scrollerRef}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const { clientWidth, scrollLeft } = event.currentTarget;
          if (clientWidth > 0) setCurrentIndex(Math.round(scrollLeft / clientWidth));
        }}
      >
        {slides}
      </div>
    </main>
  );
}
