import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/droosy/Chrome";
import { useDroosy } from "@/lib/droosy-store";
import { useI18n } from "@/lib/i18n";
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

export const Route = createFileRoute("/teach")({
  head: () => ({
    meta: [
      { title: "Teach on Droosy — Register as a Verified Egyptian Teacher" },
      {
        name: "description",
        content:
          "Egyptian teachers: create your Droosy profile, upload your national ID and teaching credential, and reach students across every governorate and curriculum.",
      },
      { property: "og:title", content: "Teach on Droosy — register and get verified" },
      {
        property: "og:description",
        content:
          "Register your teaching profile, verify your identity and start receiving bookings from students across Egypt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeachPage,
});

const schema = z.object({
  fullName: z.string().trim().min(3).max(90),
  fullNameAr: z.string().trim().max(90),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?20)?0?1[0125][0-9]{8}$/, "invalid"),
  subject: z.string().min(1),
  governorate: z.string().min(1),
  area: z.string().trim().min(2).max(90),
  pricePerSession: z.number().min(0).max(100000),
  bio: z.string().trim().max(1200),
  nationalIdLast4: z.string().regex(/^[0-9]{4}$/),
});

type Toggle<T extends string> = { items: readonly T[]; label: (v: T) => string };

function Chips<T extends string>({
  items,
  label,
  selected,
  onToggle,
}: Toggle<T> & { selected: T[]; onToggle: (v: T) => void }) {
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

function TeachPage() {
  const { t, lang } = useI18n();
  const { user, authReady } = useDroosy();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);

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
  const [idLast4, setIdLast4] = useState("");
  const [modes, setModes] = useState<Mode[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [credFile, setCredFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("teacher_applications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled && data) setStatus(data.status);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = <T extends string>(
    value: T,
    list: T[],
    set: (v: T[]) => void,
  ) => set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const freshSession = async () => {
    const { data } = await supabase.auth.getSession();
    const expiresAt = data.session?.expires_at ?? 0;
    // Refresh when the token is expired or about to expire (also covers client clock skew,
    // which the storage API reports as "exp timecheck failed").
    if (!data.session || expiresAt * 1000 - Date.now() < 5 * 60 * 1000) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      return refreshed.session ?? data.session ?? null;
    }
    return data.session;
  };

  const upload = async (file: File, kind: string) => {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user!.id}/${kind}-${Date.now()}.${ext}`;
    const attempt = async () =>
      supabase.storage.from("teacher-verification").upload(path, file, { upsert: true });

    let { error } = await attempt();
    if (error && /exp|jwt|expired/i.test(error.message)) {
      await supabase.auth.refreshSession();
      ({ error } = await attempt());
    }
    if (error) throw error;
    return path;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("sign_in_first"));
      return;
    }
    const parsed = schema.safeParse({
      fullName,
      fullNameAr,
      phone,
      subject,
      governorate,
      area,
      pricePerSession: Number(price || 0),
      bio,
      nationalIdLast4: idLast4,
    });
    if (!parsed.success || modes.length === 0 || curricula.length === 0 || grades.length === 0) {
      toast.error(t("required_fields"));
      return;
    }
    if (!idFile || !credFile) {
      toast.error(t("upload_both"));
      return;
    }
    setBusy(true);
    await freshSession();
    try {
      const [idPath, credPath] = await Promise.all([
        upload(idFile, "national-id"),
        upload(credFile, "credential"),
      ]);
      const { error } = await supabase.from("teacher_applications").upsert(
        {
          user_id: user.id,
          full_name: parsed.data.fullName,
          full_name_ar: parsed.data.fullNameAr,
          phone: parsed.data.phone,
          subject: parsed.data.subject,
          governorate: parsed.data.governorate,
          area: parsed.data.area,
          center_name: centerName,
          center_address: centerAddress,
          platform_url: platformUrl || null,
          price_per_session: parsed.data.pricePerSession,
          bio: parsed.data.bio,
          national_id_last4: parsed.data.nationalIdLast4,
          modes,
          curricula,
          grades,
          id_document_path: idPath,
          credential_document_path: credPath,
          status: "pending",
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
      setStatus("pending");
      toast.success(t("application_sent"));
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-secondary-foreground">
          <ShieldCheck size={14} /> {t("id_verification")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
          {t("teach_title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("teach_sub")}</p>

        {authReady && !user && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
            <p className="text-foreground">{t("sign_in_first")}</p>
            <Button asChild className="mt-3">
              <Link to="/auth">{t("nav_signin")}</Link>
            </Button>
          </div>
        )}

        {status === "pending" && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-primary/40 bg-brand-soft p-5 text-sm font-semibold text-secondary-foreground">
            <CheckCircle2 size={18} className="text-primary" />
            {t("application_pending")}
          </div>
        )}

        {user && (
          <form onSubmit={submit} className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fn">{t("full_name")}</Label>
                <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fna">{t("full_name_ar")}</Label>
                <Input id="fna" value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ph">{t("phone")}</Label>
                <Input id="ph" inputMode="tel" placeholder="010xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("subject")}</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("subject")} />
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
                <Label>{t("governorate")}</Label>
                <Select value={governorate} onValueChange={setGovernorate}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("governorate")} />
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
                <Label htmlFor="ar">{t("area")}</Label>
                <Input id="ar" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cn">{t("center_name")}</Label>
                <Input id="cn" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ca">{t("center_address")}</Label>
                <Input id="ca" value={centerAddress} onChange={(e) => setCenterAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pu">{t("platform_url")}</Label>
                <Input id="pu" value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr">{t("price")}</Label>
                <Input id="pr" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">{t("bio")}</Label>
              <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{t("lesson_types")}</Label>
              <Chips
                items={MODES}
                label={(m) => L(MODE_LABEL[m])}
                selected={modes}
                onToggle={(m) => toggle(m, modes, setModes)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("curricula")}</Label>
              <Chips
                items={CURRICULA}
                label={(c) => L(CURRICULUM_LABEL[c])}
                selected={curricula}
                onToggle={(c) => toggle(c, curricula, setCurricula)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("grades")}</Label>
              <Chips
                items={GRADES}
                label={(g) => L(GRADE_LABEL[g])}
                selected={grades}
                onToggle={(g) => toggle(g, grades, setGrades)}
              />
            </div>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                <ShieldCheck size={18} className="text-primary" /> {t("id_verification")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("id_verification_sub")}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="l4">{t("national_id_last4")}</Label>
                  <Input
                    id="l4"
                    inputMode="numeric"
                    maxLength={4}
                    value={idLast4}
                    onChange={(e) => setIdLast4(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="idf">{t("id_document")}</Label>
                  <Input
                    id="idf"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cdf">{t("credential_document")}</Label>
                  <Input
                    id="cdf"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setCredFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            </section>

            <Button type="submit" size="lg" disabled={busy} className="w-full">
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {t("submit_application")}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
