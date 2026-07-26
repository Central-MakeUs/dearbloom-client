export function shouldForceOnboarding(value?: string | null) {
  const isNonProduction =
    process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

  return isNonProduction && value === '1';
}
