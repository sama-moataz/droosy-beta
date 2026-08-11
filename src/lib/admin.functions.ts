import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type TeacherUpdate = Database["public"]["Tables"]["teachers"]["Update"];

// Resolves an authenticated user's id from their email using the GoTrue admin API
// (service-role only -- never exposed to the client). profiles has no email column,
// so this is the only correct way to go from email -> auth user id.
async function resolveOwnerIdByEmail(email: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const target = email.trim().toLowerCase();
  const perPage = 1000;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Failed to look up user by email: ${error.message}`);
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < perPage) break; // last page reached
  }
  return null;
}

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
    if (admin !== true) throw new Error("Forbidden: Admin access required");

    const { data, error } = await context.supabase
      .from("teacher_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const sign = async (path: string | null) => {
      if (!path) return null;
      const { data: signed } = await context.supabase.storage
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

export const listAllTeachersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (admin !== true) throw new Error("Forbidden: Admin access required");

    const { data, error } = await context.supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
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
    if (admin !== true) throw new Error("Forbidden: Admin access required");

    const { data: app, error: readErr } = await context.supabase
      .from("teacher_applications")
      .select("*")
      .eq("id", data.id)
      .single();
    if (readErr || !app) throw new Error("Application not found");

    if (data.decision === "approved") {
      const { data: existingTeachers } = await context.supabase
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

      const { error: upErr } = await context.supabase.from("teachers").upsert(
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

      await context.supabase.from("profiles").update({ role: "teacher" }).eq("id", app.user_id);
    }

    const { error: statusErr } = await context.supabase
      .from("teacher_applications")
      .update({ status: data.decision, review_note: data.note ?? null })
      .eq("id", data.id);
    if (statusErr) throw statusErr;

    return { ok: true };
  });

export const adminCreateTeacher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(90),
        fullNameAr: z.string().trim().max(90).optional().default(""),
        phone: z.string().trim().max(20).optional().default(""),
        subject: z.string().min(1),
        governorate: z.string().min(1),
        area: z.string().trim().min(1).max(90),
        centerName: z.string().trim().max(200).optional().default(""),
        centerAddress: z.string().trim().max(300).optional().default(""),
        platformUrl: z.string().trim().max(500).optional().default(""),
        pricePerSession: z.number().min(0).max(100000),
        bio: z.string().trim().max(1200).optional().default(""),
        modes: z.array(z.string()).min(1),
        curricula: z.array(z.string()).min(1),
        grades: z.array(z.string()).min(1),
        ownerEmail: z.string().email().optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (admin !== true) throw new Error("Forbidden: Admin access required");

    let ownerId: string | null = null;
    if (data.ownerEmail) {
      ownerId = await resolveOwnerIdByEmail(data.ownerEmail);
      if (!ownerId) {
        throw new Error(
          `No registered user found with email "${data.ownerEmail}". The teacher will be created without a linked account; leave the email blank or double-check it.`,
        );
      }
    }

    let existingTeacherId: string | null = null;
    if (ownerId) {
      const { data: existing } = await context.supabase
        .from("teachers")
        .select("id")
        .eq("owner_id", ownerId)
        .limit(1);
      if (existing && existing.length > 0) {
        existingTeacherId = existing[0]?.id || null;
      }
    }

    const slug =
      data.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "teacher";

    const teacherId = existingTeacherId || `${slug}-${crypto.randomUUID().slice(0, 6)}`;

    const { error: upErr } = await context.supabase.from("teachers").upsert(
      {
        id: teacherId,
        owner_id: ownerId,
        name: data.fullName,
        name_ar: data.fullNameAr || "",
        subject: data.subject,
        area: data.area,
        region: data.governorate,
        center_name: data.centerName || "",
        center_address: data.centerAddress || "",
        map_query: [data.centerName, data.area, data.governorate, "Egypt"]
          .filter(Boolean)
          .join(", "),
        modes: data.modes,
        curricula: data.curricula,
        grades: data.grades,
        price_per_session: data.pricePerSession,
        bio: data.bio || "",
        bio_ar: "",
        platform_url: data.platformUrl || null,
        verified: true,
      },
      { onConflict: "id" },
    );
    if (upErr) throw upErr;

    if (ownerId) {
      await context.supabase.from("profiles").update({ role: "teacher" }).eq("id", ownerId);
    }

    return { ok: true, teacherId };
  });

export const adminUpdateTeacher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        fullName: z.string().trim().min(2).max(90),
        fullNameAr: z.string().trim().max(90).optional().default(""),
        phone: z.string().trim().max(20).optional().default(""),
        subject: z.string().min(1),
        governorate: z.string().min(1),
        area: z.string().trim().min(1).max(90),
        centerName: z.string().trim().max(200).optional().default(""),
        centerAddress: z.string().trim().max(300).optional().default(""),
        platformUrl: z.string().trim().max(500).optional().default(""),
        pricePerSession: z.number().min(0).max(100000),
        bio: z.string().trim().max(1200).optional().default(""),
        modes: z.array(z.string()).min(1),
        curricula: z.array(z.string()).min(1),
        grades: z.array(z.string()).min(1),
        ownerEmail: z.string().email().optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (admin !== true) throw new Error("Forbidden: Admin access required");

    // Preserve the existing owner_id unless an explicit ownerEmail is supplied.
    // Never silently null out an existing ownership relationship just because
    // the admin left the email field blank on an edit.
    let ownerId: string | null | undefined = undefined;
    if (data.ownerEmail) {
      const resolved = await resolveOwnerIdByEmail(data.ownerEmail);
      if (!resolved) {
        throw new Error(
          `No registered user found with email "${data.ownerEmail}". Leave the email blank to keep the current owner, or double-check it.`,
        );
      }
      ownerId = resolved;
    }

    const updatePayload: TeacherUpdate = {
      name: data.fullName,
      name_ar: data.fullNameAr || "",
      subject: data.subject,
      area: data.area,
      region: data.governorate,
      center_name: data.centerName || "",
      center_address: data.centerAddress || "",
      map_query: [data.centerName, data.area, data.governorate, "Egypt"]
        .filter(Boolean)
        .join(", "),
      modes: data.modes,
      curricula: data.curricula,
      grades: data.grades,
      price_per_session: data.pricePerSession,
      bio: data.bio || "",
      platform_url: data.platformUrl || null,
    };

    // Only touch owner_id when an email was explicitly provided and resolved.
    if (ownerId !== undefined) {
      updatePayload.owner_id = ownerId;
    }

    const { error: upErr } = await context.supabase
      .from("teachers")
      .update(updatePayload)
      .eq("id", data.id);

    if (upErr) throw upErr;

    if (ownerId) {
      await context.supabase.from("profiles").update({ role: "teacher" }).eq("id", ownerId);
    }

    return { ok: true };
  });
