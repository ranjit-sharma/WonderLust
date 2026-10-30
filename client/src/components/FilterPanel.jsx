import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IndianRupee, MapPin, RotateCcw, SlidersHorizontal, Star, Tag, X } from "lucide-react";
import { api } from "../lib/api.js";
import { formatPrice } from "../lib/format.js";
import SearchableSelect from "./SearchableSelect.jsx";
import { categoryIcons } from "../lib/categories.js";
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
  const [allListings, setAllListings] = useState([]);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const locRef = useRef(null);

  // Load existing listings for location suggestions
  useEffect(() => {
    let active = true;
    api("/listings")
      .then((data) => {
        if (active && Array.isArray(data)) {
          setAllListings(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Close location suggestions when clicking outside
  useEffect(() => {
    if (!showLocSuggestions) return;
    const onPointerDown = (e) => {
      if (!locRef.current?.contains(e.target)) {
        setShowLocSuggestions(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showLocSuggestions]);

  // Matching location suggestions from existing listings (after >= 2 characters)
  const locationSuggestions = useMemo(() => {
    const locQuery = (draft.location || "").trim().toLowerCase();
    if (locQuery.length < 2) return [];

    const map = new Map();
    allListings.forEach((l) => {
      if (l.location) {
        const full = [l.location, l.country].filter(Boolean).join(", ");
        const loc = l.location.trim();
        if (
          loc.toLowerCase().includes(locQuery) ||
          full.toLowerCase().includes(locQuery) ||
          l.country?.toLowerCase().includes(locQuery)
        ) {
          if (!map.has(loc)) {
            map.set(loc, {
              location: loc,
              full: full !== loc ? full : loc,
              count: 1,
            });
          } else {
            map.get(loc).count += 1;
          }
        }
      }
    });

    return Array.from(map.values()).slice(0, 5);
  }, [allListings, draft.location]);
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
            className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-[#ebf0f7] shadow-lift border-t border-white/80 md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-3xl md:border-l md:border-t-0 dark:bg-[#181b25] dark:border-white/5"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-neutral-300 md:hidden dark:bg-neutral-700" />
            <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3.5 sm:px-6 sm:py-4 dark:border-neutral-800">
              <h2 id="filters-title" className="flex items-center gap-2 text-lg font-bold">
                <SlidersHorizontal className="size-5" /> Filters
              </h2>
              <button type="button" onClick={onClose} aria-label="Close filters" className="rounded-full p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28">
              <Section icon={MapPin} title="Location">
                <div ref={locRef} className="relative">
                  <input
                    type="search"
                    className="field"
                    placeholder="Search destination…"
                    value={draft.location ?? ""}
                    onFocus={() => {
                      if ((draft.location || "").trim().length >= 2) {
                        setShowLocSuggestions(true);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((d) => ({ ...d, location: val }));
                      setShowLocSuggestions(val.trim().length >= 2);
                    }}
                    autoComplete="off"
                  />

                  {/* Location suggestions after 2 letters */}
                  <AnimatePresence>
                    {showLocSuggestions && locationSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-white/80 bg-[#ebf0f7] p-1.5 shadow-lift backdrop-blur-xl dark:border-white/5 dark:bg-[#181b25]"
                      >
                        <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Matching Locations
                        </div>
                        <ul className="space-y-0.5">
                          {locationSuggestions.map((item) => (
                            <li key={item.location}>
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft((d) => ({ ...d, location: item.location }));
                                  setShowLocSuggestions(false);
                                }}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-neutral-100 text-brand-500 dark:bg-neutral-800">
                                    <MapPin className="size-3.5" />
                                  </div>
                                  <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                                    {item.full}
                                  </span>
                                </div>
                                <span className="ml-2 text-xs text-neutral-400 shrink-0">
                                  {item.count} {item.count === 1 ? "stay" : "stays"}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>
              <Section icon={IndianRupee} title="Price per night">
                <PriceRange
                  min={draft.minPrice ?? 0}
                  max={draft.maxPrice ?? PRICE_MAX}
                  onChange={(minPrice, maxPrice) => setDraft((d) => ({ ...d, minPrice, maxPrice }))}
                />
              </Section>
              <Section icon={Tag} title="Category">
                <SearchableSelect
                  id="filter-category"
                  value={draft.category ?? ""}
                  onChange={(val) => setDraft((d) => ({ ...d, category: val }))}
                  options={[
                    { value: "", label: "All categories" },
                    { value: "Trending", label: "Trending" },
                    ...categories.map((c) => ({ value: c, label: c })),
                  ]}
                  getIcon={(cat) => categoryIcons[cat]}
                  placeholder="All categories"
                  searchPlaceholder="Search category..."
                  clearable={true}
                />
              </Section>
              <Section icon={Star} title="Minimum rating">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {["", "1", "2", "3", "4"].map((r) => (
                    <button
                      type="button"
                      key={r || "any"}
                      onClick={() => setDraft((d) => ({ ...d, minRating: r }))}
                      aria-pressed={draft.minRating === r}
                      className={`rounded-xl border py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition ${
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

            <footer className="flex items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3.5 sm:px-6 sm:py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-neutral-800">
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
