import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Layers, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Header, Footer } from "@/components/droosy/Chrome";
import { initials } from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "All-in-One Packages — Droosy" },
      {
        name: "description",
        content:
          "Build a bundle of teachers across Math, Physics, Chemistry and more, and book every subject in one click with a package discount.",
      },
      { property: "og:title", content: "All-in-One Packages — Droosy" },
      {
        property: "og:description",
        content:
          "Pick teachers across multiple subjects and book them together with a bundle discount.",
      },
    ],
  }),
  component: Packages,
});

function Packages() {
  const {
    cart,
    toggleCart,
    clearCart,
    addBookings,
    teachers: TEACHERS,
    bundles: BUNDLES,
    getTeacher,
  } = useDroosy();
  const [openBundle, setOpenBundle] = useState<string | null>(null);

  const picked = useMemo(
    () => cart.map((id) => getTeacher(id)).filter(Boolean),
    [cart, getTeacher],
  );
  const subtotal = picked.reduce((s, t) => s + (t?.pricePerSession ?? 0), 0);
  const discount = picked.length >= 3 ? 0.2 : picked.length === 2 ? 0.1 : 0;
  const total = Math.round(subtotal * (1 - discount) * 100) / 100;

  const bookAll = async (ids: string[], bundleId?: string) => {
    const wanted = ids
      .map((id) => getTeacher(id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => {
        const day = t.slots[0]!;
        return { teacherId: t.id, day: day.day, time: day.times[0]!, bundleId };
      });
    const added = await addBookings(wanted);
    if (added === "auth") {
      toast.error("Sign in to book a package.");
      return;
    }
    if (added === 0) toast.error("All those slots clash with classes you already booked.");
    else toast.success(`${added} session${added === 1 ? "" : "s"} added to your schedule.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">All-in-One Packages</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Choose a ready bundle, or build your own mix of teachers across subjects. Two subjects
          save 10%, three or more save 20%.
        </p>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {BUNDLES.map((b) => {
            const teachers = b.teacherIds
              .map((id) => getTeacher(id))
              .filter((t): t is NonNullable<typeof t> => Boolean(t));
            const raw = teachers.reduce((s, t) => s + t.pricePerSession, 0);
            const price = Math.round(raw * (1 - b.discount) * 100) / 100;
            const open = openBundle === b.id;
            return (
              <article key={b.id} className="surface-card overflow-hidden">
                <div className={`bg-gradient-to-br p-6 text-on-brand ${b.accent}`}>
                  <span className="rounded-full bg-on-brand/20 px-2.5 py-1 text-xs font-bold">
                    Save {Math.round(b.discount * 100)}%
                  </span>
                  <h2 className="mt-3 text-xl font-extrabold">{b.title}</h2>
                  <p className="mt-1 text-sm opacity-90">{b.tagline}</p>
                </div>
                <div className="p-6">
                  <button
                    onClick={() => setOpenBundle(open ? null : b.id)}
                    className="text-sm font-semibold text-primary"
                  >
                    {open ? "Hide teachers" : `Show ${teachers.length} teachers`}
                  </button>
                  {open && (
                    <ul className="mt-3 space-y-2">
                      {teachers.map((t) => (
                        <li key={t.id}>
                          <Link
                            to="/teacher/$teacherId"
                            params={{ teacherId: t.id }}
                            className="flex items-center gap-3 rounded-2xl bg-muted/60 p-2.5 transition-colors hover:bg-muted"
                          >
                            <span
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-bold text-on-brand ${t.accent}`}
                            >
                              {initials(t.name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{t.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {t.subject} · {t.area}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-2xl font-extrabold">{price} EGP</span>
                    <span className="pb-1 text-sm text-muted-foreground line-through">
                      {raw} EGP
                    </span>
                  </div>
                  <Button className="mt-4 w-full" onClick={() => void bookAll(b.teacherIds, b.id)}>
                    <Sparkles size={15} /> Book the whole bundle
                  </Button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
              <Layers size={20} className="text-primary" /> Build your own package
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap teachers to add or remove them from your bundle.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {TEACHERS.map((t) => {
                const active = cart.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleCart(t.id)}
                    className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-brand-soft"
                        : "border-border bg-card hover:bg-muted/60"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-bold text-on-brand ${t.accent}`}
                    >
                      {initials(t.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {t.subject} · {t.pricePerSession} EGP
                      </span>
                    </span>
                    {active && <Check size={16} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="surface-card p-6">
              <h3 className="text-lg font-extrabold">Your package</h3>
              {picked.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nothing added yet. Pick at least two subjects to unlock a discount.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {picked.map((t) => (
                    <li
                      key={t!.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate font-medium">
                        {t!.subject} — {t!.name}
                      </span>
                      <span className="text-muted-foreground">{t!.pricePerSession} EGP</span>
                      <button
                        aria-label="Remove"
                        onClick={() => toggleCart(t!.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 space-y-1 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{subtotal} EGP</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Bundle discount</span>
                  <span>-{Math.round(discount * 100)}%</span>
                </div>
                <div className="flex justify-between text-base font-extrabold">
                  <span>Total per week</span>
                  <span>{total} EGP</span>
                </div>
              </div>

              <Button
                className="mt-5 w-full"
                disabled={picked.length === 0}
                onClick={() => {
                  void bookAll(cart, "custom");
                  clearCart();
                }}
              >
                Book all in one click
              </Button>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
