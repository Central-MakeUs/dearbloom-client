export default async function ArtistChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <h1>Artist 채팅 상세</h1>
      <p>route: /artist/chats/[id]</p>
      <p>id: {id}</p>
    </>
  );
}
