import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Users,
  MonitorPlay,
  Plus,
  Check,
  BadgeCheck,
} from "lucide-react";
import { Stars } from "./Stars";
import {
  initials,
  MODE_LABEL,
  CURRICULUM_LABEL,
  subjectLabel,
  governorateLabel,
  type Teacher,
} from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  const { cart, toggleCart } = useDroosy();
  const { lang, t, pick } = useI18n();
  const inCart = cart.includes(teacher.id);
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);

  return (
    <article className="surface-card flex flex-col overflow-hidden">
      <div className={`h-1.5 w-full bg-gradient-to-r ${teacher.accent}`} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${teacher.accent} text-lg font-bold text-on-brand`}
          >
            {initials(teacher.name)}
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-base font-bold text-foreground">
              <span className="truncate">{pick(teacher.name, teacher.nameAr)}</span>
              {teacher.verified && (
                <BadgeCheck size={15} className="shrink-0 text-primary" />
              )}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {L(subjectLabel(teacher.subject))}
              </span>
              {teacher.modes.includes("manasa") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  <MonitorPlay size={12} /> {L(MODE_LABEL.manasa)}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">
              {teacher.area} · {L(governorateLabel(teacher.region))}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Users size={14} className="shrink-0" />
            {teacher.students.toLocaleString()} {t("students")} ·{" "}
            {teacher.pricePerSession.toLocaleString()} {t("per_session")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Stars value={teacher.rating} />
          <span className="text-sm font-semibold text-foreground">
            {teacher.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {teacher.curricula.slice(0, 3).map((c) => (
            <span
              key={c}
              className="rounded-lg bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/80"
            >
              {L(CURRICULUM_LABEL[c])}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {teacher.modes.map((m) => (
            <span
              key={m}
              className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {L(MODE_LABEL[m])}
            </span>
          ))}
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Button asChild className="flex-1">
            <Link to="/teacher/$teacherId" params={{ teacherId: teacher.id }}>
              {t("book_profile")}
            </Link>
          </Button>
          <Button
            variant={inCart ? "secondary" : "outline"}
            size="icon"
            aria-label="Add to package"
            onClick={() => toggleCart(teacher.id)}
          >
            {inCart ? <Check size={16} /> : <Plus size={16} />}
          </Button>
        </div>
      </div>
    </article>
  );
}
