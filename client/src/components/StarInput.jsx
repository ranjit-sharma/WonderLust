import { useState } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";

const labels = ["Terrible", "Not good", "Average", "Very good", "Amazing"];

export default function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset>
      <legend className="label">Rating</legend>
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {labels.map((label, i) => {
            const n = i + 1;
            return (
              <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setHover(n)}>
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={value === n}
                  onChange={() => onChange(n)}
                  className="peer sr-only"
                />
                <motion.span
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  animate={{ scale: value === n ? [1, 1.35, 1] : 1 }}
                  className="block rounded peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500"
                >
                  <Star
                    className={`size-8 transition-colors ${n <= shown ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-600"}`}
                  />
                </motion.span>
                <span className="sr-only">
                  {n} star{n > 1 && "s"}, {label}
                </span>
              </label>
            );
          })}
        </div>
        <span className="text-sm font-medium text-neutral-500">{shown ? labels[shown - 1] : "Tap to rate"}</span>
      </div>
    </fieldset>
  );
}

export function Stars({ value, className = "size-4" }) {
  return (
    <span className="flex" aria-label={`${value} out of 5 stars`}>
      {labels.map((_, i) => (
        <Star key={i} className={`${className} ${i < value ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-700"}`} />
      ))}
    </span>
  );
}
