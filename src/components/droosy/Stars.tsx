import { Star } from "lucide-react";

export function Stars({
  value,
  size = 14,
  onSelect,
}: {
  value: number;
  size?: number;
  onSelect?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const star = (
          <Star
            size={size}
            className={
              filled ? "fill-accent text-accent" : "text-muted-foreground/40"
            }
          />
        );
        return onSelect ? (
          <button
            key={i}
            type="button"
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onClick={() => onSelect(i)}
            className="rounded p-0.5 transition-transform hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </div>
  );
}
