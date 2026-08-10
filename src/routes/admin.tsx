import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldCheck, FileText, Check, X } from "lucide-react";
import { Header, Footer } from "@/components/droosy/Chrome";
import { useDroosy } from "@/lib/droosy-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listApplications, type AdminApplication } from "@/lib/admin.functions";
import { reviewApplication } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Review Droosy Teacher Applications" },
      {
        name: "description",
        content:
          "Droosy admin dashboard: review Egyptian teacher applications, inspect ID and credential documents, then approve or reject them.",
      },
      { property: "og:title", content: "Droosy Admin Dashboard" },
      {
        property: "og:description",
        content: "Review and verify teacher applications on Droosy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "approved"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : status === "rejected"
        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
        : "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${tone}`}>
      {status}
    </span>
  );
}

function AdminPage() {
  const { user, authReady } = useDroosy();
  const fetchApps = useServerFn(listApplications);
  const review = useServerFn(reviewApplication);

  const [apps, setApps] = useState<AdminApplication[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const rows = await fetchApps();
      setApps(rows);
      setDenied(false);
    } catch (err) {
      console.error(err);
      setDenied(true);
      setApps([]);
    }
  }, [fetchApps]);

  useEffect(() => {
    if (!authReady || !user) return;
    void load();
  }, [authReady, user, load]);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusy(id);
    try {
      await review({ data: { id, decision, note: notes[id] ?? "" } });
      toast.success(decision === "approved" ? "Teacher approved" : "Application rejected");
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-secondary-foreground">
          <ShieldCheck size={14} /> Admin
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
          Teacher applications
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review submitted documents, then approve to publish a verified teacher profile.
        </p>

        {authReady && !user && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
            <p className="text-foreground">Sign in with your admin account to continue.</p>
            <Button asChild className="mt-3">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        )}

        {user && denied && (
          <p className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            This account does not have admin access.
          </p>
        )}

        {user && !denied && apps === null && (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading applications…
          </div>
        )}

        {user && !denied && apps?.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">No applications yet.</p>
        )}

        <div className="mt-8 space-y-5">
          {(apps ?? []).map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {a.fullName}
                    {a.fullNameAr ? ` · ${a.fullNameAr}` : ""}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {a.subject} · {a.area}, {a.governorate} · {a.pricePerSession} EGP/session
                  </p>
                </div>
                <StatusPill status={a.status} />
              </div>

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-semibold text-foreground">{a.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">National ID (last 4)</dt>
                  <dd className="font-semibold text-foreground">{a.nationalIdLast4}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Center</dt>
                  <dd className="font-semibold text-foreground">
                    {a.centerName || "—"} {a.centerAddress ? `· ${a.centerAddress}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Modes / Curricula / Grades</dt>
                  <dd className="font-semibold text-foreground">
                    {[a.modes.join(", "), a.curricula.join(", "), a.grades.join(", ")]
                      .filter(Boolean)
                      .join(" — ") || "—"}
                  </dd>
                </div>
              </dl>

              {a.bio && <p className="mt-3 text-sm text-muted-foreground">{a.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {a.idDocumentUrl && (
                  <a
                    href={a.idDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <FileText size={14} /> National ID
                  </a>
                )}
                {a.credentialDocumentUrl && (
                  <a
                    href={a.credentialDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <FileText size={14} /> Teaching credential
                  </a>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Review note (optional)"
                  value={notes[a.id] ?? ""}
                  onChange={(e) => setNotes((p) => ({ ...p, [a.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    disabled={busy === a.id}
                    onClick={() => decide(a.id, "approved")}
                  >
                    {busy === a.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy === a.id}
                    onClick={() => decide(a.id, "rejected")}
                  >
                    <X size={16} /> Reject
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
