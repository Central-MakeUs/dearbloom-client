'use client';

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const NATIVE_EXIT_CONFIRM = 'NATIVE_EXIT_CONFIRM';
const NATIVE_EXIT_REQUEST = 'NATIVE_EXIT_REQUEST';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}

/** Android 하드웨어 뒤로가기에서 요청받는 앱 종료 확인 모달. */
export function NativeExitDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(NATIVE_EXIT_REQUEST, show);

    return () => window.removeEventListener(NATIVE_EXIT_REQUEST, show);
  }, []);

  const confirmExit = () => {
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: NATIVE_EXIT_CONFIRM }));
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>디어블룸을 종료할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            진행 중인 화면은 그대로 저장되지 않을 수 있어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction variant="danger" onClick={confirmExit}>
            종료
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
