export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <h1>채팅 상세 (Customer)</h1>
      <p>route: /chats/[id]</p>
      <p>id: {id}</p>
    </>
  );
}
