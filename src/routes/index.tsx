import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Search, Sparkles, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/droosy/Chrome";
import { TeacherCard } from "@/components/droosy/TeacherCard";
import {
  GOVERNORATES,
  MODES,
  MODE_LABEL,
  CURRICULA,
  CURRICULUM_LABEL,
  GRADES,
  GRADE_LABEL,
  SUBJECTS,
  subjectLabel,
  type Mode,
  type Curriculum,
  type Grade,
} from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import { useI18n } from "@/lib/i18n";
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
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Droosy — Egypt's Teachers, Centers and Manasat in One Place" },
      {
        name: "description",
        content:
          "Find verified Egyptian teachers, centers and online manasat by subject, governorate, curriculum and grade — Thanaweya Amma, Bakalorya, IGCSE, IB and American Diploma.",
      },
      { property: "og:title", content: "Droosy — All your Egyptian teachers in one place" },
      {
        property: "og:description",
        content:
          "Compare verified teachers across Egypt by subject, governorate and curriculum, bundle subjects for a discount and book everything on one schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { q } = Route.useSearch();
  const {
    location,
    setLocation,
    teachers: allTeachers,
    bundles: BUNDLES,
    getTeacher,
    user,
    authReady,
    profile,
    isAdmin,
    teacherId,
  } = useDroosy();
  const { t, lang } = useI18n();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);

  const [query, setQuery] = useState(q ?? "");
  const [subject, setSubject] = useState("all");
  const [mode, setMode] = useState("all");
  const [curriculum, setCurriculum] = useState("all");
  const [grade, setGrade] = useState("all");

  const teachers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allTeachers.filter((teacher) => {
      if (subject !== "all" && teacher.subject !== subject) return false;
      if (location !== "all" && teacher.region !== location) return false;
      if (mode !== "all" && !teacher.modes.includes(mode as Mode)) return false;
      if (curriculum !== "all" && !teacher.curricula.includes(curriculum as Curriculum))
        return false;
      if (grade !== "all" && !teacher.grades.includes(grade as Grade)) return false;
      if (
        needle &&
        !`${teacher.name} ${teacher.nameAr} ${teacher.subject} ${teacher.centerName} ${teacher.area} ${teacher.region}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [allTeachers, query, subject, location, mode, curriculum, grade]);

  const clearFilters = () => {
    setQuery("");
    setSubject("all");
    setMode("all");
    setCurriculum("all");
    setGrade("all");
    setLocation("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="gradient-soft border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Sparkles size={13} /> {t("hero_badge")}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            {t("hero_title_1")} <span className="text-gradient-brand">{t("hero_title_2")}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">{t("hero_sub")}</p>

          <div className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl bg-card p-2 shadow-[var(--shadow-soft)] sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("hero_search_placeholder")}
                className="h-12 border-none shadow-none focus-visible:ring-0 ltr:pl-9 rtl:pr-9"
              />
            </div>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-12 sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_areas")}</SelectItem>
                {GOVERNORATES.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {L(g.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSubject("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                subject === "all"
                  ? "gradient-brand text-on-brand"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("all_subjects")}
            </button>
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  subject === s.id
                    ? "gradient-brand text-on-brand"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {L(s.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <section>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {t("featured_packages")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("featured_packages_sub")}</p>
            </div>
            <Link
              to="/packages"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
            >
              {t("see_all")} <ArrowRight size={15} className="rtl-flip" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {BUNDLES.map((b) => (
              <Link
                key={b.id}
                to="/packages"
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-on-brand shadow-[var(--shadow-lift)] ${b.accent}`}
              >
                <span className="rounded-full bg-on-brand/20 px-2.5 py-1 text-xs font-bold">
                  {t("save")} {Math.round(b.discount * 100)}%
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{b.title}</h3>
                <p className="mt-1 text-sm opacity-90">{b.tagline}</p>
                <p className="mt-5 text-xs font-semibold opacity-90">
                  {b.teacherIds
                    .map((id) => {
                      const teacher = getTeacher(id);
                      return teacher ? L(subjectLabel(teacher.subject)) : null;
                    })
                    .filter(Boolean)
                    .join(" + ")}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              {teachers.length} {t("teachers_available")}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={curriculum} onValueChange={setCurriculum}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_curricula")}</SelectItem>
                  {CURRICULA.map((c) => (
                    <SelectItem key={c} value={c}>
                      {L(CURRICULUM_LABEL[c])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_grades")}</SelectItem>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {L(GRADE_LABEL[g])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_modes")}</SelectItem>
                  {MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {L(MODE_LABEL[m])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={clearFilters}>
                {t("clear_filters")}
              </Button>
            </div>
          </div>

          {teachers.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="font-semibold text-foreground">{t("no_match")}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  {t("clear_filters")}
                </Button>
                {/* Teach on Droosy CTA */}
                {authReady && !isAdmin && (!user || profile?.role === "teacher" || teacherId) && (
                  <Button asChild>
                    <Link to={user && teacherId ? "/teacher/dashboard" : "/teach"}>
                      {user && teacherId ? t("nav_teacher_dashboard") : t("no_match_cta")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
