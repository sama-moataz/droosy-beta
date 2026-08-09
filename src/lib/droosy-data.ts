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
  manasa?: string;
  youtube?: string;
  slots: { day: string; times: string[] }[];
  accent: string;
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu"];

const slots = (a: string[], b: string[]) =>
  DAYS.map((day, i) => ({ day, times: i % 2 === 0 ? a : b }));

export const TEACHERS: Teacher[] = [
  {
    id: "t1",
    name: "Ustaz Kareem Odeh",
    subject: "Math",
    area: "Amman — Abdoun",
    region: "Amman",
    centerName: "Nexus Learning Center",
    centerAddress: "Al Sa'ada St 14, Abdoun, Amman",
    mapQuery: "Abdoun, Amman, Jordan",
    modes: ["center", "online"],
    rating: 4.9,
    students: 1240,
    pricePerSession: 12,
    bio: "Tawjihi Math specialist for 11 years. Known for breaking down calculus and geometry into simple visual steps, with weekly exam-style drills.",
    manasa: "https://manasa.example.com/kareem-odeh",
    youtube: "https://youtube.com/@droosy-math",
    slots: slots(["16:00", "18:00"], ["17:00", "19:30"]),
    accent: "from-sky-500 to-cyan-400",
  },
  {
    id: "t2",
    name: "Ustaza Lina Haddad",
    subject: "Physics",
    area: "Amman — Sweifieh",
    region: "Amman",
    centerName: "Orbit Academy",
    centerAddress: "Wakalat St 3, Sweifieh, Amman",
    mapQuery: "Sweifieh, Amman, Jordan",
    modes: ["center", "home", "online"],
    rating: 4.7,
    students: 860,
    pricePerSession: 14,
    bio: "Physics made intuitive — mechanics and electricity taught with real lab demos and a full recorded library on Manasa.",
    manasa: "https://manasa.example.com/lina-haddad",
    slots: slots(["15:00", "17:30"], ["16:30", "20:00"]),
    accent: "from-cyan-500 to-teal-400",
  },
  {
    id: "t3",
    name: "Ustaz Yousef Nabil",
    subject: "Chemistry",
    area: "Amman — Tla' Al Ali",
    region: "Amman",
    centerName: "Elements Center",
    centerAddress: "Khalil Al Salem St 22, Tla' Al Ali",
    mapQuery: "Tla Al Ali, Amman, Jordan",
    modes: ["center", "online"],
    rating: 4.8,
    students: 990,
    pricePerSession: 13,
    bio: "Organic chemistry that finally sticks. Colour-coded reaction maps and a monthly full mock exam with detailed correction.",
    manasa: "https://manasa.example.com/yousef-nabil",
    youtube: "https://youtube.com/@droosy-chem",
    slots: slots(["14:00", "18:30"], ["16:00", "19:00"]),
    accent: "from-teal-500 to-emerald-400",
  },
  {
    id: "t4",
    name: "Ustaza Rana Sami",
    subject: "English",
    area: "Zarqa — Al Jadeeda",
    region: "Zarqa",
    centerName: "Fluent Hub",
    centerAddress: "Al Jadeeda Main St 8, Zarqa",
    mapQuery: "Zarqa, Jordan",
    modes: ["home", "online"],
    rating: 4.6,
    students: 540,
    pricePerSession: 10,
    bio: "Grammar, essay writing and speaking confidence. Small groups of 6 students max, plus weekly writing feedback.",
    manasa: "https://manasa.example.com/rana-sami",
    slots: slots(["15:30", "17:00"], ["18:00", "20:00"]),
    accent: "from-sky-600 to-indigo-400",
  },
  {
    id: "t5",
    name: "Ustaz Mahmoud Ali",
    subject: "Arabic",
    area: "Irbid — City Center",
    region: "Irbid",
    centerName: "Al Bayan Center",
    centerAddress: "University St 40, Irbid",
    mapQuery: "Irbid, Jordan",
    modes: ["center"],
    rating: 4.5,
    students: 430,
    pricePerSession: 9,
    bio: "Nahw and balagha with memorable rules and story-based examples. Tawjihi track since 2009.",
    slots: slots(["13:00", "16:00"], ["15:00", "18:00"]),
    accent: "from-amber-500 to-orange-400",
  },
  {
    id: "t6",
    name: "Ustaza Dina Faris",
    subject: "Biology",
    area: "Amman — Abdoun",
    region: "Amman",
    centerName: "BioLab Studio",
    centerAddress: "Prince Hashem St 5, Abdoun",
    mapQuery: "Abdoun, Amman, Jordan",
    modes: ["center", "home", "online"],
    rating: 4.9,
    students: 1120,
    pricePerSession: 13,
    bio: "Visual biology: every system drawn live, plus flashcard packs and quick revision streams before each exam.",
    manasa: "https://manasa.example.com/dina-faris",
    youtube: "https://youtube.com/@droosy-bio",
    slots: slots(["14:30", "17:00"], ["16:00", "19:30"]),
    accent: "from-emerald-500 to-teal-400",
  },
  {
    id: "t7",
    name: "Ustaz Omar Zaid",
    subject: "Math",
    area: "Amman — Sweifieh",
    region: "Amman",
    centerName: "Nexus Learning Center",
    centerAddress: "Wakalat St 19, Sweifieh, Amman",
    mapQuery: "Sweifieh, Amman, Jordan",
    modes: ["home", "online"],
    rating: 4.4,
    students: 380,
    pricePerSession: 11,
    bio: "Algebra and statistics coach focused on students who lost confidence — patient, step by step, zero pressure.",
    manasa: "https://manasa.example.com/omar-zaid",
    slots: slots(["17:00", "19:00"], ["15:30", "18:30"]),
    accent: "from-blue-500 to-sky-400",
  },
  {
    id: "t8",
    name: "Ustaza Sireen Qasem",
    subject: "Physics",
    area: "Irbid — City Center",
    region: "Irbid",
    centerName: "Orbit Academy Irbid",
    centerAddress: "Al Hussein St 12, Irbid",
    mapQuery: "Irbid, Jordan",
    modes: ["center", "online"],
    rating: 4.7,
    students: 610,
    pricePerSession: 11,
    bio: "Problem-solving marathons every Thursday, with a bank of 2,000 solved Tawjihi questions on her Manasa.",
    manasa: "https://manasa.example.com/sireen-qasem",
    slots: slots(["16:00", "18:00"], ["14:00", "17:30"]),
    accent: "from-cyan-600 to-sky-400",
  },
];

export const REVIEWS: Review[] = [
  { id: "r1", teacherId: "t1", student: "Rokaya M.", rating: 5, text: "Calculus finally made sense. His weekly drills are exactly the exam style.", date: "2 weeks ago", verified: true },
  { id: "r2", teacherId: "t1", student: "Sama K.", rating: 5, text: "The Manasa recordings saved me when I missed a session.", date: "1 month ago", verified: true },
  { id: "r3", teacherId: "t1", student: "Bashar A.", rating: 4, text: "Great teacher, but the center gets crowded on Mondays.", date: "1 month ago", verified: false },
  { id: "r4", teacherId: "t2", student: "Haneen S.", rating: 5, text: "The lab demos made electricity so much easier to picture.", date: "3 weeks ago", verified: true },
  { id: "r5", teacherId: "t2", student: "Layth F.", rating: 4, text: "Very organized. Wish there were more evening slots.", date: "2 months ago", verified: true },
  { id: "r6", teacherId: "t3", student: "Sajda R.", rating: 5, text: "Reaction maps are genius. My chemistry mark went up 18 points.", date: "1 week ago", verified: true },
  { id: "r7", teacherId: "t6", student: "Noor T.", rating: 5, text: "Her drawings are better than the textbook. Flashcards included!", date: "5 days ago", verified: true },
  { id: "r8", teacherId: "t4", student: "Yara H.", rating: 4, text: "My essay writing improved a lot in one term.", date: "3 weeks ago", verified: true },
  { id: "r9", teacherId: "t5", student: "Anas D.", rating: 5, text: "Nahw rules explained with stories — I actually remember them.", date: "1 month ago", verified: false },
  { id: "r10", teacherId: "t8", student: "Malak Z.", rating: 5, text: "Thursday problem marathons are the reason I passed.", date: "2 weeks ago", verified: true },
];

export type Bundle = {
  id: string;
  title: string;
  tagline: string;
  teacherIds: string[];
  discount: number;
  accent: string;
};

export const BUNDLES: Bundle[] = [
  {
    id: "b1",
    title: "Scientific Stream Survival Kit",
    tagline: "Math + Physics + Chemistry with the highest rated trio in Amman.",
    teacherIds: ["t1", "t2", "t3"],
    discount: 0.2,
    accent: "from-sky-600 via-cyan-500 to-teal-400",
  },
  {
    id: "b2",
    title: "Medical Track Bundle",
    tagline: "Biology + Chemistry + English, built for future med students.",
    teacherIds: ["t6", "t3", "t4"],
    discount: 0.15,
    accent: "from-teal-600 via-cyan-500 to-sky-400",
  },
  {
    id: "b3",
    title: "Language Confidence Pack",
    tagline: "Arabic + English together, two sessions a week each.",
    teacherIds: ["t5", "t4"],
    discount: 0.1,
    accent: "from-indigo-500 via-sky-500 to-cyan-400",
  },
];

export const getTeacher = (id: string) => TEACHERS.find((t) => t.id === id);
export const initials = (name: string) =>
  name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
