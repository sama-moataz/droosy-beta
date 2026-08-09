import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { REVIEWS, type Review } from "./droosy-data";

export type Booking = {
  id: string;
  teacherId: string;
  day: string;
  time: string;
  bundleId?: string | undefined;
};

type Store = {
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id">) => "ok" | "conflict";
  addBookings: (bs: Omit<Booking, "id">[]) => number;
  removeBooking: (id: string) => void;
  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "date" | "verified">) => void;
  location: string;
  setLocation: (l: string) => void;
  cart: string[];
  toggleCart: (teacherId: string) => void;
  clearCart: () => void;
};

const Ctx = createContext<Store | null>(null);

let seq = 0;
const nextId = () => `x${++seq}`;

export function DroosyProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [location, setLocation] = useState("All areas");
  const [cart, setCart] = useState<string[]>([]);

  const value = useMemo<Store>(() => {
    const clash = (list: Booking[], b: Omit<Booking, "id">) =>
      list.some((x) => x.day === b.day && x.time === b.time);

    return {
      bookings,
      addBooking: (b) => {
        let result: "ok" | "conflict" = "ok";
        setBookings((prev) => {
          if (clash(prev, b)) {
            result = "conflict";
            return prev;
          }
          return [...prev, { ...b, id: nextId() }];
        });
        return result;
      },
      addBookings: (bs) => {
        let added = 0;
        setBookings((prev) => {
          const next = [...prev];
          for (const b of bs) {
            if (!clash(next, b)) {
              next.push({ ...b, id: nextId() });
              added++;
            }
          }
          return next;
        });
        return added;
      },
      removeBooking: (id) => setBookings((prev) => prev.filter((b) => b.id !== id)),
      reviews,
      addReview: (r) =>
        setReviews((prev) => [
          { ...r, id: nextId(), date: "Just now", verified: true },
          ...prev,
        ]),
      location,
      setLocation,
      cart,
      toggleCart: (teacherId) =>
        setCart((prev) =>
          prev.includes(teacherId)
            ? prev.filter((t) => t !== teacherId)
            : [...prev, teacherId],
        ),
      clearCart: () => setCart([]),
    };
  }, [bookings, reviews, location, cart]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDroosy() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDroosy must be used inside DroosyProvider");
  return ctx;
}
