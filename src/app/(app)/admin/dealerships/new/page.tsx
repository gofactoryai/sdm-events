import { DealershipForm } from "@/components/Forms";
import { listClients } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function NewDealership({ searchParams }: { searchParams: Promise<{ return?: string }> }) {
  await requireRole("admin");
  const { return: returnTo } = await searchParams;
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="h1 mb-4">New dealership</h1>
      <DealershipForm isAdmin clients={listClients()} returnTo={returnTo?.startsWith("/") ? returnTo : undefined} />
    </div>
  );
}
