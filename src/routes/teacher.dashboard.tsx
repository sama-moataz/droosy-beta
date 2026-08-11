import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  GraduationCap,
  CalendarDays,
  User,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  Wallet,
  Users,
  Star,
  LayoutDashboard,
} from "lucide-react";
import { Header, Footer } from "@/components/droosy/Chrome";
import { useDroosy } from "@/lib/droosy-store";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, dayLabel } from "@/lib/i18n";
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

// Predefined time slots from 8:00 AM to 10:00 PM in 30-minute increments
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 22; h++) {
  for (const m of [0, 30]) {
    if (h === 22 && m === 30) continue;
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? "PM" : "AM";
    const mm = m === 0 ? "00" : "30";
    TIME_SLOTS.push(`${hour12}:${mm} ${ampm}`);
  }
}
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
  getMyTeacherProfile,
  updateTeacherProfile,
  updateTeacherSlots,
  deleteTeacherListing,
  getTeacherAnalytics,
} from "@/lib/teacher.functions";
import { Stars } from "@/components/droosy/Stars";
import { relativeDate } from "@/lib/droosy-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/teacher/dashboard")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      teacherId: (search["teacherId"] as string) || undefined,
      tab: (search["tab"] as "overview" | "profile" | "availability" | undefined) || undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Teacher Dashboard — Droosy" }],
  }),
  component: TeacherDashboard,
});

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

function TeacherDashboard() {
  const { teacherId: searchTeacherId, tab: searchTab } = Route.useSearch();
  const { user, authReady, profile, isAdmin } = useDroosy();
  const { t, lang, pick } = useI18n();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);

  const getProfile = useServerFn(getMyTeacherProfile);
  const updateProfile = useServerFn(updateTeacherProfile);
  const updateSlots = useServerFn(updateTeacherSlots);
  const deleteListingFn = useServerFn(deleteTeacherListing);
  const getAnalytics = useServerFn(getTeacherAnalytics);
  const navigate = useNavigate();

  const [tab, setTab] = useState<"overview" | "availability" | "profile">(
    searchTab === "availability"
      ? "availability"
      : searchTab === "profile"
        ? "profile"
        : "overview",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteListing = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteListingFn({ data: { id } });
      toast.success(t("td_toast_deleted"));
      // Full reload so the store re-reads teacher ownership for the nav.
      window.location.assign(searchTeacherId ? "/admin" : "/");
    } catch (err) {
      toast.error((err as Error).message);
      setDeleting(false);
    }
  };

  // Profile state
  const [id, setId] = useState("");
  const [fullName, setFullName] = useState("");
  const [fullNameAr, setFullNameAr] = useState("");
  const [subject, setSubject] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [area, setArea] = useState("");
  const [centerName, setCenterName] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [modes, setModes] = useState<Mode[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  // Slots state
  const [slots, setSlots] = useState<{ day: string; times: string[] }[]>([]);

  // Teacher analytics — fetched via server function (bypasses RLS)
  const [teacherBookings, setTeacherBookings] = useState<
    {
      id: string;
      user_id: string;
      day: string | null;
      time: string | null;
      student_name: string;
    }[]
  >([]);
  const [teacherReviews, setTeacherReviews] = useState<
    {
      id: string;
      student_name: string;
      rating: number;
      body: string;
      created_at: string;
      verified: boolean;
    }[]
  >([]);
  const [teacherRating, setTeacherRating] = useState<number | null>(null);
  const [teacherPrice, setTeacherPrice] = useState<number>(0);

  const [appStatus, setAppStatus] = useState<string | null>(null);

  // Fetch analytics via server fn when teacher id is known (works for both owner and admin)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void getAnalytics({ data: { teacherId: id } })
      .then((res) => {
        if (cancelled) return;
        setTeacherBookings(res.bookings);
        setTeacherReviews(res.reviews);
        setTeacherRating(res.rating);
        setTeacherPrice(res.pricePerSession);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [id, getAnalytics]);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile(
        searchTeacherId ? { data: { teacherId: searchTeacherId } } : undefined,
      );
      if (!data) {
        if (user) {
          const { data: appData } = await supabase
            .from("teacher_applications")
            .select("status")
            .eq("user_id", user.id)
            .maybeSingle();
          if (appData) setAppStatus(appData.status);
        }
        setLoading(false);
        return;
      }
      setId(data.id);
      setFullName(data.name);
      setFullNameAr(data.name_ar || "");
      setSubject(data.subject);
      setGovernorate(data.region);
      setArea(data.area);
      setCenterName(data.center_name || "");
      setCenterAddress(data.center_address || "");
      setPlatformUrl(data.platform_url || "");
      setPrice(String(data.price_per_session || ""));
      setBio(data.bio);
      setModes((data.modes as Mode[]) || []);
      setCurricula((data.curricula as Curriculum[]) || []);
      setGrades((data.grades as Grade[]) || []);

      const savedSlots = (data.slots as { day: string; times: string[] }[]) || [];
      const ALL_DAYS = [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ];
      const mergedSlots = ALL_DAYS.map((dayName) => {
        const found = savedSlots.find((s) => s.day.toLowerCase() === dayName.toLowerCase());
        return {
          day: dayName,
          times: found ? found.times : [],
        };
      });
      setSlots(mergedSlots);
    } catch (err) {
      console.error(err);
      toast.error(t("td_toast_load_err"));
    } finally {
      setLoading(false);
    }
  }, [getProfile, searchTeacherId, t, user]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    void (async () => {
      // Allow teachers and admins (admins may be editing a teacher via ?teacherId=...)
      if (profile?.role !== "teacher" && !isAdmin && !searchTeacherId) {
        // Also allow if this user owns a teacher record or has a teacher application
        const [{ data: ownedTeacher }, { data: teacherApp }] = await Promise.all([
          supabase.from("teachers").select("id").eq("owner_id", user.id).maybeSingle(),
          supabase.from("teacher_applications").select("id").eq("user_id", user.id).maybeSingle(),
        ]);
        if (!ownedTeacher && !teacherApp) {
          void navigate({ to: "/" });
          return;
        }
      }
      void loadProfile();
    })();
  }, [authReady, user, profile, isAdmin, searchTeacherId, navigate, loadProfile]);

  const toggle = <T extends string>(value: T, list: T[], set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const saveProfile = async (e: React.FormEvent) => {
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

    setSaving(true);
    try {
      await updateProfile({
        data: {
          id,
          name: fullName,
          nameAr: fullNameAr,
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
        },
      });
      toast.success(t("td_toast_profile_updated"));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveSlots = async () => {
    setSaving(true);
    try {
      await updateSlots({
        data: {
          id,
          slots: slots.filter((s) => s.times.length > 0),
        },
      });
      toast.success(t("td_toast_avail_updated"));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Per-day selected time for the dropdown
  const [selectedTime, setSelectedTime] = useState<Record<number, string>>({});

  const addTime = (dayIdx: number) => {
    const time = selectedTime[dayIdx];
    if (!time) return;
    setSlots((prev) => {
      const next = [...prev];
      const slot = next[dayIdx];
      if (!slot) return next;
      if (!slot.times.includes(time)) {
        slot.times = [...slot.times, time].sort();
      }
      return next;
    });
    setSelectedTime((prev) => ({ ...prev, [dayIdx]: "" }));
  };

  const removeTime = (dayIdx: number, timeToRemove: string) => {
    setSlots((prev) => {
      const next = [...prev];
      const slot = next[dayIdx];
      if (!slot) return next;
      slot.times = slot.times.filter((t) => t !== timeToRemove);
      return next;
    });
  };

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex max-w-5xl items-center justify-center py-20 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
        </main>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-3xl font-extrabold text-foreground">{t("td_dashboard_title")}</h1>
          {appStatus === "pending" ? (
            <div className="mt-6 rounded-3xl border border-primary/30 bg-brand-soft p-8">
              <div className="flex items-center gap-2 text-base font-bold text-primary">
                <CheckCircle2 size={20} />
                <span>{t("application_pending")}</span>
              </div>
              <p className="mt-2 text-sm text-secondary-foreground/80">
                Your application is currently under review by our admin team. Once approved, your
                teacher dashboard and timetable manager will be fully activated here.
              </p>
              <Button asChild size="sm" className="mt-5">
                <Link to="/teach">{t("sch_view_profile")}</Link>
              </Button>
            </div>
          ) : appStatus === "rejected" ? (
            <div className="mt-6 rounded-3xl border border-border bg-card p-8">
              <p className="font-bold text-foreground">{t("application_rejected")}</p>
              <Button asChild size="sm" className="mt-5">
                <Link to="/teach">{t("resubmit_application")}</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-4 text-muted-foreground">{t("td_no_profile_title")}</p>
              <Button asChild className="mt-6">
                <Link to="/teach">{t("td_apply_btn")}</Link>
              </Button>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <GraduationCap size={14} /> {t("td_dashboard_title")}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
              {t("td_manage_profile")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("td_manage_sub")}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/teacher/$teacherId" params={{ teacherId: id }}>
              {t("td_view_public")} <ExternalLink size={16} className="ms-2 rtl-flip" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              tab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard size={16} /> Overview & Analytics
          </button>
          <button
            type="button"
            onClick={() => setTab("availability")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              tab === "availability"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays size={16} /> {t("td_tab_availability")}
          </button>
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              tab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={16} /> {t("td_tab_profile")}
          </button>
        </div>

        {tab === "overview" && (
          <div className="mt-8 space-y-8">
            {/* Analytics Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Total Revenue
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Wallet size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
                  {(teacherBookings.length * (teacherPrice || Number(price || 0))).toLocaleString()}{" "}
                  <span className="text-sm font-bold text-muted-foreground">EGP</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  From {teacherBookings.length} session booking
                  {teacherBookings.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Total Students
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Users size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
                  {new Set(
                    teacherBookings.map((b) => b.user_id).filter(Boolean),
                  ).size.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Enrolled student audience</p>
              </div>

              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Booked Sessions
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <CalendarDays size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
                  {teacherBookings.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Active student class slots</p>
              </div>

              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Teacher Rating
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Star size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
                  {(teacherReviews.length > 0
                    ? teacherReviews.reduce((sum, r) => sum + r.rating, 0) / teacherReviews.length
                    : (teacherRating ?? 0)
                  ).toFixed(1)}{" "}
                  <span className="text-sm font-bold text-muted-foreground">/ 5.0</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Verified student feedback</p>
              </div>
            </div>

            {/* Upcoming Teaching Classes List */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    Upcoming Teaching Classes
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Classes booked by students for your profile
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setTab("availability")}>
                  <Clock size={14} className="me-1.5" /> Manage Open Slots
                </Button>
              </div>

              {teacherBookings.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    No sessions booked by students yet for your open slots.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Ensure your available time slots are up to date so students can find and book
                    your classes.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setTab("availability")}>
                    Set Available Hours
                  </Button>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-border">
                  {teacherBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 font-bold text-primary">
                          {String(b.day ?? "").slice(0, 3)}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {String(b.day ?? "")} at {String(b.time ?? "")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground/80">
                              {b.student_name || "Enrolled Student"}
                            </span>{" "}
                            · {subject || "Private Session"} · {centerName || "Center / Online"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {Number(price || 0)} EGP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Reviews Section */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">Student Reviews</h2>
                  <p className="text-xs text-muted-foreground">
                    Feedback left by verified students
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {teacherReviews.length} {teacherReviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {teacherReviews.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    No student reviews received yet for your profile.
                  </p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-border">
                  {teacherReviews.map((r) => (
                    <div key={r.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{r.student_name}</span>
                          {r.verified && (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {relativeDate(r.created_at)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <Stars value={r.rating} />
                        <span className="text-xs font-bold">{r.rating}.0</span>
                      </div>
                      <p className="mt-2 text-sm text-foreground/90">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="mt-8 space-y-6 max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="td-fn">{t("full_name")} *</Label>
                <Input id="td-fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="td-fnar">{t("full_name_ar")}</Label>
                <Input
                  id="td-fnar"
                  value={fullNameAr}
                  onChange={(e) => setFullNameAr(e.target.value)}
                />
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
                <Label htmlFor="td-area">{t("area")} *</Label>
                <Input id="td-area" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="td-cn">{t("center_name")}</Label>
                <Input
                  id="td-cn"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="td-ca">{t("center_address")}</Label>
                <Input
                  id="td-ca"
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="td-price">{t("price")} *</Label>
                <Input
                  id="td-price"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="td-platform">{t("platform_url")}</Label>
                <Input
                  id="td-platform"
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
              <Label htmlFor="td-bio">{t("bio")}</Label>
              <Textarea
                id="td-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={1200}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin me-2" />
              ) : (
                <Save size={16} className="me-2" />
              )}
              {t("td_save_profile")}
            </Button>
          </form>
        )}

        {tab === "availability" && (
          <div className="mt-8 max-w-3xl">
            <p className="text-sm text-muted-foreground mb-6">{t("td_avail_sub")}</p>

            <div className="space-y-6">
              {slots.map((dayObj, dayIdx) => (
                <div key={dayObj.day} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-bold text-foreground">
                      {dayLabel(dayObj.day, lang)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedTime[dayIdx] ?? ""}
                        onValueChange={(v) => setSelectedTime((prev) => ({ ...prev, [dayIdx]: v }))}
                      >
                        <SelectTrigger className="w-[140px]">
                          <Clock size={14} className="me-1.5 text-muted-foreground" />
                          <SelectValue placeholder={t("td_select_time")} />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.filter((ts) => !dayObj.times.includes(ts)).map((ts) => (
                            <SelectItem key={ts} value={ts}>
                              {ts}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTime(dayIdx)}
                        disabled={!selectedTime[dayIdx]}
                      >
                        <Plus size={16} className="me-1" /> {t("td_add_time")}
                      </Button>
                    </div>
                  </div>

                  {dayObj.times.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      {t("td_no_times_set", { day: dayLabel(dayObj.day, lang) })}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dayObj.times.map((time) => (
                        <div
                          key={time}
                          className="flex items-center gap-2 rounded-xl bg-muted pl-3 pr-2 py-1.5 text-sm font-semibold text-foreground rtl:pl-2 rtl:pr-3"
                        >
                          {time}
                          <button
                            type="button"
                            onClick={() => removeTime(dayIdx, time)}
                            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            title={t("td_remove_time")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button onClick={saveSlots} disabled={saving}>
                {saving ? (
                  <Loader2 size={16} className="animate-spin me-2" />
                ) : (
                  <Save size={16} className="me-2" />
                )}
                {t("td_save_availability")}
              </Button>
            </div>
          </div>
        )}

        <section className="mt-14 rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
          <h2 className="text-lg font-extrabold text-destructive">{t("td_danger_zone")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("td_delete_sub")}</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4" disabled={deleting}>
                {deleting ? (
                  <Loader2 size={16} className="animate-spin me-2" />
                ) : (
                  <Trash2 size={16} className="me-2" />
                )}
                {t("td_delete_listing")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("td_delete_confirm_title")}</AlertDialogTitle>
                <AlertDialogDescription>{t("td_delete_confirm_body")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("td_delete_cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void deleteListing();
                  }}
                >
                  {t("td_delete_confirm_btn")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </main>

      <Footer />
    </div>
  );
}
