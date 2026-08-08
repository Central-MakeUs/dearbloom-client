type MemberProfiles = {
  hasArtist: boolean;
  hasCustomer: boolean;
};

export function getMemberHome(activeRole: string | undefined, member: MemberProfiles) {
  return member.hasArtist && (activeRole === 'ARTIST' || !member.hasCustomer)
    ? '/app/artist/dashboard'
    : '/snaps';
}
