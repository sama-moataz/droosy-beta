import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

export const getMyTeacherProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { teacherId?: string } | void) => d || {})
  .handler(async ({ data, context }) => {
    const targetOwnerId = context.userId;
    const targetTeacherId = data.teacherId;

    if (targetTeacherId) {
      // Check if admin
      const { data: admin } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (admin !== true) throw new Error("Forbidden");
    }

    let query = context.supabase.from("teachers").select("*");

    if (targetTeacherId) {
      query = query.eq("id", targetTeacherId);
    } else {
      query = query.eq("owner_id", targetOwnerId);
    }

    const { data: teacher, error } = await query.single();

    if (error || !teacher) return null;
    return teacher;
  });

export const updateTeacherProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        name: z.string().trim().min(2).max(90),
        nameAr: z.string().trim().max(90).optional().default(""),
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
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    let hasPermission = false;

    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (admin === true) {
      hasPermission = true;
    } else {
      const { data: teacher, error: verifyErr } = await context.supabase
        .from("teachers")
        .select("owner_id")
        .eq("id", data.id)
        .single();

      if (!verifyErr && teacher && teacher.owner_id === context.userId) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      throw new Error("Forbidden: You can only edit your own teacher profile");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: upErr } = await supabaseAdmin
      .from("teachers")
      .update({
        name: data.name,
        name_ar: data.nameAr || "",
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
      })
      .eq("id", data.id);

    if (upErr) throw upErr;
    return { ok: true };
  });

export const updateTeacherSlots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        slots: z.array(
          z.object({
            day: z.string(),
            times: z.array(z.string()),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    let hasPermission = false;

    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (admin === true) {
      hasPermission = true;
    } else {
      const { data: teacher, error: verifyErr } = await context.supabase
        .from("teachers")
        .select("owner_id")
        .eq("id", data.id)
        .single();

      if (!verifyErr && teacher && teacher.owner_id === context.userId) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      throw new Error("Forbidden: You can only edit your own teacher profile");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: upErr } = await supabaseAdmin
      .from("teachers")
      .update({
        slots: data.slots as unknown as Json,
      })
      .eq("id", data.id);

    if (upErr) throw upErr;
    return { ok: true };
  });
