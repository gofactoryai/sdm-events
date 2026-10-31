import { DealershipForm } from "@/components/Forms";
import { requireRole } from "@/lib/session";

export default async function ClientNewDealership({ searchParams }: { searchParams: Promise<{ return?: string }> }) {
  await requireRole("client");
  const { return: returnTo } = await searchParams;
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="h1 mb-4">New dealership</h1>
      <DealershipForm isAdmin={false} clients={[]} returnTo={returnTo?.startsWith("/") ? returnTo : undefined} />
    </div>
  );
}
