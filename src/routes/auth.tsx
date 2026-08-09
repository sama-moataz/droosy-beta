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

export const Route = createFileRoute("/auth")({
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
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72);
const nameSchema = z.string().trim().min(2, "Enter your name").max(80);

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user, authReady } = useDroosy();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (authReady && user) void navigate({ to: "/", replace: true });
  }, [authReady, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mail = emailSchema.safeParse(email);
    if (!mail.success) { toast.error(mail.error.issues[0]!.message); return; }
    const pass = passwordSchema.safeParse(password);
    if (!pass.success) { toast.error(pass.error.issues[0]!.message); return; }

    setBusy(true);
    try {
      if (mode === "signup") {
        const name = nameSchema.safeParse(fullName);
        if (!name.success) { toast.error(name.error.issues[0]!.message); return; }
        const { data, error } = await supabase.auth.signUp({
          email: mail.data,
          password: pass.data,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.data, role },
          },
        });
        if (error) { toast.error(error.message); return; }
        if (!data.session) {
          setSent(true);
          return;
        }
        toast.success("Welcome to Droosy!");
        router.invalidate();
        void navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: mail.data,
          password: pass.data,
        });
        if (error) { toast.error(error.message); return; }
        toast.success("Signed in.");
        router.invalidate();
        void navigate({ to: "/", replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center gradient-soft px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-primary-foreground">
            <BookOpen size={20} />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">Droosy</span>
        </Link>

        <div className="surface-card p-7">
          {sent ? (
            <div className="text-center">
              <h1 className="text-xl font-extrabold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Open it to
                activate your account, then come back and sign in.
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
                    <div className="space-y-1.5">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["student", "teacher"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                              role === r
                                ? "gradient-brand text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
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
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
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
