export function ConfirmDialog({
  isOpen,
  isPending = false,
  message,
  onCancel,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  isPending?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal>
      <button
        aria-label="닫기"
        className="absolute inset-0 bg-neutral-950/70"
        disabled={isPending}
        onClick={onCancel}
        type="button"
      />
      <div className="relative w-[303px] rounded-md bg-neutral-0 p-4">
        <div className="flex flex-col items-center gap-2.5 pb-6 pt-3">
          <h2 className="text-head-3 text-neutral-950">{title}</h2>
          <p className="text-center text-body-6 text-neutral-800">{message}</p>
        </div>
        <div className="flex gap-2.5">
          <button
            className="h-12 flex-1 rounded-[6px] bg-neutral-200 text-body-1 text-neutral-800 disabled:opacity-40"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="h-12 flex-1 rounded-[6px] bg-primary text-body-1 text-neutral-0 disabled:opacity-40"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? '처리 중…' : '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}
