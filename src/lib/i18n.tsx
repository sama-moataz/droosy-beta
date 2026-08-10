import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";
export type Theme = "light" | "dark";

type Dict = Record<string, { en: string; ar: string }>;

export const STRINGS: Dict = {
  brand: { en: "Droosy", ar: "دروسي" },
  tagline: {
    en: "Every Egyptian teacher, center and manasa in one place.",
    ar: "كل مدرسي مصر والسناتر والمنصات في مكان واحد.",
  },
  nav_schedule: { en: "My Schedule", ar: "جدولي" },
  nav_packages: { en: "Packages", ar: "الباقات" },
  nav_teach: { en: "Teach on Droosy", ar: "سجّل كمدرس" },
  nav_teacher_dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  nav_add_teacher: { en: "Add Teacher", ar: "إضافة مدرس" },
  nav_signin: { en: "Sign in", ar: "تسجيل الدخول" },
  nav_signout: { en: "Sign out", ar: "تسجيل الخروج" },
  search_placeholder: {
    en: "Search a teacher, subject or center…",
    ar: "ابحث عن مدرس أو مادة أو سنتر…",
  },
  hero_badge: { en: "Less stress, more studying", ar: "توتر أقل ومذاكرة أكثر" },
  hero_title_1: {
    en: "Find all your teachers in one place and",
    ar: "لاقي كل مدرسينك في مكان واحد و",
  },
  hero_title_2: { en: "save your time", ar: "وفّر وقتك" },
  hero_sub: {
    en: "Compare private teachers, centers and manasa platforms across Egypt by subject, governorate, curriculum and real student reviews — then book everything on one calendar.",
    ar: "قارن بين المدرسين الخصوصيين والسناتر والمنصات في كل محافظات مصر حسب المادة والمنهج وتقييمات الطلاب — واحجز كل حصصك في جدول واحد.",
  },
  hero_search_placeholder: {
    en: "Try “Physics in Nasr City” or a teacher name",
    ar: "جرّب «فيزياء مدينة نصر» أو اسم مدرس",
  },
  filters: { en: "Filters", ar: "الفلاتر" },
  all_subjects: { en: "All subjects", ar: "كل المواد" },
  all_areas: { en: "All governorates", ar: "كل المحافظات" },
  all_modes: { en: "All lesson types", ar: "كل أنواع الدروس" },
  all_curricula: { en: "All curricula", ar: "كل المناهج" },
  all_grades: { en: "All grades", ar: "كل الصفوف" },
  clear_filters: { en: "Clear filters", ar: "مسح الفلاتر" },
  teachers_available: { en: "teachers available", ar: "مدرس متاح" },
  no_match: {
    en: "No teachers match these filters yet.",
    ar: "لا يوجد مدرسون مطابقون لهذه الفلاتر حتى الآن.",
  },
  no_match_cta: {
    en: "Are you a teacher? Register and get verified.",
    ar: "هل أنت مدرس؟ سجّل وفعّل التوثيق.",
  },
  featured_packages: { en: "Featured packages", ar: "باقات مميزة" },
  featured_packages_sub: {
    en: "Bundle several subjects with one click and pay less per session.",
    ar: "اجمع أكثر من مادة بضغطة واحدة وادفع أقل للحصة.",
  },
  see_all: { en: "See all", ar: "عرض الكل" },
  save: { en: "Save", ar: "وفّر" },
  verified: { en: "Verified", ar: "موثّق" },
  students: { en: "students", ar: "طالب" },
  per_session: { en: "EGP / session", ar: "جنيه / الحصة" },
  book_profile: { en: "Book / View profile", ar: "احجز / عرض الملف" },
  back_teachers: { en: "Back to teachers", ar: "العودة للمدرسين" },
  // teacher registration
  teach_title: { en: "Teach on Droosy", ar: "سجّل كمدرس على دروسي" },
  teach_sub: {
    en: "Create your teacher profile. We verify every teacher with a national ID and a teaching credential before publishing.",
    ar: "أنشئ ملفك كمدرس. نقوم بتوثيق كل مدرس عن طريق الرقم القومي وإثبات مزاولة المهنة قبل النشر.",
  },
  full_name: { en: "Full name (English)", ar: "الاسم بالإنجليزية" },
  full_name_ar: { en: "Full name (Arabic)", ar: "الاسم بالعربية" },
  phone: { en: "Phone number", ar: "رقم الهاتف" },
  subject: { en: "Subject", ar: "المادة" },
  governorate: { en: "Governorate", ar: "المحافظة" },
  area: { en: "Area / district", ar: "المنطقة" },
  center_name: { en: "Center name (optional)", ar: "اسم السنتر (اختياري)" },
  center_address: { en: "Center address (optional)", ar: "عنوان السنتر (اختياري)" },
  price: { en: "Price per session (EGP)", ar: "سعر الحصة (جنيه)" },
  bio: { en: "About you", ar: "نبذة عنك" },
  platform_url: { en: "Manasa / platform link (optional)", ar: "رابط المنصة (اختياري)" },
  lesson_types: { en: "Lesson types you offer", ar: "أنواع الدروس التي تقدمها" },
  curricula: { en: "Curricula", ar: "المناهج" },
  grades: { en: "Grade levels", ar: "الصفوف الدراسية" },
  id_verification: { en: "ID & teaching verification", ar: "توثيق الهوية ومزاولة المهنة" },
  id_verification_sub: {
    en: "Upload a clear photo of your Egyptian national ID and a teaching credential (Ministry of Education card, university degree, or syndicate card). Files are private and only used for verification.",
    ar: "ارفع صورة واضحة من بطاقة الرقم القومي وإثبات مزاولة مهنة التدريس (كارنيه وزارة التربية والتعليم أو المؤهل الجامعي أو كارنيه النقابة). الملفات خاصة وتُستخدم للتوثيق فقط.",
  },
  national_id_last4: { en: "Last 4 digits of national ID", ar: "آخر 4 أرقام من الرقم القومي" },
  id_document: { en: "National ID photo", ar: "صورة بطاقة الرقم القومي" },
  credential_document: { en: "Teaching credential", ar: "إثبات مزاولة التدريس" },
  submit_application: { en: "Submit for verification", ar: "إرسال للتوثيق" },
  application_pending: {
    en: "Your application is under review. We usually verify within 48 hours.",
    ar: "طلبك قيد المراجعة. عادةً نقوم بالتوثيق خلال 48 ساعة.",
  },
  application_sent: {
    en: "Application submitted — we'll review your documents shortly.",
    ar: "تم إرسال الطلب — سنراجع مستنداتك قريبًا.",
  },
  sign_in_first: {
    en: "Sign in first to register as a teacher.",
    ar: "سجّل الدخول أولًا للتسجيل كمدرس.",
  },
  already_teacher_title: {
    en: "You're already a teacher on Droosy",
    ar: "أنت بالفعل مدرس على دروسي",
  },
  already_teacher_body: {
    en: "Your teacher profile is verified and live — students can already find and book you.",
    ar: "ملفك كمدرس موثّق ومنشور بالفعل — يمكن للطلاب العثور عليك وحجز حصص معك.",
  },
  view_my_profile: { en: "View my public profile", ar: "عرض ملفي العام" },
  application_rejected: {
    en: "Your last application wasn't approved. Review your details below and submit again.",
    ar: "لم تتم الموافقة على طلبك السابق. راجع بياناتك بالأسفل وأرسل الطلب مرة أخرى.",
  },
  required_fields: {
    en: "Please fill all required fields.",
    ar: "من فضلك أكمل جميع الحقول المطلوبة.",
  },
  upload_both: { en: "Please upload both documents.", ar: "من فضلك ارفع المستندين." },
  theme_toggle: { en: "Toggle dark mode", ar: "تبديل الوضع الداكن" },
  lang_toggle: { en: "العربية", ar: "English" },
};

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  t: (key: keyof typeof STRINGS | string) => string;
  pick: (en: string, ar: string) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const storedLang = window.localStorage.getItem("droosy-lang") as Lang | null;
    if (storedLang === "ar" || storedLang === "en") setLangState(storedLang);
    const storedTheme = window.localStorage.getItem("droosy-theme") as Theme | null;
    if (storedTheme === "dark" || storedTheme === "light") setThemeState(storedTheme);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setThemeState("dark");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("droosy-lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("droosy-theme", theme);
  }, [theme]);

  const t = useCallback(
    (key: string) => {
      const entry = STRINGS[key];
      if (!entry) return key;
      return lang === "ar" ? entry.ar : entry.en;
    },
    [lang],
  );

  const pick = useCallback((en: string, ar: string) => (lang === "ar" && ar ? ar : en), [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang: setLangState,
      toggleLang: () => setLangState((l) => (l === "en" ? "ar" : "en")),
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((s) => (s === "light" ? "dark" : "light")),
      t,
      pick,
    }),
    [lang, theme, t, pick],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
