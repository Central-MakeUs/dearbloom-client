const filters = ['전체', '졸업스냅', '우정스냅', '커플스냅', '가족스냅'] as const;

const saved = [
  { id: 'snap-1', title: '벚꽃엔딩', artist: '하늘 스튜디오', location: '서울', price: 150_000 },
  { id: 'snap-3', title: '가을 프리즘', artist: '노을 필름', location: '경기', price: 180_000 },
  { id: 'snap-5', title: '한강 스냅', artist: '나비 스튜디오', location: '서울', price: 130_000 },
  { id: 'snap-8', title: '캠퍼스 라이트', artist: '무브먼트', location: '서울', price: 145_000 },
];

export default function SavedPage() {
  const header = (
    <header className="mb-4 px-4 pt-6">
      <h1 className="text-head-1 text-neutral-950">내 저장</h1>
      <p className="mt-1 text-caption-1 text-neutral-600">저장한 작품 {saved.length}개</p>
    </header>
  );

  const filterBar = (
    <div className="mb-3 flex gap-2 overflow-x-auto px-4 pb-3">
      {filters.map((f, i) => (
        <button
          key={f}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-body-3 transition-colors ${
            i === 0 ? 'bg-primary text-neutral-0' : 'bg-neutral-0 text-neutral-700 border border-neutral-200'
          }`}
          type="button"
        >
          {f}
        </button>
      ))}
    </div>
  );

  const grid = (
    <div className="grid grid-cols-2 gap-3 px-4">
      {saved.map((p) => (
        <a key={p.id} href={`/snaps/${p.id}`} className="flex flex-col">
          <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-br from-primary-100 to-primary-300">
            <button
              type="button"
              aria-label="저장 취소"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-0/85 text-primary backdrop-blur"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
          <div className="line-clamp-1 text-body-4 text-neutral-900">{p.title}</div>
          <div className="text-caption-2 text-neutral-600">
            {p.artist} · {p.location}
          </div>
          <div className="mt-1 text-body-3 text-neutral-950">{p.price.toLocaleString()}원</div>
        </a>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-md">
      {header}
      {filterBar}
      {grid}
    </div>
  );
}
