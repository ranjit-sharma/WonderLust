import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IndianRupee, MapPin, RotateCcw, SlidersHorizontal, Star, Tag, X } from "lucide-react";
import { formatPrice } from "../lib/format.js";
import { useMediaQuery } from "../lib/useMediaQuery.js";

const PRICE_MAX = 50000;
const PRICE_STEP = 500;

function PriceRange({ min, max, onChange }) {
  const left = (min / PRICE_MAX) * 100;
  const right = (max / PRICE_MAX) * 100;
  return (
    <div>
      <p className="mb-4 text-lg font-bold">
        {formatPrice(min)} – {formatPrice(max)}
        {max === PRICE_MAX && "+"}
      </p>
      <div className="relative h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-linear-to-r from-brand-500 to-brand-600"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <input
          type="range"
          className="range-thumb"
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={min}
          aria-label="Minimum price"
          onChange={(e) => onChange(Math.min(Number(e.target.value), max), max)}
        />
        <input
          type="range"
          className="range-thumb"
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={max}
          aria-label="Maximum price"
          onChange={(e) => onChange(min, Math.max(Number(e.target.value), min))}
        />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="border-b border-neutral-200 py-6 last:border-0 dark:border-neutral-800">
      <h3 className="mb-3 flex items-center gap-2 font-bold">
        <Icon className="size-4 text-brand-500" /> {title}
      </h3>
      {children}
    </section>
  );
}

export default function FilterPanel({ open, onClose, params, categories, onApply }) {
  const [draft, setDraft] = useState({});
  const desktop = useMediaQuery("(min-width: 768px)");
  const hidden = desktop ? { x: "100%" } : { y: "100%" };

  // Start each opening from the filters currently in the URL.
  useEffect(() => {
    if (!open) return;
    setDraft({
      location: params.get("location") || "",
      category: params.get("category") || "",
      minRating: params.get("minRating") || "",
      minPrice: Number(params.get("minPrice")) || 0,
      maxPrice: Number(params.get("maxPrice")) || PRICE_MAX,
    });
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, params, onClose]);

  const apply = (e) => {
    e.preventDefault();
    onApply({
      location: draft.location.trim(),
      category: draft.category,
      minRating: draft.minRating,
      minPrice: draft.minPrice > 0 ? String(draft.minPrice) : "",
      maxPrice: draft.maxPrice < PRICE_MAX ? String(draft.maxPrice) : "",
    });
  };

  const clear = () => onApply(null);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="filters-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          {/* Bottom sheet on phones, side drawer from md up */}
          <motion.form
            onSubmit={apply}
            initial={hidden}
            animate={{ x: 0, y: 0 }}
            exit={hidden}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl bg-white shadow-lift md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-3xl dark:bg-neutral-900"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-neutral-300 md:hidden dark:bg-neutral-700" />
            <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <h2 id="filters-title" className="flex items-center gap-2 text-lg font-bold">
                <SlidersHorizontal className="size-5" /> Filters
              </h2>
              <button type="button" onClick={onClose} aria-label="Close filters" className="rounded-full p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6">
              <Section icon={MapPin} title="Location">
                <input
                  type="search"
                  className="field"
                  placeholder="Search destination…"
                  value={draft.location ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                />
              </Section>
              <Section icon={IndianRupee} title="Price per night">
                <PriceRange
                  min={draft.minPrice ?? 0}
                  max={draft.maxPrice ?? PRICE_MAX}
                  onChange={(minPrice, maxPrice) => setDraft((d) => ({ ...d, minPrice, maxPrice }))}
                />
              </Section>
              <Section icon={Tag} title="Category">
                <div className="flex flex-wrap gap-2">
                  {["", "Trending", ...categories].map((c) => (
                    <button
                      type="button"
                      key={c || "all"}
                      onClick={() => setDraft((d) => ({ ...d, category: c }))}
                      aria-pressed={draft.category === c}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        draft.category === c
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-300"
                      }`}
                    >
                      {c || "All"}
                    </button>
                  ))}
                </div>
              </Section>
              <Section icon={Star} title="Minimum rating">
                <div className="grid grid-cols-5 gap-2">
                  {["", "1", "2", "3", "4"].map((r) => (
                    <button
                      type="button"
                      key={r || "any"}
                      onClick={() => setDraft((d) => ({ ...d, minRating: r }))}
                      aria-pressed={draft.minRating === r}
                      className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                        draft.minRating === r
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-300"
                      }`}
                    >
                      {r ? `${r}★+` : "Any"}
                    </button>
                  ))}
                </div>
              </Section>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <button type="button" onClick={clear} className="flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
                <RotateCcw className="size-4" /> Clear all
              </button>
              <button type="submit" className="btn-dark">
                Show results
              </button>
            </footer>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
