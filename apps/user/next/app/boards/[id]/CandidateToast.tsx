import { toast } from 'sonner';
import { ToastMessage } from '@dearbloom/ui';

export function showCandidateToast(message: string, status: 'error' | 'success') {
  toast.custom(
    () => (
      <div className="flex w-full justify-center">
        <ToastMessage message={message} status={status} />
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
