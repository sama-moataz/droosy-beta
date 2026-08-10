import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  FileText,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Header, Footer } from "@/components/droosy/Chrome";
import { useDroosy } from "@/lib/droosy-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GOVERNORATES,
  SUBJECTS,
  MODES,
  MODE_LABEL,
  CURRICULA,
  CURRICULUM_LABEL,
  GRADES,
  GRADE_LABEL,
  type Mode,
  type Curriculum,
  type Grade,
} from "@/lib/droosy-data";
import {
  listApplications,
  reviewApplication,
  adminCreateTeacher,
  type AdminApplication,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Droosy" },
      {
        name: "description",
        content: "Droosy admin dashboard: review teacher applications and add teachers directly.",
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

// ── Chip toggle used in both the teach form and the admin add-teacher form ──
function Chips<T extends string>({
  items,
  label,
  selected,
  onToggle,
}: {
  items: readonly T[];
  label: (v: T) => string;
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((v) => {
        const active = selected.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => onToggle(v)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? "border-transparent gradient-brand text-on-brand"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {label(v)}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Add Teacher Form — admin-only direct teacher creation
// ════════════════════════════════════════════════════════════════════════════════
function AddTeacherForm({ onCreated }: { onCreated: () => void }) {
  const createTeacher = useServerFn(adminCreateTeacher);

  const [fullName, setFullName] = useState("");
  const [fullNameAr, setFullNameAr] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [area, setArea] = useState("");
  const [centerName, setCenterName] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [modes, setModes] = useState<Mode[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [busy, setBusy] = useState(false);

  const toggle = <T extends string>(value: T, list: T[], set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const reset = () => {
    setFullName("");
    setFullNameAr("");
    setPhone("");
    setSubject("");
    setGovernorate("");
    setArea("");
    setCenterName("");
    setCenterAddress("");
    setPlatformUrl("");
    setPrice("");
    setBio("");
    setOwnerEmail("");
    setModes([]);
    setCurricula([]);
    setGrades([]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !subject ||
      !governorate ||
      !area.trim() ||
      modes.length === 0 ||
      curricula.length === 0 ||
      grades.length === 0
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    setBusy(true);
    try {
      await createTeacher({
        data: {
          fullName,
          fullNameAr,
          phone,
          subject,
          governorate,
          area,
          centerName,
          centerAddress,
          platformUrl,
          pricePerSession: Number(price || 0),
          bio,
          modes,
          curricula,
          grades,
          ownerEmail: ownerEmail.trim() || undefined,
        },
      });
      toast.success(`Teacher "${fullName}" created successfully.`);
      reset();
      onCreated();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="at-fn">Full name (English) *</Label>
          <Input id="at-fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-fnar">Full name (Arabic)</Label>
          <Input id="at-fnar" value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="at-phone">Phone</Label>
          <Input id="at-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-email">Owner email (optional)</Label>
          <Input
            id="at-email"
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="user@example.com"
          />
          <p className="text-xs text-muted-foreground">
            If this teacher has a Droosy account, enter their email to link it.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Subject *</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Governorate *</Label>
          <Select value={governorate} onValueChange={setGovernorate}>
            <SelectTrigger>
              <SelectValue placeholder="Select governorate" />
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.label.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-area">Area / district *</Label>
          <Input id="at-area" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="at-cn">Center name</Label>
          <Input id="at-cn" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-ca">Center address</Label>
          <Input
            id="at-ca"
            value={centerAddress}
            onChange={(e) => setCenterAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="at-price">Price per session (EGP) *</Label>
          <Input
            id="at-price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-platform">Platform URL</Label>
          <Input
            id="at-platform"
            value={platformUrl}
            onChange={(e) => setPlatformUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Lesson types *</Label>
        <Chips
          items={MODES}
          label={(v) => MODE_LABEL[v].en}
          selected={modes}
          onToggle={(v) => toggle(v, modes, setModes)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Curricula *</Label>
        <Chips
          items={CURRICULA}
          label={(v) => CURRICULUM_LABEL[v].en}
          selected={curricula}
          onToggle={(v) => toggle(v, curricula, setCurricula)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Grade levels *</Label>
        <Chips
          items={GRADES}
          label={(v) => GRADE_LABEL[v].en}
          selected={grades}
          onToggle={(v) => toggle(v, grades, setGrades)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="at-bio">Bio / about</Label>
        <Textarea
          id="at-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={1200}
        />
      </div>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        Create teacher
      </Button>
    </form>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Admin Page
// ════════════════════════════════════════════════════════════════════════════════
function AdminPage() {
  const { user, authReady } = useDroosy();
  const fetchApps = useServerFn(listApplications);
  const review = useServerFn(reviewApplication);

  const [apps, setApps] = useState<AdminApplication[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);

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

        {/* ── Add Teacher section ──────────────────────────────────── */}
        <section className="mt-6">
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-on-brand">
                <Plus size={18} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-foreground">Add Teacher</h2>
                <p className="text-sm text-muted-foreground">
                  Directly create a new teacher profile without the application process.
                </p>
              </div>
            </div>
            {showAddForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showAddForm && (
            <div className="mt-2 rounded-2xl border border-border bg-card p-5">
              <AddTeacherForm onCreated={() => toast.success("Teacher added to directory.")} />
            </div>
          )}
        </section>

        {/* ── Teacher Applications section ──────────────────────────── */}
        <section className="mt-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
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
                    <Button disabled={busy === a.id} onClick={() => decide(a.id, "approved")}>
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
