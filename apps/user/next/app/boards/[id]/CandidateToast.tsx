import { toast } from 'sonner';

export function showCandidateToast(message: string, status: 'error' | 'success') {
  const iconSrc =
    status === 'error' ? '/app/images/toast-error.svg' : '/app/images/toast-success.svg';

  toast.custom(
    () => (
      <div className="flex w-full justify-center">
        <div
          role="status"
          className="flex items-center gap-[2px] rounded-full bg-neutral-800 px-4 py-2 text-body-6 text-neutral-0 shadow-elevation"
        >
          <span className="flex size-5 items-center justify-center">
            <img src={iconSrc} alt="" className="size-3" />
          </span>
          <span className="whitespace-nowrap">{message}</span>
        </div>
      </div>
    ),
    {
      className: `candidate-toast candidate-toast-${status}`,
      duration: 2500,
      id: `candidate-toast-${status}`,
      position: 'bottom-center',
    },
  );
}
