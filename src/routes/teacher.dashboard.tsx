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
  getMyTeacherProfile,
  updateTeacherProfile,
  updateTeacherSlots,
} from "@/lib/teacher.functions";

export const Route = createFileRoute("/teacher/dashboard")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      teacherId: (search["teacherId"] as string) || undefined,
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
  const { teacherId: searchTeacherId } = Route.useSearch();
  const { user, authReady, profile, isAdmin, teacherId } = useDroosy();
  const getProfile = useServerFn(getMyTeacherProfile);
  const updateProfile = useServerFn(updateTeacherProfile);
  const updateSlots = useServerFn(updateTeacherSlots);
  const navigate = useNavigate();

  const [tab, setTab] = useState<"profile" | "availability">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile({ data: { teacherId: searchTeacherId } });
      if (!data) {
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
      if (savedSlots.length === 0) {
        setSlots([
          { day: "Saturday", times: [] },
          { day: "Sunday", times: [] },
          { day: "Monday", times: [] },
          { day: "Tuesday", times: [] },
          { day: "Wednesday", times: [] },
          { day: "Thursday", times: [] },
          { day: "Friday", times: [] },
        ]);
      } else {
        setSlots(savedSlots);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load your teacher profile");
    } finally {
      setLoading(false);
    }
  }, [getProfile, searchTeacherId]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    // Allow teachers and admins (admins may be editing a teacher via ?teacherId=...)
    if (profile?.role !== "teacher" && !isAdmin) {
      void navigate({ to: "/" });
      return;
    }
    void loadProfile();
  }, [authReady, user, profile, isAdmin, navigate, loadProfile]);

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
      toast.error("Please fill all required fields.");
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
      toast.success("Profile updated successfully");
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
      toast.success("Availability updated successfully");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addTime = (dayIdx: number) => {
    const time = window.prompt("Enter time (e.g., '14:00' or '2:00 PM')");
    if (!time || !time.trim()) return;
    setSlots((prev) => {
      const next = [...prev];
      const slot = next[dayIdx];
      if (!slot) return next;
      if (!slot.times.includes(time.trim())) {
        slot.times = [...slot.times, time.trim()].sort();
      }
      return next;
    });
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
          <h1 className="text-3xl font-extrabold text-foreground">Teacher Dashboard</h1>
          <p className="mt-4 text-muted-foreground">
            You do not have a verified teacher profile yet.
          </p>
          <Button asChild className="mt-6">
            <Link to="/teach">Apply to teach</Link>
          </Button>
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
              <GraduationCap size={14} /> Teacher Dashboard
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
              Manage your profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your details and availability up to date so students can book you.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/teacher/$teacherId" params={{ teacherId: id }}>
              View public profile <ExternalLink size={16} className="ml-2" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              tab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={16} /> Profile Details
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
            <CalendarDays size={16} /> Availability
          </button>
        </div>

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="mt-8 space-y-6 max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="td-fn">Full name (English) *</Label>
                <Input id="td-fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="td-fnar">Full name (Arabic)</Label>
                <Input
                  id="td-fnar"
                  value={fullNameAr}
                  onChange={(e) => setFullNameAr(e.target.value)}
                />
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
                <Label htmlFor="td-area">Area / district *</Label>
                <Input id="td-area" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="td-cn">Center name</Label>
                <Input
                  id="td-cn"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="td-ca">Center address</Label>
                <Input
                  id="td-ca"
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="td-price">Price per session (EGP) *</Label>
                <Input
                  id="td-price"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="td-platform">Platform URL</Label>
                <Input
                  id="td-platform"
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
              <Label htmlFor="td-bio">Bio / about</Label>
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
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save Profile
            </Button>
          </form>
        )}

        {tab === "availability" && (
          <div className="mt-8 max-w-3xl">
            <p className="text-sm text-muted-foreground mb-6">
              Add the times you are available to teach. Students can select these times when booking
              you. Make sure to format times clearly (e.g. "4:00 PM" or "16:00").
            </p>

            <div className="space-y-6">
              {slots.map((dayObj, dayIdx) => (
                <div key={dayObj.day} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">{dayObj.day}</h3>
                    <Button variant="outline" size="sm" onClick={() => addTime(dayIdx)}>
                      <Plus size={16} className="mr-2" /> Add Time
                    </Button>
                  </div>

                  {dayObj.times.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No times set for {dayObj.day}.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dayObj.times.map((time) => (
                        <div
                          key={time}
                          className="flex items-center gap-2 rounded-xl bg-muted pl-3 pr-2 py-1.5 text-sm font-semibold text-foreground"
                        >
                          {time}
                          <button
                            type="button"
                            onClick={() => removeTime(dayIdx, time)}
                            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            title="Remove time"
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
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save Availability
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
