import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  MapPin,
  Search,
  Layers,
  LogOut,
} from "lucide-react";
import { initials } from "@/lib/droosy-data";
import { AREAS } from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function Header() {
  const { location, setLocation, cart, bookings, user, profile, signOut } =
    useDroosy();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:flex lg:gap-5">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-brand text-primary-foreground">
            <BookOpen size={18} />
          </span>
          <span className="truncate text-xl font-extrabold tracking-tight">
            Droosy
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <MapPin size={16} className="text-primary" />
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[190px] border-none bg-brand-soft font-medium">
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

        <form
          className="relative hidden flex-1 lg:block"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/", search: { q } });
          }}
        >
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a teacher, subject or center…"
            className="rounded-xl bg-muted/60 pl-9"
          />
        </form>

        <nav className="flex items-center gap-1.5">
          <Link
            to="/schedule"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-brand-soft hover:text-secondary-foreground"
            activeProps={{ className: "bg-brand-soft text-secondary-foreground" }}
          >
            <CalendarDays size={16} />
            <span className="hidden sm:inline">My Schedule</span>
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
            <span className="hidden sm:inline">Packages</span>
            {cart.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                {cart.length}
              </span>
            )}
          </Link>
          {user ? (
            <div className="ml-1 flex items-center gap-1.5">
              <span
                title={profile?.fullName || user.email || ""}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-sm font-bold text-primary-foreground"
              >
                {profile?.fullName
                  ? initials(profile.fullName)
                  : (user.email ?? "?").slice(0, 1).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                }}
                aria-label="Sign out"
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-brand-soft hover:text-secondary-foreground"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-1 rounded-xl gradient-brand px-3.5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-brand-soft/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-extrabold text-foreground">Droosy</p>
          <p>All your teachers, centers and platforms in one calm place.</p>
        </div>
        <p className="text-xs">Idea by Rokaya, Sama, Haneen, and Sajda.</p>
      </div>
    </footer>
  );
}
