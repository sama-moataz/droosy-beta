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
  const [teachers, bundles, reviews] = await Promise.all([
    supabase.from("teachers").select("*").order("sort", { ascending: true }),
    supabase.from("bundles").select("*").order("sort", { ascending: true }),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  return {
    teachers: ((teachers.data ?? []) as TeacherRow[]).map(mapTeacher),
    bundles: ((bundles.data ?? []) as BundleRow[]).map(mapBundle),
    reviews: ((reviews.data ?? []) as ReviewRow[]).map(mapReview),
  };
});
