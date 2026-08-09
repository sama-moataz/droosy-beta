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
import { MODE_LABEL, initials, type Teacher } from "@/lib/droosy-data";
import { useDroosy } from "@/lib/droosy-store";
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
  loader: async ({ params, context }) => {
    const catalog = await context.getCatalog();
    const teacher = catalog.teachers.find((t) => t.id === params.teacherId);
    if (!teacher) throw notFound();
    return { teacher };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Teacher not found — Droosy" },
          { name: "robots", content: "noindex" },
        ],
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
  const { reviews, addReview, addBooking, cart, toggleCart, user } =
    useDroosy();
  const [slot, setSlot] = useState<{ day: string; time: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [student, setStudent] = useState("");
  const [open, setOpen] = useState(false);

  const list = reviews.filter((r) => r.teacherId === teacher.id);
  const inCart = cart.includes(teacher.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to teachers
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <section className="surface-card overflow-hidden">
              <div className={`h-24 w-full bg-gradient-to-r ${teacher.accent}`} />
              <div className="-mt-10 px-6 pb-6">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4">
                  <div
                    className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-card bg-gradient-to-br ${teacher.accent} text-2xl font-extrabold text-primary-foreground`}
                  >
                    {initials(teacher.name)}
                  </div>
                  <div className="min-w-0 pb-1">
                    <h1 className="truncate text-2xl font-extrabold tracking-tight">
                      {teacher.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {teacher.subject} · {teacher.centerName}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Stars value={teacher.rating} />
                    <strong>{teacher.rating.toFixed(1)}</strong>
                    <span className="text-muted-foreground">
                      ({list.length} reviews)
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users size={15} /> {teacher.students.toLocaleString()} students
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={15} /> {teacher.area}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {teacher.bio}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {teacher.modes.map((m) => (
                    <span
                      key={m}
                      className="rounded-xl bg-brand-soft px-3 py-1 text-xs font-semibold text-secondary-foreground"
                    >
                      {MODE_LABEL[m]}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {teacher.manasa && (
                    <Button asChild variant="outline" size="sm">
                      <a href={teacher.manasa} target="_blank" rel="noreferrer">
                        <MonitorPlay size={15} /> Open Manasa
                        <ExternalLink size={13} />
                      </a>
                    </Button>
                  )}
                  {teacher.youtube && (
                    <Button asChild variant="outline" size="sm">
                      <a href={teacher.youtube} target="_blank" rel="noreferrer">
                        <Youtube size={15} /> YouTube channel
                        <ExternalLink size={13} />
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={inCart ? "secondary" : "default"}
                    onClick={() => toggleCart(teacher.id)}
                  >
                    {inCart ? "Added to my package" : "Add to my package"}
                  </Button>
                </div>
              </div>
            </section>

            <section className="surface-card p-6">
              <h2 className="text-lg font-extrabold">Center location</h2>
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
                  Get directions <ExternalLink size={13} />
                </a>
              </Button>
            </section>

            <section className="surface-card p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="min-w-0 text-lg font-extrabold">
                  Student reviews
                </h2>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Write a review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate {teacher.name}</DialogTitle>
                      <DialogDescription>
                        Your honest feedback helps other students choose calmly.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Stars value={rating} size={26} onSelect={setRating} />
                      <Input
                        value={student}
                        onChange={(e) => setStudent(e.target.value)}
                        placeholder="Your name"
                      />
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What was helpful about the sessions?"
                        rows={4}
                      />
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (!text.trim()) {
                            toast.error("Please write a short review first.");
                            return;
                          }
                          void addReview({
                            teacherId: teacher.id,
                            student: student.trim() || "Anonymous student",
                            rating,
                            text: text.trim(),
                          }).then((res) => {
                            if (res === "auth") {
                              toast.error("Sign in to publish a review.");
                              return;
                            }
                            if (res !== "ok") {
                              toast.error("Could not publish your review.");
                              return;
                            }
                            setText("");
                            setStudent("");
                            setOpen(false);
                            toast.success("Thanks! Your review is published.");
                          });
                        }}
                      >
                        Publish review
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ul className="mt-5 space-y-4">
                {list.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    No reviews yet — be the first.
                  </li>
                )}
                {list.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-muted/50 p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <p className="min-w-0 truncate text-sm font-bold">
                        {r.student}{" "}
                        {r.verified && (
                          <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                            Verified
                          </span>
                        )}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {r.date}
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
                <CalendarDays size={18} className="text-primary" /> Pick a slot
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {teacher.pricePerSession} JD per session
              </p>
              <div className="mt-4 space-y-3">
                {teacher.slots.map((d) => (
                  <div key={d.day}>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {d.day}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {d.times.map((time) => {
                        const active = slot?.day === d.day && slot?.time === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setSlot({ day: d.day, time })}
                            className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
                              active
                                ? "gradient-brand text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
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
                    toast.error("Choose a day and time first.");
                    return;
                  }
                  void addBooking({
                    teacherId: teacher.id,
                    day: slot.day,
                    time: slot.time,
                  }).then((res) => {
                    if (res === "auth")
                      toast.error("Sign in to book a session.");
                    else if (res !== "ok")
                      toast.error(
                        `You already have a class on ${slot.day} at ${slot.time}.`,
                      );
                    else
                      toast.success(
                        `Booked ${slot.day} ${slot.time} with ${teacher.name}.`,
                      );
                  });
                }}
              >
                Book this session
              </Button>
              <Link
                to="/schedule"
                className="mt-3 block text-center text-sm font-semibold text-primary"
              >
                View my schedule
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
