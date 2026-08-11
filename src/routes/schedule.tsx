import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, Clock, MapPin, Trash2 } from "lucide-react";
import { Header, Footer } from "@/components/droosy/Chrome";
import { initials, subjectLabel } from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
              <CalendarDays size={26} className="text-primary" />
              {isTeacher ? "Teaching Schedule" : t("sch_title")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isTeacher
                ? "View every student session booked for your teaching profile in one calm timetable."
                : bookings.length === 0
                  ? t("sch_empty_sub")
                  : t("sch_count_sub", {
                      n: bookings.length,
                      plural: bookings.length === 1 ? "" : "s",
                    })}
            </p>
          </div>
          {isTeacher && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/teacher/dashboard" search={{ tab: "availability", teacherId: undefined }}>
                Manage Open Availability
              </Link>
            </Button>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-14 text-center">
            <p className="font-semibold">{t("sch_empty_free")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isTeacher
                ? "As students book sessions from your open availability, your teaching schedule will populate here automatically."
                : t("sch_empty_hint")}
            </p>
            <Button asChild className="mt-5">
              <Link to={isTeacher ? "/teacher/dashboard" : "/"}>
                {isTeacher ? "Manage Available Slots" : t("sch_browse_btn")}
              </Link>
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
