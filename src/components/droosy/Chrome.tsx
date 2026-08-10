import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  MapPin,
  Search,
  Layers,
  LogOut,
  Moon,
  Sun,
  Languages,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { initials, GOVERNORATES } from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import { useI18n } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-brand-soft hover:text-secondary-foreground"
    >
      {children}
    </button>
  );
}

export function Header() {
  const {
    location,
    setLocation,
    cart,
    bookings,
    user,
    profile,
    isAdmin,
    teacherId,
    authReady,
    signOut,
  } = useDroosy();
  const { t, lang, toggleLang, theme, toggleTheme } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:flex lg:gap-5">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-brand text-on-brand">
            <BookOpen size={18} />
          </span>
          <span className="truncate text-xl font-extrabold tracking-tight">{t("brand")}</span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <MapPin size={16} className="text-primary" />
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[190px] border-none bg-brand-soft font-medium text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_areas")}</SelectItem>
              {GOVERNORATES.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {lang === "ar" ? g.label.ar : g.label.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form
          className="relative hidden flex-1 lg:block"
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/", search: { q } });
          }}
        >
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search_placeholder")}
            className="rounded-xl bg-muted/60 ltr:pl-9 rtl:pr-9"
          />
        </form>

        <nav className="flex items-center gap-1.5">
          <IconButton onClick={toggleLang} label={t("lang_toggle")}>
            <span className="flex items-center gap-1 text-xs font-bold">
              <Languages size={16} />
            </span>
          </IconButton>
          <IconButton onClick={toggleTheme} label={t("theme_toggle")}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
          {authReady && !isAdmin && (!user || profile?.role === "teacher") && (
            <Link
              to={user && teacherId ? "/teacher/dashboard" : "/teach"}
              className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-brand-soft hover:text-secondary-foreground sm:inline-flex"
              activeProps={{ className: "bg-brand-soft text-secondary-foreground" }}
            >
              <GraduationCap size={16} />
              <span className="hidden lg:inline">
                {user && teacherId ? t("nav_teacher_dashboard") : t("nav_teach")}
              </span>
            </Link>
          )}
          <Link
            to="/schedule"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-brand-soft hover:text-secondary-foreground"
            activeProps={{ className: "bg-brand-soft text-secondary-foreground" }}
          >
            <CalendarDays size={16} />
            <span className="hidden sm:inline">{t("nav_schedule")}</span>
            {bookings.length > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {bookings.length}
              </span>
            )}
          </Link>
          <Link
            to="/packages"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-brand-soft hover:text-secondary-foreground"
            activeProps={{ className: "bg-brand-soft text-secondary-foreground" }}
          >
            <Layers size={16} />
            <span className="hidden sm:inline">{t("nav_packages")}</span>
            {cart.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                {cart.length}
              </span>
            )}
          </Link>
          {/* Admin link: Add Teacher */}
          {authReady && isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-brand-soft hover:text-secondary-foreground"
              activeProps={{ className: "bg-brand-soft text-secondary-foreground" }}
            >
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">{t("nav_add_teacher")}</span>
            </Link>
          )}
          {/* Auth actions: only render after authReady to prevent flicker */}
          {authReady &&
            (user ? (
              <div className="ms-1 flex items-center gap-1.5">
                <span
                  title={profile?.fullName || user.email || ""}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-on-brand"
                >
                  {profile?.fullName
                    ? initials(profile.fullName)
                    : (user.email ?? "?").slice(0, 1).toUpperCase()}
                </span>
                <IconButton
                  onClick={() => {
                    void signOut();
                  }}
                  label={t("nav_signout")}
                >
                  <LogOut size={16} />
                </IconButton>
              </div>
            ) : (
              <Link
                to="/auth"
                className="ms-1 rounded-xl gradient-brand px-3.5 py-2 text-sm font-semibold text-on-brand"
              >
                {t("nav_signin")}
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-border bg-brand-soft/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-extrabold text-foreground">{t("brand")}</p>
          <p>{t("tagline")}</p>
        </div>
        <p className="text-xs">Idea by Rokaya, Sama, Haneen, and Sajda.</p>
      </div>
    </footer>
  );
}
