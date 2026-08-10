import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  mapReview,
  type Bundle,
  type Catalog,
  type Review,
  type ReviewRow,
  type Teacher,
} from "./droosy-data";

export type Booking = {
  id: string;
  teacherId: string;
  day: string;
  time: string;
  bundleId?: string | undefined;
};

export type Profile = {
  id: string;
  fullName: string;
  role: "student" | "teacher";
};

export type ActionResult = "ok" | "conflict" | "auth" | "error";

type Store = {
  teachers: Teacher[];
  bundles: Bundle[];
  getTeacher: (id: string) => Teacher | undefined;

  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** id of the `teachers` row owned by this user (via teachers.owner_id), or null if they are not (yet) an approved teacher. */
  teacherId: string | null;
  authReady: boolean;
  signOut: () => Promise<void>;

  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id">) => Promise<ActionResult>;
  addBookings: (bs: Omit<Booking, "id">[]) => Promise<number | "auth">;
  removeBooking: (id: string) => Promise<void>;

  reviews: Review[];
  addReview: (
    r: Omit<Review, "id" | "date" | "verified">,
  ) => Promise<ActionResult>;

  location: string;
  setLocation: (l: string) => void;
  cart: string[];
  toggleCart: (teacherId: string) => void;
  clearCart: () => void;
};

const Ctx = createContext<Store | null>(null);

export function DroosyProvider({
  catalog,
  children,
}: {
  catalog: Catalog;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>(catalog.reviews);
  const [location, setLocation] = useState("all");
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => setReviews(catalog.reviews), [catalog.reviews]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      setTeacherId(null);
      setBookings([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const [
        { data: prof, error: profErr },
        { data: books, error: booksErr },
        { data: roles, error: rolesErr },
        { data: ownedTeacher, error: teacherErr },
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, role").eq("id", user.id).maybeSingle(),
        supabase.from("bookings").select("id, teacher_id, day, time, bundle_id"),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        // Canonical "is this user an existing teacher" signal: a teachers row they own.
        // Do NOT use profiles.role for this — it can be set at signup time and can drift
        // from the real teachers/owner_id relationship created by admin approval.
        supabase.from("teachers").select("id").eq("owner_id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      // These queries silently returning empty results is indistinguishable from "no data"
      // unless we log failures — surface them so role/teacher detection issues are visible.
      if (profErr) console.error("[droosy] failed to load profile", profErr);
      if (booksErr) console.error("[droosy] failed to load bookings", booksErr);
      if (rolesErr) console.error("[droosy] failed to load user_roles", rolesErr);
      if (teacherErr) console.error("[droosy] failed to load owned teacher", teacherErr);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      setTeacherId(ownedTeacher?.id ?? null);
      if (prof) {
        setProfile({
          id: prof.id,
          fullName: prof.full_name ?? "",
          role: (prof.role as "student" | "teacher") ?? "student",
        });
      }
      setBookings(
        (books ?? []).map((b) => ({
          id: b.id,
          teacherId: b.teacher_id,
          day: b.day,
          time: b.time,
          bundleId: b.bundle_id ?? undefined,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const getTeacher = useCallback(
    (id: string) => catalog.teachers.find((t) => t.id === id),
    [catalog.teachers],
  );

  const value = useMemo<Store>(() => {
    const insertBooking = async (b: Omit<Booking, "id">) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user!.id,
          teacher_id: b.teacherId,
          day: b.day,
          time: b.time,
          bundle_id: b.bundleId ?? null,
        })
        .select("id, teacher_id, day, time, bundle_id")
        .single();
      if (error || !data) return null;
      return {
        id: data.id,
        teacherId: data.teacher_id,
        day: data.day,
        time: data.time,
        bundleId: data.bundle_id ?? undefined,
      } satisfies Booking;
    };

    return {
      teachers: catalog.teachers,
      bundles: catalog.bundles,
      getTeacher,

      user,
      profile,
      isAdmin,
      teacherId,
      authReady,
      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setTeacherId(null);
        setBookings([]);
      },

      bookings,
      addBooking: async (b) => {
        if (!user) return "auth";
        if (bookings.some((x) => x.day === b.day && x.time === b.time))
          return "conflict";
        const created = await insertBooking(b);
        if (!created) return "conflict";
        setBookings((prev) => [...prev, created]);
        return "ok";
      },
      addBookings: async (bs) => {
        if (!user) return "auth";
        const taken = new Set(bookings.map((x) => `${x.day}|${x.time}`));
        const created: Booking[] = [];
        for (const b of bs) {
          const key = `${b.day}|${b.time}`;
          if (taken.has(key)) continue;
          const row = await insertBooking(b);
          if (row) {
            taken.add(key);
            created.push(row);
          }
        }
        if (created.length) setBookings((prev) => [...prev, ...created]);
        return created.length;
      },
      removeBooking: async (id) => {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        await supabase.from("bookings").delete().eq("id", id);
      },

      reviews,
      addReview: async (r) => {
        if (!user) return "auth";
        const { data, error } = await supabase
          .from("reviews")
          .insert({
            teacher_id: r.teacherId,
            user_id: user.id,
            student_name: r.student,
            rating: r.rating,
            body: r.text,
            verified: true,
          })
          .select("*")
          .single();
        if (error || !data) return "error";
        setReviews((prev) => [mapReview(data as ReviewRow), ...prev]);
        return "ok";
      },

      location,
      setLocation,
      cart,
      toggleCart: (id) =>
        setCart((prev) =>
          prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        ),
      clearCart: () => setCart([]),
    };
  }, [
    catalog.teachers,
    catalog.bundles,
    getTeacher,
    user,
    profile,
    isAdmin,
    teacherId,
    authReady,
    bookings,
    reviews,
    location,
    cart,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDroosy() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDroosy must be used inside DroosyProvider");
  return ctx;
}
