import { redirect } from "next/navigation";

export default async function SessaoRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/sessao/${id}/ao-vivo`);
}
