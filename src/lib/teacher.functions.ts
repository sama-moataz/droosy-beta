import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

export const getMyTeacherProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ teacherId: z.string().optional() }).parse(input || {}),
  )
  .handler(async ({ data, context }) => {
    const targetOwnerId = context.userId;
    const targetTeacherId = data?.teacherId;

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

    const { error: upErr } = await context.supabase
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

    const { error: upErr } = await context.supabase
      .from("teachers")
      .update({
        slots: data.slots as unknown as Json,
      })
      .eq("id", data.id);

    if (upErr) throw upErr;
    return { ok: true };
  });

export const deleteTeacherListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (admin !== true) {
      const { data: teacher, error: verifyErr } = await context.supabase
        .from("teachers")
        .select("owner_id")
        .eq("id", data.id)
        .single();
      if (verifyErr || !teacher || teacher.owner_id !== context.userId) {
        throw new Error("Forbidden: You can only delete your own teacher listing");
      }
    }

    // RLS also enforces this (teachers_owner_delete / teachers_admin_delete).
    const { error: delErr } = await context.supabase.from("teachers").delete().eq("id", data.id);
    if (delErr) throw delErr;
    return { ok: true };
  });

export const getTeacherAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ teacherId: z.string().optional() }).parse(input || {}),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{
      bookings: {
        id: string;
        user_id: string;
        day: string | null;
        time: string | null;
        student_name: string;
      }[];
      reviews: {
        id: string;
        student_name: string;
        rating: number;
        body: string;
        created_at: string;
        verified: boolean;
      }[];
      rating: number | null;
      students: number | null;
    }> => {
      let teacherId = data?.teacherId;
      if (!teacherId) {
        const { data: owned } = await context.supabase
          .from("teachers")
          .select("id")
          .eq("owner_id", context.userId)
          .maybeSingle();
        if (owned) teacherId = owned.id;
      }

      if (!teacherId) return { bookings: [], reviews: [], rating: null, students: null };

      // Verify caller is admin OR owns this teacher record
      const { data: admin } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (admin !== true) {
        const { data: teacher, error: ownerErr } = await context.supabase
          .from("teachers")
          .select("owner_id")
          .eq("id", teacherId)
          .single();
        if (ownerErr || !teacher || teacher.owner_id !== context.userId) {
          throw new Error("Forbidden");
        }
      }

      const [{ data: bookingRows }, { data: reviewRows }, { data: teacherRow }] = await Promise.all(
        [
          context.supabase
            .from("bookings")
            .select("id, user_id, day, time")
            .eq("teacher_id", teacherId),
          context.supabase
            .from("reviews")
            .select("id, student_name, rating, body, created_at, verified")
            .eq("teacher_id", teacherId)
            .order("created_at", { ascending: false }),
          context.supabase
            .from("teachers")
            .select("rating, students")
            .eq("id", teacherId)
            .maybeSingle(),
        ],
      );

      const userIds = Array.from(new Set((bookingRows ?? []).map((b) => b.user_id).filter(Boolean)));
      let studentNamesMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profs } = await context.supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        if (profs) {
          studentNamesMap = Object.fromEntries(profs.map((p) => [p.id, p.full_name]));
        }
      }

      const enrichedBookings = (bookingRows ?? []).map((b) => ({
        ...b,
        student_name: studentNamesMap[b.user_id] || "Enrolled Student",
      }));

      return {
        bookings: enrichedBookings,
        reviews: reviewRows ?? [],
        rating: teacherRow?.rating ?? null,
        students: teacherRow?.students ?? null,
      };
    },
  );
