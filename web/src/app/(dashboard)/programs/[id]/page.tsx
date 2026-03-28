import { ProgramDetailClient } from "@/components/programs/program-detail-client";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProgramDetailClient programId={id} />;
}
