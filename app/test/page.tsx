import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const { data, error } = await supabase().from("workspaces").select("*");

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold">Test — Workspaces</h1>
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Test — Workspaces</h1>
      <pre className="overflow-auto rounded-md border bg-zinc-50 p-4 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
