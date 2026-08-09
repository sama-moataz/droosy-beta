export type Mode = "center" | "home" | "online" | "manasa";
export type Curriculum = "thanaweya" | "bakalorya" | "igcse" | "ib" | "american";
export type Grade =
  | "prep1"
  | "prep2"
  | "prep3"
  | "sec1"
  | "sec2"
  | "sec3";

export type Bilingual = { en: string; ar: string };

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
  nameAr: string;
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
  bioAr: string;
  manasa?: string | undefined;
  platformUrl?: string | undefined;
  youtube?: string | undefined;
  slots: { day: string; times: string[] }[];
  accent: string;
  curricula: Curriculum[];
  grades: Grade[];
  verified: boolean;
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

export const CURRENCY: Bilingual = { en: "EGP", ar: "جنيه" };

export const SUBJECTS: { id: string; label: Bilingual }[] = [
  { id: "Math", label: { en: "Math", ar: "رياضيات" } },
  { id: "Physics", label: { en: "Physics", ar: "فيزياء" } },
  { id: "Chemistry", label: { en: "Chemistry", ar: "كيمياء" } },
  { id: "Biology", label: { en: "Biology", ar: "أحياء" } },
  { id: "Arabic", label: { en: "Arabic", ar: "لغة عربية" } },
  { id: "English", label: { en: "English", ar: "لغة إنجليزية" } },
  { id: "French", label: { en: "French", ar: "لغة فرنسية" } },
  { id: "German", label: { en: "German", ar: "لغة ألمانية" } },
  { id: "Geology", label: { en: "Geology", ar: "جيولوجيا" } },
  { id: "History", label: { en: "History", ar: "تاريخ" } },
  { id: "Philosophy", label: { en: "Philosophy", ar: "فلسفة ومنطق" } },
];

/** Egyptian governorates used across the directory. */
export const GOVERNORATES: { id: string; label: Bilingual }[] = [
  { id: "Cairo", label: { en: "Cairo", ar: "القاهرة" } },
  { id: "Giza", label: { en: "Giza", ar: "الجيزة" } },
  { id: "Alexandria", label: { en: "Alexandria", ar: "الإسكندرية" } },
  { id: "Qalyubia", label: { en: "Qalyubia", ar: "القليوبية" } },
  { id: "Dakahlia", label: { en: "Dakahlia", ar: "الدقهلية" } },
  { id: "Gharbia", label: { en: "Gharbia", ar: "الغربية" } },
  { id: "Sharqia", label: { en: "Sharqia", ar: "الشرقية" } },
  { id: "Menoufia", label: { en: "Menoufia", ar: "المنوفية" } },
  { id: "Beheira", label: { en: "Beheira", ar: "البحيرة" } },
  { id: "Kafr El Sheikh", label: { en: "Kafr El Sheikh", ar: "كفر الشيخ" } },
  { id: "Damietta", label: { en: "Damietta", ar: "دمياط" } },
  { id: "Port Said", label: { en: "Port Said", ar: "بورسعيد" } },
  { id: "Ismailia", label: { en: "Ismailia", ar: "الإسماعيلية" } },
  { id: "Suez", label: { en: "Suez", ar: "السويس" } },
  { id: "Fayoum", label: { en: "Fayoum", ar: "الفيوم" } },
  { id: "Beni Suef", label: { en: "Beni Suef", ar: "بني سويف" } },
  { id: "Minya", label: { en: "Minya", ar: "المنيا" } },
  { id: "Assiut", label: { en: "Assiut", ar: "أسيوط" } },
  { id: "Sohag", label: { en: "Sohag", ar: "سوهاج" } },
  { id: "Qena", label: { en: "Qena", ar: "قنا" } },
  { id: "Luxor", label: { en: "Luxor", ar: "الأقصر" } },
  { id: "Aswan", label: { en: "Aswan", ar: "أسوان" } },
  { id: "Red Sea", label: { en: "Red Sea", ar: "البحر الأحمر" } },
  { id: "Matrouh", label: { en: "Matrouh", ar: "مطروح" } },
  { id: "North Sinai", label: { en: "North Sinai", ar: "شمال سيناء" } },
  { id: "South Sinai", label: { en: "South Sinai", ar: "جنوب سيناء" } },
  { id: "New Valley", label: { en: "New Valley", ar: "الوادي الجديد" } },
];

export const MODE_LABEL: Record<Mode, Bilingual> = {
  center: { en: "Center (in person)", ar: "سنتر (حضوري)" },
  home: { en: "Private lesson at home", ar: "درس خصوصي في المنزل" },
  online: { en: "Online video call", ar: "أونلاين مباشر (فيديو)" },
  manasa: { en: "Manasa (online platform)", ar: "منصة أونلاين" },
};

export const CURRICULUM_LABEL: Record<Curriculum, Bilingual> = {
  thanaweya: { en: "Thanaweya Amma", ar: "ثانوية عامة" },
  bakalorya: { en: "Baccalaureate (Bakalorya)", ar: "البكالوريا" },
  igcse: { en: "IGCSE / British", ar: "IGCSE / بريطاني" },
  ib: { en: "IB", ar: "البكالوريا الدولية IB" },
  american: { en: "American Diploma", ar: "الدبلومة الأمريكية" },
};

export const GRADE_LABEL: Record<Grade, Bilingual> = {
  prep1: { en: "Prep 1", ar: "أولى إعدادي" },
  prep2: { en: "Prep 2", ar: "ثانية إعدادي" },
  prep3: { en: "Prep 3", ar: "ثالثة إعدادي" },
  sec1: { en: "Secondary 1", ar: "أولى ثانوي" },
  sec2: { en: "Secondary 2", ar: "ثانية ثانوي" },
  sec3: { en: "Secondary 3", ar: "ثالثة ثانوي" },
};

export const MODES: Mode[] = ["center", "home", "online", "manasa"];
export const CURRICULA: Curriculum[] = [
  "thanaweya",
  "bakalorya",
  "igcse",
  "ib",
  "american",
];
export const GRADES: Grade[] = [
  "prep1",
  "prep2",
  "prep3",
  "sec1",
  "sec2",
  "sec3",
];

export const subjectLabel = (id: string): Bilingual =>
  SUBJECTS.find((s) => s.id === id)?.label ?? { en: id, ar: id };

export const governorateLabel = (id: string): Bilingual =>
  GOVERNORATES.find((g) => g.id === id)?.label ?? { en: id, ar: id };

export const initials = (name: string) =>
  name
    .replace(/^(Mr\.?|Mrs\.?|Miss|Dr\.?|A\.)\s+/i, "")
    .split(" ")
    .slice(0, 2)
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
  name_ar: string | null;
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
  bio_ar: string | null;
  manasa: string | null;
  platform_url: string | null;
  youtube: string | null;
  slots: unknown;
  accent: string;
  curricula: string[] | null;
  grades: string[] | null;
  verified: boolean | null;
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
  nameAr: r.name_ar ?? r.name,
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
  bioAr: r.bio_ar ?? r.bio,
  manasa: r.manasa ?? undefined,
  platformUrl: r.platform_url ?? undefined,
  youtube: r.youtube ?? undefined,
  slots: (r.slots as { day: string; times: string[] }[]) ?? [],
  accent: r.accent,
  curricula: (r.curricula ?? []) as Curriculum[],
  grades: (r.grades ?? []) as Grade[],
  verified: Boolean(r.verified),
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
