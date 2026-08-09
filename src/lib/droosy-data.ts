export type Mode = "center" | "home" | "online";

export type Review = {
  id: string;
  teacherId: string;
  student: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  area: string;
  region: string;
  centerName: string;
  centerAddress: string;
  mapQuery: string;
  modes: Mode[];
  rating: number;
  students: number;
  pricePerSession: number;
  bio: string;
  manasa?: string | undefined;
  youtube?: string | undefined;
  slots: { day: string; times: string[] }[];
  accent: string;
};

export type Bundle = {
  id: string;
  title: string;
  tagline: string;
  teacherIds: string[];
  discount: number;
  accent: string;
};

export type Catalog = {
  teachers: Teacher[];
  bundles: Bundle[];
  reviews: Review[];
};

export const SUBJECTS = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "Arabic",
  "English",
] as const;

export const AREAS = [
  "All areas",
  "Amman — Abdoun",
  "Amman — Sweifieh",
  "Amman — Tla' Al Ali",
  "Zarqa — Al Jadeeda",
  "Irbid — City Center",
] as const;

export const MODE_LABEL: Record<Mode, string> = {
  center: "In-Person Center",
  home: "Private Home Tutoring",
  online: "Online (Manasa)",
};

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "Just now";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `${w} week${w === 1 ? "" : "s"} ago`;
  }
  const m = Math.floor(days / 30);
  return `${m} month${m === 1 ? "" : "s"} ago`;
}

/* ---------- row mappers (database -> app types) ---------- */

export type TeacherRow = {
  id: string;
  name: string;
  subject: string;
  area: string;
  region: string;
  center_name: string;
  center_address: string;
  map_query: string;
  modes: string[];
  rating: number | string;
  students: number;
  price_per_session: number | string;
  bio: string;
  manasa: string | null;
  youtube: string | null;
  slots: unknown;
  accent: string;
};

export type BundleRow = {
  id: string;
  title: string;
  tagline: string;
  teacher_ids: string[];
  discount: number | string;
  accent: string;
};

export type ReviewRow = {
  id: string;
  teacher_id: string;
  student_name: string;
  rating: number;
  body: string;
  verified: boolean;
  created_at: string;
};

export const mapTeacher = (r: TeacherRow): Teacher => ({
  id: r.id,
  name: r.name,
  subject: r.subject,
  area: r.area,
  region: r.region,
  centerName: r.center_name,
  centerAddress: r.center_address,
  mapQuery: r.map_query,
  modes: (r.modes ?? []) as Mode[],
  rating: Number(r.rating),
  students: r.students,
  pricePerSession: Number(r.price_per_session),
  bio: r.bio,
  manasa: r.manasa ?? undefined,
  youtube: r.youtube ?? undefined,
  slots: (r.slots as { day: string; times: string[] }[]) ?? [],
  accent: r.accent,
});

export const mapBundle = (r: BundleRow): Bundle => ({
  id: r.id,
  title: r.title,
  tagline: r.tagline,
  teacherIds: r.teacher_ids ?? [],
  discount: Number(r.discount),
  accent: r.accent,
});

export const mapReview = (r: ReviewRow): Review => ({
  id: r.id,
  teacherId: r.teacher_id,
  student: r.student_name,
  rating: r.rating,
  text: r.body,
  date: relativeDate(r.created_at),
  verified: r.verified,
});
