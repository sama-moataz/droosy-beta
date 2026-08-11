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
  resubmit_application: { en: "Resubmit application", ar: "إعادة إرسال الطلب" },
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

  // Common UI & Buttons
  loading: { en: "Loading…", ar: "جاري التحميل…" },
  save_changes: { en: "Save Changes", ar: "حفظ التغييرات" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  delete: { en: "Delete", ar: "حذف" },
  remove: { en: "Remove", ar: "إزالة" },
  edit: { en: "Edit", ar: "تعديل" },
  add: { en: "Add", ar: "إضافة" },
  view: { en: "View", ar: "عرض" },
  show: { en: "Show", ar: "عرض" },
  hide: { en: "Hide", ar: "إخفاء" },
  submit: { en: "Submit", ar: "إرسال" },
  resubmit: { en: "Resubmit", ar: "إعادة إرسال" },
  back: { en: "Back", ar: "رجوع" },
  footer_credits: {
    en: "Idea by Rokaya, Sama, Haneen, and Sajda.",
    ar: "فكرة رقية وسما وحنين وسجدة.",
  },
  add_to_package: { en: "Add to package", ar: "إضافة للباقة" },
  remove_from_package: { en: "Remove from package", ar: "إزالة من الباقة" },

  // Status Labels
  status_pending: { en: "Pending", ar: "قيد المراجعة" },
  status_approved: { en: "Approved", ar: "مقبول" },
  status_rejected: { en: "Rejected", ar: "مرفوض" },
  status_available: { en: "Available", ar: "متاح" },
  status_booked: { en: "Booked", ar: "محجوز" },
  status_conflict: { en: "Conflict", ar: "تعارض" },

  // Days of the Week
  day_saturday: { en: "Saturday", ar: "السبت" },
  day_sunday: { en: "Sunday", ar: "الأحد" },
  day_monday: { en: "Monday", ar: "الاثنين" },
  day_tuesday: { en: "Tuesday", ar: "الثلاثاء" },
  day_wednesday: { en: "Wednesday", ar: "الأربعاء" },
  day_thursday: { en: "Thursday", ar: "الخميس" },
  day_friday: { en: "Friday", ar: "الجمعة" },

  // Root & Not Found Page
  not_found_title: { en: "404", ar: "404" },
  not_found_heading: { en: "Page not found", ar: "الصفحة غير موجودة" },
  not_found_sub: {
    en: "The page you're looking for doesn't exist or has been moved.",
    ar: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
  },
  go_home: { en: "Go home", ar: "العودة للرئيسية" },
  error_heading: { en: "This page didn't load", ar: "لم يتم تحميل هذه الصفحة" },
  error_sub: {
    en: "Something went wrong on our end. You can try refreshing or head back home.",
    ar: "حدث خطأ ما من جانبنا. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.",
  },
  try_again: { en: "Try again", ar: "إعادة المحاولة" },

  // Auth Page
  auth_title_signin: { en: "Welcome back", ar: "مرحبًا بعودتك" },
  auth_title_signup: { en: "Create your account", ar: "أنشئ حسابك" },
  auth_sub_signin: {
    en: "Sign in to see your schedule and bookings.",
    ar: "سجّل الدخول لعرض جدولك وحصصك المحجوزة.",
  },
  auth_sub_signup: {
    en: "Save your bookings, reviews and packages in one place.",
    ar: "احفظ حصصك وتقييماتك وباقاتك في مكان واحد.",
  },
  auth_role_label: { en: "I want to use Droosy as a", ar: "أريد استخدام دروسي كـ" },
  auth_role_student: { en: "Student", ar: "طالب" },
  auth_role_teacher: { en: "Teacher", ar: "مدرس" },
  auth_label_name: { en: "Full name", ar: "الاسم بالكامل" },
  auth_label_email: { en: "Email", ar: "البريد الإلكتروني" },
  auth_label_password: { en: "Password", ar: "كلمة المرور" },
  auth_placeholder_password: { en: "At least 6 characters", ar: "6 أحرف على الأقل" },
  auth_btn_signin: { en: "Sign in", ar: "تسجيل الدخول" },
  auth_btn_signup: { en: "Create account", ar: "إنشاء حساب" },
  auth_prompt_new: { en: "New to Droosy?", ar: "جديد في دروسي؟" },
  auth_prompt_existing: { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
  auth_switch_signup: { en: "Create an account", ar: "إنشاء حساب جديد" },
  auth_switch_signin: { en: "Sign in", ar: "تسجيل الدخول" },
  auth_sent_title: { en: "Check your inbox", ar: "افحص بريدك الإلكتروني" },
  auth_sent_body: {
    en: "We sent a confirmation link to {email}. Open it to activate your account, then come back and sign in.",
    ar: "أرسلنا رابط تأكيد إلى {email}. افتحه لتفعيل حسابك، ثم عد وسجّل الدخول.",
  },
  auth_sent_back: { en: "Back to sign in", ar: "العودة لتسجيل الدخول" },
  auth_val_email: { en: "Enter a valid email", ar: "أدخل بريدًا إلكترونيًا صحيحًا" },
  auth_val_password: {
    en: "Password must be at least 6 characters",
    ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
  },
  auth_val_name: { en: "Enter your name", ar: "أدخل اسمك" },
  auth_toast_welcome: { en: "Welcome to Droosy!", ar: "مرحبًا بك في دروسي!" },
  auth_toast_signed_in: { en: "Signed in.", ar: "تم تسجيل الدخول بنجاح." },

  // Teacher Dashboard
  td_dashboard_title: { en: "Teacher Dashboard", ar: "لوحة تحكم المدرس" },
  td_manage_profile: { en: "Manage your profile", ar: "إدارة ملفك الشخصي" },
  td_manage_sub: {
    en: "Keep your details and availability up to date so students can book you.",
    ar: "حافظ على تحديث بياناتك وأوقات مواعيدك ليتمكن الطلاب من حجز حصص معك.",
  },
  td_view_public: { en: "View public profile", ar: "عرض الملف العام" },
  td_tab_profile: { en: "Profile Details", ar: "تفاصيل الملف" },
  td_tab_availability: { en: "Availability", ar: "أوقات المواعيد المتاحة" },
  td_no_profile_title: {
    en: "You do not have a verified teacher profile yet.",
    ar: "ليس لديك ملف مدرس موثّق حتى الآن.",
  },
  td_apply_btn: { en: "Apply to teach", ar: "قدم طلب للتسجيل كمدرس" },
  td_save_profile: { en: "Save Profile", ar: "حفظ بيانات الملف" },
  td_save_availability: { en: "Save Availability", ar: "حفظ أوقات المواعيد" },
  td_avail_sub: {
    en: "Add the times you are available to teach. Students can select these times when booking you.",
    ar: "أضف الأوقات المتاحة لديك للتدريس. يمكن للطلاب اختيار هذه المواعيد عند الحجز.",
  },
  td_add_time: { en: "Add Time", ar: "إضافة موعد" },
  td_select_time: { en: "Select time", ar: "اختر الوقت" },
  td_no_times_set: { en: "No times set for {day}.", ar: "لا توجد مواعيد محددة ليوم {day}." },
  td_remove_time: { en: "Remove time", ar: "إزالة الموعد" },
  td_prompt_time: {
    en: "Enter time (e.g., '14:00' or '2:00 PM')",
    ar: "أدخل الموعد (مثال: '14:00' أو '2:00 مساءً')",
  },
  td_toast_profile_updated: {
    en: "Profile updated successfully",
    ar: "تم تحديث الملف الشخصي بنجاح",
  },
  td_toast_avail_updated: {
    en: "Availability updated successfully",
    ar: "تم تحديث أوقات المواعيد بنجاح",
  },
  td_toast_load_err: {
    en: "Could not load your teacher profile",
    ar: "تعذر تحميل ملف المدرس الخاص بك",
  },
  td_danger_zone: { en: "Danger zone", ar: "منطقة الخطر" },
  td_delete_listing: { en: "Delete teacher listing", ar: "حذف ملف المدرس" },
  td_delete_sub: {
    en: "Permanently remove this teacher listing, along with its bookings and reviews. This cannot be undone.",
    ar: "حذف ملف المدرس نهائيًا مع كل الحجوزات والتقييمات. لا يمكن التراجع عن هذا الإجراء.",
  },
  td_delete_confirm_title: { en: "Delete this listing?", ar: "حذف هذا الملف؟" },
  td_delete_confirm_body: {
    en: "This will permanently delete the teacher listing and all related bookings and reviews.",
    ar: "سيتم حذف ملف المدرس وكل الحجوزات والتقييمات المرتبطة به نهائيًا.",
  },
  td_delete_cancel: { en: "Cancel", ar: "إلغاء" },
  td_delete_confirm_btn: { en: "Yes, delete", ar: "نعم، احذف" },
  td_toast_deleted: { en: "Teacher listing deleted", ar: "تم حذف ملف المدرس" },

  // Admin Dashboard
  admin_badge: { en: "Admin", ar: "لوحة الأدمن" },
  admin_add_teacher_title: { en: "Add Teacher", ar: "إضافة مدرس" },
  admin_add_teacher_sub: {
    en: "Directly create a new teacher profile without the application process.",
    ar: "أنشئ ملف مدرس جديد مباشرة دون المرور بطلب التوثيق.",
  },
  admin_create_teacher_btn: { en: "Create teacher", ar: "إنشاء ملف المدرس" },
  admin_owner_email_label: {
    en: "Owner email (optional)",
    ar: "البريد الإلكتروني لصاحب الحساب (اختياري)",
  },
  admin_owner_email_sub: {
    en: "If this teacher has a Droosy account, enter their email to link it.",
    ar: "إذا كان للمدرس حساب على دروسي، أدخل بريده الإلكتروني لربطه.",
  },
  admin_manage_teachers_title: { en: "Manage Teachers", ar: "إدارة المدرسين" },
  admin_manage_teachers_sub: {
    en: "View existing teachers and edit their profiles or availability.",
    ar: "عرض المدرسين الحاليين وتعديل ملفاتهم أو أوقات مواعيدهم.",
  },
  admin_edit_teacher_btn: { en: "Edit Teacher", ar: "تعديل بيانات المدرس" },
  admin_loading_teachers: { en: "Loading teachers…", ar: "جاري تحميل المدرسين…" },
  admin_no_teachers: { en: "No teachers found.", ar: "لا يوجد مدرسون." },
  admin_apps_title: { en: "Teacher applications", ar: "طلبات الانضمام للمدرسين" },
  admin_apps_sub: {
    en: "Review submitted documents, then approve to publish a verified teacher profile.",
    ar: "راجع المستندات المرفقة ثم وافق لنشر ملف مدرس موثّق.",
  },
  admin_signin_prompt: {
    en: "Sign in with your admin account to continue.",
    ar: "سجّل الدخول بحساب الأدمن للمتابعة.",
  },
  admin_no_access: {
    en: "This account does not have admin access.",
    ar: "هذا الحساب لا يملك صلاحيات الأدمن.",
  },
  admin_loading_apps: { en: "Loading applications…", ar: "جاري تحميل الطلبات…" },
  admin_no_apps: { en: "No applications yet.", ar: "لا توجد طلبات حتى الآن." },
  admin_national_id_last4: { en: "National ID (last 4)", ar: "آخر 4 أرقام من الرقم القومي" },
  admin_center: { en: "Center", ar: "السنتر" },
  admin_modes_curricula_grades: {
    en: "Modes / Curricula / Grades",
    ar: "الأنواع / المناهج / الصفوف",
  },
  admin_review_note_ph: { en: "Review note (optional)", ar: "ملاحظة المراجعة (اختياري)" },
  admin_approve: { en: "Approve", ar: "موافقة" },
  admin_reject: { en: "Reject", ar: "رفض" },
  admin_toast_approved: { en: "Teacher approved", ar: "تمت الموافقة على المدرس" },
  admin_toast_rejected: { en: "Application rejected", ar: "تم رفض الطلب" },
  admin_toast_created: {
    en: 'Teacher "{fullName}" created successfully.',
    ar: "تم إنشاء ملف المدرس «{fullName}» بنجاح.",
  },
  admin_toast_added: { en: "Teacher added to directory.", ar: "تمت إضافة المدرس إلى القائمة." },

  // Teacher Profile Page
  tp_reviews_count: { en: "({n} reviews)", ar: "({n} تقييم)" },
  tp_open_manasa: { en: "Open Manasa", ar: "فتح المنصة" },
  tp_youtube_channel: { en: "YouTube channel", ar: "قناة يوتيوب" },
  tp_in_package: { en: "Added to my package", ar: "تمت الإضافة للباقة" },
  tp_add_package: { en: "Add to my package", ar: "إضافة للباقة" },
  tp_center_location: { en: "Center location", ar: "موقع السنتر" },
  tp_get_directions: { en: "Get directions", ar: "الاتجاهات" },
  tp_student_reviews: { en: "Student reviews", ar: "تقييمات الطلاب" },
  tp_write_review: { en: "Write a review", ar: "كتابة تقييم" },
  tp_rate_teacher: { en: "Rate {name}", ar: "تقييم {name}" },
  tp_rate_sub: {
    en: "Your honest feedback helps other students choose calmly.",
    ar: "رأيك الصادق يساعد بقية الطلاب على الاختيار بسهولة.",
  },
  tp_your_name: { en: "Your name", ar: "اسمك" },
  tp_review_ph: {
    en: "What was helpful about the sessions?",
    ar: "ما الذي كان مفيدًا في الحصص؟",
  },
  tp_publish_review: { en: "Publish review", ar: "نشر التقييم" },
  tp_no_reviews: {
    en: "No reviews yet — be the first.",
    ar: "لا توجد تقييمات بعد — كن أول من يقيّم.",
  },
  tp_pick_slot: { en: "Pick a slot", ar: "اختر الموعد" },
  tp_already_booked_tt: {
    en: "You already booked this slot",
    ar: "لقد قمت بحجز هذا الموعد بالفعل",
  },
  tp_conflict_tt: {
    en: "You have another class at this time",
    ar: "لديك حصة أخرى في هذا الموعد",
  },
  tp_book_btn: { en: "Book this session", ar: "احجز هذه الحصة" },
  tp_view_schedule: { en: "View my schedule", ar: "عرض جدولي" },
  tp_val_write_review: {
    en: "Please write a short review first.",
    ar: "من فضلك اكتب تقييمًا قصيرًا أولًا.",
  },
  tp_val_choose_slot: {
    en: "Choose a day and time first.",
    ar: "اختر اليوم والموعد أولًا.",
  },
  tp_toast_anon: { en: "Anonymous student", ar: "طالب" },
  tp_toast_auth_review: { en: "Sign in to publish a review.", ar: "سجّل الدخول لنشر تقييمك." },
  tp_toast_err_review: { en: "Could not publish your review.", ar: "تعذر نشر تقييمك." },
  tp_toast_ok_review: {
    en: "Thanks! Your review is published.",
    ar: "شكراً لك! تم نشر تقييمك بنجاح.",
  },
  tp_toast_auth_book: { en: "Sign in to book a session.", ar: "سجّل الدخول لحجز حصة." },
  tp_toast_conflict_book: {
    en: "You already have a class on {day} at {time}.",
    ar: "لديك بالفعل حصة يوم {day} في الساعة {time}.",
  },
  tp_toast_ok_book: {
    en: "Booked {day} {time} with {name}.",
    ar: "تم حجز موعد يوم {day} الساعة {time} مع {name}.",
  },

  // Schedule Page
  sch_title: { en: "My Schedule", ar: "جدولي الدراسي" },
  sch_empty_sub: { en: "No sessions booked yet.", ar: "لا توجد حصص محجوزة بعد." },
  sch_count_sub: {
    en: "{n} upcoming session{plural} this week.",
    ar: "{n} حصص قادمة هذا الأسبوع.",
  },
  sch_empty_free: { en: "Your week is completely free.", ar: "أسبوعك فارغ تمامًا." },
  sch_empty_hint: {
    en: "Book a teacher or a full package to fill your timetable.",
    ar: "احجز مع مدرس أو باقة كاملة لتنظيم جدولك الدراسي.",
  },
  sch_browse_btn: { en: "Browse teachers", ar: "تصفح المدرسين" },
  sch_free_day: { en: "Free day", ar: "يوم فارغ" },
  sch_view_profile: { en: "View profile", ar: "عرض الملف" },
  sch_cancel_aria: { en: "Cancel session", ar: "إلغاء الحصة" },

  // Packages Page
  pkg_title: { en: "All-in-One Packages", ar: "الباقات الشاملة" },
  pkg_sub: {
    en: "Choose a ready bundle, or build your own mix of teachers across subjects. Two subjects save 10%, three or more save 20%.",
    ar: "اختر باقة جاهزة، أو شكّل مجموعتك الخاصة من المدرسين للمواد المختلفة. مادتان توفران 10%، وثلاث مواد أو أكثر توفر 20%.",
  },
  pkg_show_teachers: { en: "Show {n} teachers", ar: "عرض {n} مدرسين" },
  pkg_hide_teachers: { en: "Hide teachers", ar: "إخفاء المدرسين" },
  pkg_book_bundle: { en: "Book the whole bundle", ar: "حجز الباقة بالكامل" },
  pkg_build_title: { en: "Build your own package", ar: "صمّم باقتك بنفسك" },
  pkg_build_sub: {
    en: "Tap teachers to add or remove them from your bundle.",
    ar: "اضغط على المدرسين لإضافتهم أو إزالتهم من باقتك.",
  },
  pkg_your_package: { en: "Your package", ar: "باقتك المحجوزة" },
  pkg_empty_cart: {
    en: "Nothing added yet. Pick at least two subjects to unlock a discount.",
    ar: "لم تضف شيئًا بعد. اختر مادتين على الأقل للحصول على الخصم.",
  },
  pkg_subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  pkg_discount: { en: "Bundle discount", ar: "خصم الباقة" },
  pkg_total_per_week: { en: "Total per week", ar: "الإجمالي أسبوعيًا" },
  pkg_book_all: { en: "Book all in one click", ar: "حجز الكل بضغطة واحدة" },
  pkg_toast_auth: { en: "Sign in to book a package.", ar: "سجّل الدخول لحجز باقة." },
  pkg_toast_clash: {
    en: "All those slots clash with classes you already booked.",
    ar: "جميع هذه المواعيد تتعارض مع حصص حجزتها بالفعل.",
  },
  pkg_toast_added: {
    en: "{n} session{plural} added to your schedule.",
    ar: "تمت إضافة {n} حصص إلى جدولك الدراسي.",
  },
};

export function dayLabel(day: string, lang: Lang): string {
  const key = `day_${day.toLowerCase()}`;
  const entry = STRINGS[key];
  if (!entry) return day;
  return lang === "ar" ? entry.ar : entry.en;
}

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  t: (key: keyof typeof STRINGS | string, params?: Record<string, string | number>) => string;
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
    (key: string, params?: Record<string, string | number>) => {
      const entry = STRINGS[key];
      let text = entry ? (lang === "ar" ? entry.ar : entry.en) : key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return text;
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
