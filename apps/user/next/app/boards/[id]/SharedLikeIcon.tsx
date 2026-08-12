interface SharedLikeIconProps {
  active: boolean;
}

export function SharedLikeIcon({ active }: SharedLikeIconProps) {
  const vector = active ? (
    <img
      src="/app/images/shared-like-active.svg"
      alt=""
      className="absolute left-[7px] top-[3px] h-[18px] w-[13.7605px]"
    />
  ) : (
    <img
      src="/app/images/shared-like-inactive.svg"
      alt=""
      className="absolute left-[6.25px] top-[2.25px] h-[19.5px] w-[15.2606px]"
    />
  );

  return (
    <span aria-hidden className="relative size-6 shrink-0 overflow-hidden">
      <span className="absolute bottom-[3px] left-[2px] top-[8px] w-[3px] rounded-[1px] bg-neutral-0" />
      {vector}
    </span>
  );
}
