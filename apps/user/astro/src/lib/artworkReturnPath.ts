const SHARED_BOARD_PATH = /^\/app\/boards\/[1-9]\d*$/;

export const getArtworkBackHref = (returnTo: string | null) =>
  returnTo && SHARED_BOARD_PATH.test(returnTo) ? returnTo : '/snaps';
