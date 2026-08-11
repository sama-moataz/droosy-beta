import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, Trash2, CheckCircle2, Calendar } from "lucide-react";
import { Header, Footer } from "@/components/droosy/Chrome";
import { initials, subjectLabel } from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, dayLabel } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "My Schedule — Droosy" },
      {
        name: "description",
        content:
          "See every booked session across all your subjects in one weekly timetable and avoid timing conflicts.",
      },
      { property: "og:title", content: "My Schedule — Droosy" },
      {
        property: "og:description",
        content: "One weekly timetable for all your teachers, centers and online sessions.",
      },
    ],
  }),
  component: Schedule,
});

function Schedule() {
  const { bookings, removeBooking, getTeacher, user, profile, teacherId, authReady } = useDroosy();
  const { t, lang, pick } = useI18n();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);

  const isTeacher = profile?.role === "teacher" || Boolean(teacherId);

  const [teacherProfile, setTeacherProfile] = useState<{
    id: string;
    name: string;
    subject: string;
    center_name: string;
    slots: { day: string; times: string[] }[];
  } | null>(null);
  const [teacherBookings, setTeacherBookings] = useState<
    { id: string; user_id: string; day: string; time: string }[]
  >([]);

  useEffect(() => {
    if (!user || !isTeacher) return;
    let cancelled = false;
    void (async () => {
      const { data: tData } = await supabase
        .from("teachers")
        .select("id, name, subject, center_name, slots")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (tData && !cancelled) {
        setTeacherProfile({
          id: tData.id,
          name: tData.name,
          subject: tData.subject,
          center_name: tData.center_name ?? "",
          slots: (tData.slots as { day: string; times: string[] }[]) ?? [],
        });

        const { data: bData } = await supabase
          .from("bookings")
          .select("id, user_id, day, time")
          .eq("teacher_id", tData.id);

        if (!cancelled) {
          setTeacherBookings(
            (bData as { id: string; user_id: string; day: string; time: string }[]) ?? [],
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isTeacher]);

  const teacherHasSlots = (teacherProfile?.slots ?? []).some((s) => s.times.length > 0);
  const totalTeacherItems = (teacherProfile?.slots ?? []).reduce(
    (acc, s) => acc + s.times.length,
    0,
  );

  if (isTeacher) {
    const hasAnyTeachingData = teacherHasSlots || teacherBookings.length > 0;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
                <CalendarDays size={26} className="text-primary" />
                Teaching Schedule
              </h1>
              <p className="mt-2 text-muted-foreground">
                View your available teaching hours and student bookings across your weekly
                timetable.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/teacher/dashboard" search={{ tab: "availability", teacherId: undefined }}>
                Manage Open Availability
              </Link>
            </Button>
          </div>

          {!hasAnyTeachingData ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border p-14 text-center">
              <p className="font-semibold">No open hours or bookings configured</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your available hours in the Teacher Dashboard so students can find and book
                your classes.
              </p>
              <Button asChild className="mt-5">
                <Link
                  to="/teacher/dashboard"
                  search={{ tab: "availability", teacherId: undefined }}
                >
                  Set Available Hours
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {DAYS.map((day) => {
                const daySlot = (teacherProfile?.slots ?? []).find(
                  (s) => s.day.slice(0, 3).toLowerCase() === day.slice(0, 3).toLowerCase(),
                );
                const openTimes = daySlot?.times ?? [];
                const dayBookings = teacherBookings.filter(
                  (b) =>
                    String(b.day ?? "")
                      .slice(0, 3)
                      .toLowerCase() === day.slice(0, 3).toLowerCase(),
                );

                const combined = [
                  ...dayBookings.map((b) => ({
                    type: "booked" as const,
                    time: b.time,
                    id: b.id,
                  })),
                  ...openTimes
                    .filter((tStr) => !dayBookings.some((b) => b.time === tStr))
                    .map((tStr) => ({
                      type: "open" as const,
                      time: tStr,
                      id: `open-${tStr}`,
                    })),
                ].sort((a, b) => {
                  const parseTime = (tStr: string) => {
                    const parts = tStr.split(" ");
                    const timeStr = parts[0];
                    const modifier = parts[1];
                    const timeParts = timeStr?.split(":") ?? [];
                    const h = Number(timeParts[0] ?? 0);
                    const m = Number(timeParts[1] ?? 0);
                    let hours = h;
                    if (hours === 12) hours = 0;
                    if (modifier === "PM") hours += 12;
                    return hours * 60 + m;
                  };
                  return parseTime(a.time) - parseTime(b.time);
                });

                return (
                  <section key={day} className="rounded-3xl bg-muted/50 p-4">
                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                      {dayLabel(day, lang)}
                    </h2>
                    <div className="mt-3 space-y-3">
                      {combined.length === 0 && (
                        <p className="text-xs text-muted-foreground/70">{t("sch_free_day")}</p>
                      )}
                      {combined.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.type === "booked"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {item.type === "booked" ? "Booked Class" : "Open Slot"}
                            </span>
                          </div>
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Clock size={12} className="text-primary" /> {item.time}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {teacherProfile?.subject || "Subject"} ·{" "}
                            {teacherProfile?.center_name || "Center/Online"}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
              <CalendarDays size={26} className="text-primary" />
              {t("sch_title")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {bookings.length === 0
                ? t("sch_empty_sub")
                : t("sch_count_sub", {
                    n: bookings.length,
                    plural: bookings.length === 1 ? "" : "s",
                  })}
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-14 text-center">
            <p className="font-semibold">{t("sch_empty_free")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("sch_empty_hint")}</p>
            <Button asChild className="mt-5">
              <Link to="/">{t("sch_browse_btn")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {DAYS.map((day) => {
              const items = bookings
                .filter((b) => b.day.slice(0, 3).toLowerCase() === day.slice(0, 3).toLowerCase())
                .sort((a, b) => {
                  const parseTime = (tStr: string) => {
                    const parts = tStr.split(" ");
                    const timeStr = parts[0];
                    const modifier = parts[1];
                    const timeParts = timeStr?.split(":") ?? [];
                    const h = Number(timeParts[0] ?? 0);
                    const m = Number(timeParts[1] ?? 0);
                    let hours = h;
                    if (hours === 12) hours = 0;
                    if (modifier === "PM") hours += 12;
                    return hours * 60 + m;
                  };
                  return parseTime(a.time) - parseTime(b.time);
                });
              return (
                <section key={day} className="rounded-3xl bg-muted/50 p-4">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                    {dayLabel(day, lang)}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {items.length === 0 && (
                      <p className="text-xs text-muted-foreground/70">{t("sch_free_day")}</p>
                    )}
                    {items.map((b) => {
                      const teacher = getTeacher(b.teacherId);
                      if (!teacher) return null;
                      return (
                        <article
                          key={b.id}
                          className="rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]"
                        >
                          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                            <span
                              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-[11px] font-bold text-on-brand ${teacher.accent}`}
                            >
                              {initials(teacher.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {L(subjectLabel(teacher.subject))}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {pick(teacher.name, teacher.nameAr)}
                              </p>
                            </div>
                          </div>
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                            <Clock size={12} /> {b.time}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            <span className="truncate">{teacher.centerName}</span>
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <Link
                              to="/teacher/$teacherId"
                              params={{ teacherId: teacher.id }}
                              className="text-xs font-semibold text-primary"
                            >
                              {t("sch_view_profile")}
                            </Link>
                            <button
                              aria-label={t("sch_cancel_aria")}
                              onClick={() => void removeBooking(b.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
