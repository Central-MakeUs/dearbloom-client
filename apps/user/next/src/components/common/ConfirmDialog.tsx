import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@dearbloom/ui';

export function ConfirmDialog({
  isError = false,
  isOpen,
  isPending = false,
  message,
  onCancel,
  onConfirm,
  title,
}: {
  isError?: boolean;
  isOpen: boolean;
  isPending?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isPending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={isError ? 'text-danger' : undefined}>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? '처리 중…' : '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
