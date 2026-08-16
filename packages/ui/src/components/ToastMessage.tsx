export function ToastMessage({
  iconBasePath = '/app/images',
  message,
  status,
}: {
  iconBasePath?: string;
  message: string;
  status: 'error' | 'success';
}) {
  return (
    <div
      className="flex items-center gap-[2px] rounded-full bg-neutral-800 px-4 py-2 text-body-6 text-neutral-0 shadow-elevation"
      role="status"
    >
      <span className="flex size-5 items-center justify-center">
        <img alt="" className="size-3" src={`${iconBasePath}/toast-${status}.svg`} />
      </span>
      <span className="whitespace-nowrap">{message}</span>
    </div>
  );
}
