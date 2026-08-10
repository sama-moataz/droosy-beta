import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDroosy } from "@/lib/droosy-store";
import { useI18n } from "@/lib/i18n";
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

function AuthPage() {
  const { t } = useI18n();
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

  const emailSchema = z.string().trim().email(t("auth_val_email")).max(255);
  const passwordSchema = z.string().min(6, t("auth_val_password")).max(72);
  const nameSchema = z.string().trim().min(2, t("auth_val_name")).max(80);

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
            data: { full_name: name.data, role: accountType },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session && data.user) {
          await supabase.from("profiles").update({ role: accountType }).eq("id", data.user.id);
        }
        if (!data.session) {
          setSent(true);
          return;
        }
        toast.success(t("auth_toast_welcome"));
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
        toast.success(t("auth_toast_signed_in"));
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
          <span className="text-2xl font-extrabold tracking-tight">{t("brand")}</span>
        </Link>

        <div className="surface-card p-7">
          {sent ? (
            <div className="text-center">
              <h1 className="text-xl font-extrabold">{t("auth_sent_title")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("auth_sent_body", { email })}</p>
              <Button
                variant="outline"
                className="mt-5 w-full"
                onClick={() => {
                  setSent(false);
                  setMode("signin");
                }}
              >
                {t("auth_sent_back")}
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {mode === "signin" ? t("auth_title_signin") : t("auth_title_signup")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin" ? t("auth_sub_signin") : t("auth_sub_signup")}
              </p>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                {mode === "signup" && (
                  <>
                    <div className="space-y-3">
                      <Label>{t("auth_role_label")}</Label>
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
                          {t("auth_role_student")}
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
                          {t("auth_role_teacher")}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">{t("auth_label_name")}</Label>
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
                  <Label htmlFor="email">{t("auth_label_email")}</Label>
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
                  <Label htmlFor="password">{t("auth_label_password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth_placeholder_password")}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  {mode === "signin" ? t("auth_btn_signin") : t("auth_btn_signup")}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "signin" ? t("auth_prompt_new") : t("auth_prompt_existing")}{" "}
                <button
                  type="button"
                  className="font-semibold text-primary ms-1"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? t("auth_switch_signup") : t("auth_switch_signin")}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">{t("footer_credits")}</p>
      </div>
    </div>
  );
}
