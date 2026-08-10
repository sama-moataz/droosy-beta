import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminApplication = {
  id: string;
  userId: string;
  fullName: string;
  fullNameAr: string;
  phone: string;
  subject: string;
  governorate: string;
  area: string;
  centerName: string;
  centerAddress: string;
  modes: string[];
  curricula: string[];
  grades: string[];
  pricePerSession: number;
  bio: string;
  platformUrl: string | null;
  nationalIdLast4: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  idDocumentUrl: string | null;
  credentialDocumentUrl: string | null;
};

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: data === true };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminApplication[]> => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (admin !== true) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("teacher_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sign = async (path: string | null) => {
      if (!path) return null;
      const { data: signed } = await supabaseAdmin.storage
        .from("teacher-verification")
        .createSignedUrl(path, 60 * 30);
      return signed?.signedUrl ?? null;
    };

    return Promise.all(
      (data ?? []).map(async (a) => ({
        id: a.id,
        userId: a.user_id,
        fullName: a.full_name,
        fullNameAr: a.full_name_ar,
        phone: a.phone,
        subject: a.subject,
        governorate: a.governorate,
        area: a.area,
        centerName: a.center_name,
        centerAddress: a.center_address,
        modes: a.modes ?? [],
        curricula: a.curricula ?? [],
        grades: a.grades ?? [],
        pricePerSession: Number(a.price_per_session ?? 0),
        bio: a.bio,
        platformUrl: a.platform_url,
        nationalIdLast4: a.national_id_last4,
        status: a.status,
        reviewNote: a.review_note,
        createdAt: a.created_at,
        idDocumentUrl: await sign(a.id_document_path),
        credentialDocumentUrl: await sign(a.credential_document_path),
      })),
    );
  });

export const reviewApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        note: z.string().max(600).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (admin !== true) throw new Error("Forbidden");

    const { data: app, error: readErr } = await context.supabase
      .from("teacher_applications")
      .select("*")
      .eq("id", data.id)
      .single();
    if (readErr || !app) throw new Error("Application not found");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.decision === "approved") {
      const { data: existingTeachers } = await supabaseAdmin
        .from("teachers")
        .select("id")
        .eq("owner_id", app.user_id)
        .limit(1);

      const slug =
        app.full_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || "teacher";
      
      const teacherId = existingTeachers?.[0]?.id || `${slug}-${app.id.slice(0, 6)}`;

      const { error: upErr } = await supabaseAdmin.from("teachers").upsert(
        {
          id: teacherId,
          owner_id: app.user_id,
          name: app.full_name,
          name_ar: app.full_name_ar,
          subject: app.subject,
          area: app.area,
          region: app.governorate,
          center_name: app.center_name,
          center_address: app.center_address,
          map_query: [app.center_name, app.area, app.governorate, "Egypt"]
            .filter(Boolean)
            .join(", "),
          modes: app.modes ?? [],
          curricula: app.curricula ?? [],
          grades: app.grades ?? [],
          price_per_session: app.price_per_session,
          bio: app.bio,
          bio_ar: "",
          platform_url: app.platform_url,
          verified: true,
        },
        { onConflict: "id" },
      );
      if (upErr) throw upErr;

      await supabaseAdmin
        .from("profiles")
        .update({ role: "teacher" })
        .eq("id", app.user_id);
    }

    const { error: statusErr } = await supabaseAdmin
      .from("teacher_applications")
      .update({ status: data.decision, review_note: data.note ?? null })
      .eq("id", data.id);
    if (statusErr) throw statusErr;

    return { ok: true };
  });
