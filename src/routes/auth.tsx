import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDroosy } from "@/lib/droosy-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Redirect targets are whitelisted (not an arbitrary string) so this can never become an
// open redirect, and so it stays valid against the typed router route tree.
const ALLOWED_REDIRECTS = ["/", "/teach"] as const;
type RedirectTarget = (typeof ALLOWED_REDIRECTS)[number];

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: RedirectTarget } => {
    const r = search["redirect"];
    return typeof r === "string" && (ALLOWED_REDIRECTS as readonly string[]).includes(r)
      ? { redirect: r as RedirectTarget }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Sign in or create your account — Droosy" },
      {
        name: "description",
        content:
          "Create a free Droosy account to save your bookings, write reviews and keep every teacher in one schedule.",
      },
      { property: "og:title", content: "Sign in to Droosy" },
      {
        property: "og:description",
        content: "Save your schedule, book packages and review your teachers.",
      },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const nameSchema = z.string().trim().min(2, "Enter your name").max(80);

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [accountType, setAccountType] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user, authReady } = useDroosy();
  const { redirect } = Route.useSearch();
  const destination = redirect ?? "/";
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (authReady && user) void navigate({ to: destination, replace: true });
  }, [authReady, user, destination, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mail = emailSchema.safeParse(email);
    if (!mail.success) {
      toast.error(mail.error.issues[0]!.message);
      return;
    }
    const pass = passwordSchema.safeParse(password);
    if (!pass.success) {
      toast.error(pass.error.issues[0]!.message);
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const name = nameSchema.safeParse(fullName);
        if (!name.success) {
          toast.error(name.error.issues[0]!.message);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: mail.data,
          password: pass.data,
          options: {
            emailRedirectTo: window.location.origin,
            // Note: the backend trigger may use this 'role' metadata to populate the profiles table.
            data: { full_name: name.data, role: accountType },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        // Attempt to eagerly update the profile if a session was returned and RLS permits it.
        if (data.session && data.user) {
          await supabase.from("profiles").update({ role: accountType }).eq("id", data.user.id);
        }
        if (!data.session) {
          setSent(true);
          return;
        }
        toast.success("Welcome to Droosy!");
        router.invalidate();
        void navigate({ to: destination, replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: mail.data,
          password: pass.data,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Signed in.");
        router.invalidate();
        void navigate({ to: destination, replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center gradient-soft px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-on-brand">
            <BookOpen size={20} />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">Droosy</span>
        </Link>

        <div className="surface-card p-7">
          {sent ? (
            <div className="text-center">
              <h1 className="text-xl font-extrabold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Open it to activate your
                account, then come back and sign in.
              </p>
              <Button
                variant="outline"
                className="mt-5 w-full"
                onClick={() => {
                  setSent(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to see your schedule and bookings."
                  : "Save your bookings, reviews and packages in one place."}
              </p>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                {mode === "signup" && (
                  <>
                    <div className="space-y-3">
                      <Label>I want to use Droosy as a</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAccountType("student")}
                          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors ${
                            accountType === "student"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountType("teacher")}
                          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors ${
                            accountType === "teacher"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Teacher
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rokaya Ahmad"
                        maxLength={80}
                        autoComplete="name"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New to Droosy?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-semibold text-primary"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Idea by Rokaya, Sama, Haneen, and Sajda.
        </p>
      </div>
    </div>
  );
}
