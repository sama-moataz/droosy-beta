import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import {
  mapBundle,
  mapReview,
  mapTeacher,
  type BundleRow,
  type Catalog,
  type ReviewRow,
  type TeacherRow,
} from "./droosy-data";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Catalog> => {
  const supabase = publicClient();
  const [teachers, bundles, reviews, studentCounts] = await Promise.all([
    supabase.from("teachers").select("*").order("sort", { ascending: true }),
    supabase.from("bundles").select("*").order("sort", { ascending: true }),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.rpc("get_teacher_student_counts"),
  ]);

  if (studentCounts.error) {
    console.error("getCatalog: get_teacher_student_counts failed:", studentCounts.error);
  }
  const studentCountByTeacher: Record<string, number> = Object.fromEntries(
    ((studentCounts.data ?? []) as { teacher_id: string; student_count: number }[]).map((r) => [
      r.teacher_id,
      Number(r.student_count),
    ]),
  );

  return {
    teachers: ((teachers.data ?? []) as TeacherRow[])
      .map(mapTeacher)
      .map((teacher) => ({
        ...teacher,
        // Real, live count from bookings — never the static seed column.
        students: studentCountByTeacher[teacher.id] ?? 0,
      })),
    bundles: ((bundles.data ?? []) as BundleRow[]).map(mapBundle),
    reviews: ((reviews.data ?? []) as ReviewRow[]).map(mapReview),
  };
});
