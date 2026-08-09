import { Link } from "@tanstack/react-router";
import { MapPin, Users, MonitorPlay, Plus, Check } from "lucide-react";
import { Stars } from "./Stars";
import { initials, MODE_LABEL, type Teacher } from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import { Button } from "@/components/ui/button";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  const { cart, toggleCart } = useDroosy();
  const inCart = cart.includes(teacher.id);

  return (
    <article className="surface-card flex flex-col overflow-hidden">
      <div className={`h-1.5 w-full bg-gradient-to-r ${teacher.accent}`} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${teacher.accent} text-lg font-bold text-primary-foreground`}
          >
            {initials(teacher.name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold">{teacher.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {teacher.subject}
              </span>
              {teacher.manasa && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  <MonitorPlay size={12} /> Manasa
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{teacher.area}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Users size={14} className="shrink-0" />
            {teacher.students.toLocaleString()} students ·{" "}
            {teacher.pricePerSession} JD / session
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Stars value={teacher.rating} />
          <span className="text-sm font-semibold">{teacher.rating.toFixed(1)}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {teacher.modes.map((m) => (
            <span
              key={m}
              className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {MODE_LABEL[m]}
            </span>
          ))}
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Button asChild className="flex-1">
            <Link to="/teacher/$teacherId" params={{ teacherId: teacher.id }}>
              Book / View Profile
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
