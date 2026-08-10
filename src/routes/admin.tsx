import { createFileRoute, Link } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";
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
import { useI18n } from "@/lib/i18n";
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
  subjectLabel,
  governorateLabel,
  type Mode,
  type Curriculum,
  type Grade,
} from "@/lib/droosy-data";
import {
  listApplications,
  reviewApplication,
  adminCreateTeacher,
  listAllTeachersAdmin,
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
  const { t } = useI18n();
  const tone =
    status === "approved"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : status === "rejected"
        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
        : "bg-amber-500/15 text-amber-600 dark:text-amber-400";

  const label =
    status === "approved"
      ? t("status_approved")
      : status === "rejected"
        ? t("status_rejected")
        : t("status_pending");

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${tone}`}>{label}</span>
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
  const { t, lang } = useI18n();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);
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
      toast.error(t("required_fields"));
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
      toast.success(t("admin_toast_created", { fullName }));
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
          <Label htmlFor="at-fn">{t("full_name")} *</Label>
          <Input id="at-fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-fnar">{t("full_name_ar")}</Label>
          <Input id="at-fnar" value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="at-phone">{t("phone")}</Label>
          <Input id="at-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-email">{t("admin_owner_email_label")}</Label>
          <Input
            id="at-email"
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="user@example.com"
          />
          <p className="text-xs text-muted-foreground">{t("admin_owner_email_sub")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>{t("subject")} *</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder={t("select_subject")} />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {L(s.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t("governorate")} *</Label>
          <Select value={governorate} onValueChange={setGovernorate}>
            <SelectTrigger>
              <SelectValue placeholder={t("select_governorate")} />
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {L(g.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-area">{t("area")} *</Label>
          <Input id="at-area" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="at-cn">{t("center_name")}</Label>
          <Input id="at-cn" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-ca">{t("center_address")}</Label>
          <Input
            id="at-ca"
            value={centerAddress}
            onChange={(e) => setCenterAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="at-price">{t("price")} *</Label>
          <Input
            id="at-price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="at-platform">{t("platform_url")}</Label>
          <Input
            id="at-platform"
            value={platformUrl}
            onChange={(e) => setPlatformUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t("lesson_types")} *</Label>
        <Chips
          items={MODES}
          label={(v) => L(MODE_LABEL[v])}
          selected={modes}
          onToggle={(v) => toggle(v, modes, setModes)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t("curricula")} *</Label>
        <Chips
          items={CURRICULA}
          label={(v) => L(CURRICULUM_LABEL[v])}
          selected={curricula}
          onToggle={(v) => toggle(v, curricula, setCurricula)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t("grades")} *</Label>
        <Chips
          items={GRADES}
          label={(v) => L(GRADE_LABEL[v])}
          selected={grades}
          onToggle={(v) => toggle(v, grades, setGrades)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="at-bio">{t("bio")}</Label>
        <Textarea
          id="at-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={1200}
        />
      </div>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? (
          <Loader2 size={16} className="animate-spin me-2" />
        ) : (
          <Plus size={16} className="me-2" />
        )}
        {t("admin_create_teacher_btn")}
      </Button>
    </form>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Admin Page
// ════════════════════════════════════════════════════════════════════════════════
function AdminPage() {
  const { user, authReady } = useDroosy();
  const { t, lang, pick } = useI18n();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);

  const fetchApps = useServerFn(listApplications);
  const fetchTeachers = useServerFn(listAllTeachersAdmin);
  const review = useServerFn(reviewApplication);

  const [apps, setApps] = useState<AdminApplication[] | null>(null);
  const [teachers, setTeachers] = useState<
    Database["public"]["Tables"]["teachers"]["Row"][] | null
  >(null);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTeacherList, setShowTeacherList] = useState(false);

  const load = useCallback(async () => {
    try {
      const [rows, tRows] = await Promise.all([fetchApps(), fetchTeachers()]);
      setApps(rows);
      setTeachers(tRows);
      setDenied(false);
    } catch (err) {
      console.error(err);
      setDenied(true);
      setApps([]);
      setTeachers([]);
    }
  }, [fetchApps, fetchTeachers]);

  useEffect(() => {
    if (!authReady || !user) return;
    void load();
  }, [authReady, user, load]);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusy(id);
    try {
      await review({ data: { id, decision, note: notes[id] ?? "" } });
      toast.success(
        decision === "approved" ? t("admin_toast_approved") : t("admin_toast_rejected"),
      );
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
          <ShieldCheck size={14} /> {t("admin_badge")}
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
                <h2 className="text-lg font-extrabold text-foreground">
                  {t("admin_add_teacher_title")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("admin_add_teacher_sub")}</p>
              </div>
            </div>
            {showAddForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showAddForm && (
            <div className="mt-2 rounded-2xl border border-border bg-card p-5">
              <AddTeacherForm onCreated={() => toast.success(t("admin_toast_added"))} />
            </div>
          )}
        </section>

        {/* ── Manage Teachers section ──────────────────────────────────── */}
        <section className="mt-6">
          <button
            type="button"
            onClick={() => setShowTeacherList((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-on-brand">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-foreground">
                  {t("admin_manage_teachers_title")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("admin_manage_teachers_sub")}</p>
              </div>
            </div>
            {showTeacherList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showTeacherList && (
            <div className="mt-2 rounded-2xl border border-border bg-card p-5">
              {teachers === null ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" /> {t("admin_loading_teachers")}
                </div>
              ) : teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("admin_no_teachers")}</p>
              ) : (
                <div className="space-y-4">
                  {teachers.map((tRow) => (
                    <div
                      key={tRow.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div>
                        <h3 className="font-bold text-foreground">
                          {pick(tRow.name, tRow.name_ar ?? "")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {L(subjectLabel(tRow.subject))} • {tRow.area},{" "}
                          {L(governorateLabel(tRow.region))}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/teacher/dashboard" search={{ teacherId: tRow.id }}>
                          {t("admin_edit_teacher_btn")}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Teacher Applications section ──────────────────────────── */}
        <section className="mt-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t("admin_apps_title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("admin_apps_sub")}</p>

          {authReady && !user && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
              <p className="text-foreground">{t("admin_signin_prompt")}</p>
              <Button asChild className="mt-3">
                <Link to="/auth">{t("nav_signin")}</Link>
              </Button>
            </div>
          )}

          {user && denied && (
            <p className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {t("admin_no_access")}
            </p>
          )}

          {user && !denied && apps === null && (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> {t("admin_loading_apps")}
            </div>
          )}

          {user && !denied && apps?.length === 0 && (
            <p className="mt-8 text-sm text-muted-foreground">{t("admin_no_apps")}</p>
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
                      {L(subjectLabel(a.subject))} · {a.area}, {L(governorateLabel(a.governorate))}{" "}
                      · {a.pricePerSession} {t("per_session")}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </div>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">{t("phone")}</dt>
                    <dd className="font-semibold text-foreground">{a.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("admin_national_id_last4")}</dt>
                    <dd className="font-semibold text-foreground">{a.nationalIdLast4}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("admin_center")}</dt>
                    <dd className="font-semibold text-foreground">
                      {a.centerName || "—"} {a.centerAddress ? `· ${a.centerAddress}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("admin_modes_curricula_grades")}</dt>
                    <dd className="font-semibold text-foreground">
                      {[
                        a.modes.map((m) => L(MODE_LABEL[m as Mode])).join(", "),
                        a.curricula.map((c) => L(CURRICULUM_LABEL[c as Curriculum])).join(", "),
                        a.grades.map((g) => L(GRADE_LABEL[g as Grade])).join(", "),
                      ]
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
                      <FileText size={14} /> {t("id_document")}
                    </a>
                  )}
                  {a.credentialDocumentUrl && (
                    <a
                      href={a.credentialDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                      <FileText size={14} /> {t("credential_document")}
                    </a>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder={t("admin_review_note_ph")}
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
                      {t("admin_approve")}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy === a.id}
                      onClick={() => decide(a.id, "rejected")}
                    >
                      <X size={16} /> {t("admin_reject")}
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
