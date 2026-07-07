declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_WEBVIEW_URL?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
