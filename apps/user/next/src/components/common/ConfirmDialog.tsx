import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Spinner,
} from '@dearbloom/ui';

export function ConfirmDialog({
  cancelLabel = '취소',
  confirmLabel = '확인',
  isDestructive = false,
  isError = false,
  isOpen,
  isPending = false,
  message,
  onCancel,
  onConfirm,
  title,
}: {
  /**
   * 되돌리기 버튼 문구. 기본값 '취소' 는 "무엇을 취소할까요?" 류의 질문에서
   * 확인 버튼과 뜻이 겹쳐 보이므로, 그런 화면에서는 '돌아가기' 처럼 바꿔주세요.
   */
  cancelLabel?: string;
  /** 실행 버튼 문구. '확인' 보다 실제 행동을 적는 편이 오탭을 줄입니다. */
  confirmLabel?: string;
  /** 되돌릴 수 없는 행동이면 실행 버튼을 danger 로 — 초록 버튼은 긍정 액션처럼 보인다. */
  isDestructive?: boolean;
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
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className="gap-2"
            disabled={isPending}
            variant={isDestructive ? 'danger' : undefined}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? <Spinner className="size-5 text-current" label="" /> : null}
            {isPending ? '처리 중…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
