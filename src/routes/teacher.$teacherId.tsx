import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  MonitorPlay,
  Users,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { Header, Footer } from "@/components/droosy/Chrome";
import { Stars } from "@/components/droosy/Stars";
import {
  subjectLabel,
  governorateLabel,
  CURRICULUM_LABEL,
  GRADE_LABEL,
  MODE_LABEL,
  initials,
  relativeDate,
  type Teacher,
} from "@/lib/droosy-data";
import { getCatalog } from "@/lib/droosy.functions";
import { useDroosy } from "@/lib/droosy-store";
import { useI18n, dayLabel } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/teacher/$teacherId")({
  loader: async ({ params }) => {
    const catalog = await getCatalog();
    const teacher = catalog.teachers.find((t) => t.id === params.teacherId);
    if (!teacher) throw notFound();
    return { teacher };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Teacher not found — Droosy" }, { name: "robots", content: "noindex" }],
      };
    const t = loaderData.teacher;
    const title = `${t.name} — ${t.subject} teacher in ${t.area} | Droosy`;
    const description = `${t.bio.slice(0, 140)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TeacherProfile,
});

function TeacherProfile() {
  const { teacher } = Route.useLoaderData() as { teacher: Teacher };
  const { addBooking, reviews, addReview, bookings, cart, toggleCart } = useDroosy();
  const { t, lang, pick } = useI18n();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);

  const [slot, setSlot] = useState<{ day: string; time: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [student, setStudent] = useState("");
  const [open, setOpen] = useState(false);

  const list = reviews.filter((r) => r.teacherId === teacher.id);
  const inCart = cart.includes(teacher.id);
  const effectiveRating =
    list.length > 0
      ? list.reduce((acc, r) => acc + r.rating, 0) / list.length
      : teacher.rating || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} className="rtl-flip" /> {t("back_teachers")}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <section className="surface-card overflow-hidden">
              <div className={`h-24 w-full bg-gradient-to-r ${teacher.accent}`} />
              <div className="-mt-10 px-6 pb-6">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4">
                  <div
                    className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-card bg-gradient-to-br ${teacher.accent} text-2xl font-extrabold text-on-brand`}
                  >
                    {initials(teacher.name)}
                  </div>
                  <div className="min-w-0 pb-1">
                    <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground">
                      {pick(teacher.name, teacher.nameAr)}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {L(subjectLabel(teacher.subject))} · {teacher.centerName}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Stars value={effectiveRating} />
                    <strong>{effectiveRating.toFixed(1)}</strong>
                    <span className="text-muted-foreground">
                      {t("tp_reviews_count", { n: list.length })}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users size={15} /> {teacher.students.toLocaleString()} {t("students")}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={15} /> {teacher.area} · {L(governorateLabel(teacher.region))}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {pick(teacher.bio, teacher.bioAr)}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {teacher.modes.map((m) => (
                    <span
                      key={m}
                      className="rounded-xl bg-brand-soft px-3 py-1 text-xs font-semibold text-secondary-foreground"
                    >
                      {L(MODE_LABEL[m])}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {teacher.curricula.map((c) => (
                    <span
                      key={c}
                      className="rounded-xl bg-muted px-3 py-1 text-xs font-semibold text-foreground/80"
                    >
                      {L(CURRICULUM_LABEL[c])}
                    </span>
                  ))}
                  {teacher.grades.map((g) => (
                    <span
                      key={g}
                      className="rounded-xl border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {L(GRADE_LABEL[g])}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {teacher.manasa && (
                    <Button asChild variant="outline" size="sm">
                      <a href={teacher.manasa} target="_blank" rel="noreferrer">
                        <MonitorPlay size={15} /> {t("tp_open_manasa")}
                        <ExternalLink size={13} className="ms-1 rtl-flip" />
                      </a>
                    </Button>
                  )}
                  {teacher.youtube && (
                    <Button asChild variant="outline" size="sm">
                      <a href={teacher.youtube} target="_blank" rel="noreferrer">
                        <Youtube size={15} /> {t("tp_youtube_channel")}
                        <ExternalLink size={13} className="ms-1 rtl-flip" />
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={inCart ? "secondary" : "default"}
                    onClick={() => toggleCart(teacher.id)}
                  >
                    {inCart ? t("tp_in_package") : t("tp_add_package")}
                  </Button>
                </div>
              </div>
            </section>

            <section className="surface-card p-6">
              <h2 className="text-lg font-extrabold">{t("tp_center_location")}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={15} /> {teacher.centerAddress}
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                <iframe
                  title={`Map of ${teacher.centerName}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(teacher.mapQuery)}&output=embed`}
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(teacher.centerAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("tp_get_directions")} <ExternalLink size={13} className="ms-1 rtl-flip" />
                </a>
              </Button>
            </section>

            <section className="surface-card p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="min-w-0 text-lg font-extrabold">{t("tp_student_reviews")}</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      {t("tp_write_review")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t("tp_rate_teacher", { name: pick(teacher.name, teacher.nameAr) })}
                      </DialogTitle>
                      <DialogDescription>{t("tp_rate_sub")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Stars value={rating} size={26} onSelect={setRating} />
                      <Input
                        value={student}
                        onChange={(e) => setStudent(e.target.value)}
                        placeholder={t("tp_your_name")}
                      />
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t("tp_review_ph")}
                        rows={4}
                      />
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (!text.trim()) {
                            toast.error(t("tp_val_write_review"));
                            return;
                          }
                          void addReview({
                            teacherId: teacher.id,
                            student: student.trim() || t("tp_toast_anon"),
                            rating,
                            text: text.trim(),
                          }).then((res) => {
                            if (res === "auth") {
                              toast.error(t("tp_toast_auth_review"));
                              return;
                            }
                            if (res !== "ok") {
                              toast.error(t("tp_toast_err_review"));
                              return;
                            }
                            setText("");
                            setStudent("");
                            setOpen(false);
                            toast.success(t("tp_toast_ok_review"));
                          });
                        }}
                      >
                        {t("tp_publish_review")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ul className="mt-5 space-y-4">
                {list.length === 0 && (
                  <li className="text-sm text-muted-foreground">{t("tp_no_reviews")}</li>
                )}
                {list.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-muted/50 p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <p className="min-w-0 truncate text-sm font-bold">
                        {r.student}{" "}
                        {r.verified && (
                          <span className="ms-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                            {t("verified")}
                          </span>
                        )}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {relativeDate(r.date, lang)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="surface-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <CalendarDays size={18} className="text-primary" /> {t("tp_pick_slot")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {teacher.pricePerSession.toLocaleString()} {t("per_session")}
              </p>
              <div className="mt-4 space-y-3">
                {teacher.slots.map((d) => (
                  <div key={d.day}>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {dayLabel(d.day, lang)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {d.times.map((time) => {
                        const isBooked = bookings.some(
                          (b) =>
                            b.teacherId === teacher.id &&
                            b.day.slice(0, 3).toLowerCase() === d.day.slice(0, 3).toLowerCase() &&
                            b.time === time,
                        );
                        const isConflict =
                          !isBooked &&
                          bookings.some(
                            (b) =>
                              b.day.slice(0, 3).toLowerCase() === d.day.slice(0, 3).toLowerCase() &&
                              b.time === time,
                          );
                        const active = slot?.day === d.day && slot?.time === time;
                        return (
                          <button
                            key={time}
                            disabled={isBooked || isConflict}
                            onClick={() => setSlot({ day: d.day, time })}
                            className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
                              isBooked || isConflict
                                ? "bg-muted/50 text-muted-foreground/50 cursor-not-allowed opacity-60"
                                : active
                                  ? "gradient-brand text-on-brand"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                            title={
                              isBooked
                                ? t("tp_already_booked_tt")
                                : isConflict
                                  ? t("tp_conflict_tt")
                                  : undefined
                            }
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="mt-6 w-full"
                onClick={() => {
                  if (!slot) {
                    toast.error(t("tp_val_choose_slot"));
                    return;
                  }
                  void addBooking({
                    teacherId: teacher.id,
                    day: slot.day,
                    time: slot.time,
                  }).then((res) => {
                    if (res === "auth") toast.error(t("tp_toast_auth_book"));
                    else if (res !== "ok")
                      toast.error(
                        t("tp_toast_conflict_book", {
                          day: dayLabel(slot.day, lang),
                          time: slot.time,
                        }),
                      );
                    else
                      toast.success(
                        t("tp_toast_ok_book", {
                          day: dayLabel(slot.day, lang),
                          time: slot.time,
                          name: pick(teacher.name, teacher.nameAr),
                        }),
                      );
                  });
                }}
              >
                {t("tp_book_btn")}
              </Button>
              <Link
                to="/schedule"
                className="mt-3 block text-center text-sm font-semibold text-primary"
              >
                {t("tp_view_schedule")}
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
