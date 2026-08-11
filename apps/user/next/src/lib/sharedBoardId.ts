export function parseSharedBoardId(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

export const isSharedBoardOwner = (
  customerId: number,
  members: readonly { customerId: number }[],
) => members[0]?.customerId === customerId;
