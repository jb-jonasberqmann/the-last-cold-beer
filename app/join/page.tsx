import { redirect } from "next/navigation";

// Handles GET /join?code=XXXX from the landing page form
export default async function JoinRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }> | { code?: string };
}) {
  // Handle both Next.js 14 (sync) and 15 (async) searchParams
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const code = params.code?.trim().toUpperCase();
  if (code) {
    redirect(`/join/${code}`);
  }
  redirect("/");
}
