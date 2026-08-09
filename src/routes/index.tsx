import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Search, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/droosy/Chrome";
import { TeacherCard } from "@/components/droosy/TeacherCard";
import {
  AREAS,
  BUNDLES,
  MODE_LABEL,
  SUBJECTS,
  TEACHERS,
  getTeacher,
  type Mode,
} from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Droosy — Find Every Teacher and Center in One Place" },
      {
        name: "description",
        content:
          "Droosy helps students find private teachers, learning centers and online Manasa platforms by subject and area, with ratings, bundles and one shared schedule.",
      },
      { property: "og:title", content: "Droosy — All your teachers in one place" },
      {
        property: "og:description",
        content:
          "Discover rated teachers by subject and area, bundle multiple subjects with a discount, and keep every session in one schedule.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { q } = Route.useSearch();
  const { location, setLocation } = useDroosy();
  const [query, setQuery] = useState(q ?? "");
  const [subject, setSubject] = useState<string>("All subjects");
  const [mode, setMode] = useState<string>("All modes");

  const teachers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TEACHERS.filter((t) => {
      if (subject !== "All subjects" && t.subject !== subject) return false;
      if (location !== "All areas" && t.area !== location) return false;
      if (mode !== "All modes" && !t.modes.includes(mode as Mode)) return false;
      if (
        needle &&
        !`${t.name} ${t.subject} ${t.centerName} ${t.area}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [query, subject, location, mode]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="gradient-soft border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Sparkles size={13} /> Less stress, more studying
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Find all your teachers in one place and{" "}
            <span className="text-gradient-brand">save your time</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Compare private teachers, centers and online platforms by subject,
            area and real student reviews — then book everything on one calendar.
          </p>

          <div className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl bg-card p-2 shadow-[var(--shadow-soft)] sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “Physics in Sweifieh” or a teacher name"
                className="h-12 border-none pl-9 shadow-none focus-visible:ring-0"
              />
            </div>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-12 sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["All subjects", ...SUBJECTS].map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  subject === s
                    ? "gradient-brand text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <section>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold tracking-tight">
                Featured packages
              </h2>
              <p className="text-sm text-muted-foreground">
                Bundle several subjects with one click and pay less per session.
              </p>
            </div>
            <Link
              to="/packages"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
            >
              See all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {BUNDLES.map((b) => (
              <Link
                key={b.id}
                to="/packages"
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-primary-foreground shadow-[var(--shadow-lift)] ${b.accent}`}
              >
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
                  Save {Math.round(b.discount * 100)}%
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{b.title}</h3>
                <p className="mt-1 text-sm opacity-90">{b.tagline}</p>
                <p className="mt-5 text-xs font-semibold opacity-90">
                  {b.teacherIds
                    .map((id) => getTeacher(id)?.subject)
                    .filter(Boolean)
                    .join(" + ")}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 truncate text-2xl font-extrabold tracking-tight">
              {teachers.length} teacher{teachers.length === 1 ? "" : "s"} available
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All modes">All modes</SelectItem>
                  {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODE_LABEL[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {teachers.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="font-semibold">No teachers match these filters yet.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setSubject("All subjects");
                  setMode("All modes");
                  setLocation("All areas");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teachers.map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
