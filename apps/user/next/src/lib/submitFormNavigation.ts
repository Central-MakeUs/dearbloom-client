export function isNativeApp() {
  return Boolean(
    (window as Window & { __DEARBLOOM_NATIVE_APP__?: { platform?: string } })
      .__DEARBLOOM_NATIVE_APP__?.platform,
  );
}

export function submitFormNavigation(action: string, data: FormData) {
  const form = document.createElement('form');
  form.action = action;
  form.method = 'post';

  data.forEach((value, name) => {
    if (typeof value !== 'string') return;

    const input = document.createElement('input');
    input.name = name;
    input.type = 'hidden';
    input.value = value;
    form.append(input);
  });

  document.body.append(form);
  form.submit();
}
