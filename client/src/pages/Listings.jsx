import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence, animate, motion } from "motion/react";
import { BadgePercent, ChevronLeft, ChevronRight, SearchX, SlidersHorizontal } from "lucide-react";
import { getMeta } from "../lib/api.js";
import { useApi } from "../lib/useApi.js";
import { categoryIcons } from "../lib/categories.js";
import ListingCard, { ListingCardSkeleton } from "../components/ListingCard.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import { EmptyState, ErrorState, ease } from "../components/ui.jsx";

const FILTER_KEYS = ["location", "country", "minPrice", "maxPrice", "minRating"];

function Hero() {
  const words = "Find a place that feels like yours".split(" ");
  return (
    <section className="relative pt-8 pb-4 sm:pt-12">
      {/* soft glow that fades out before the edges, so it never shows a hard border */}
      {/* glow drifts slowly behind the headline */}
      <motion.div
        aria-hidden="true"
        animate={{ x: ["0%", "4%", "-2%", "0%"], y: ["0%", "-6%", "4%", "0%"], scale: [1, 1.06, 0.98, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_30%_45%_at_25%_50%,rgb(254_66_77/0.13),transparent_70%),radial-gradient(ellipse_30%_45%_at_55%_40%,rgb(139_92_246/0.11),transparent_70%),radial-gradient(ellipse_25%_40%_at_80%_60%,rgb(14_165_233/0.10),transparent_70%)]"
      />
      <h1 className="text-3xl leading-[1.08] font-extrabold tracking-tight [perspective:800px] sm:text-4xl lg:text-[2.6rem] xl:text-[3.25rem] 2xl:text-6xl">
        {words.map((word, i) => (
          <motion.span
            key={i}
            // transform + opacity only: GPU-composited, so it stays smooth on phones
            initial={{ opacity: 0, y: "0.5em", rotateX: -40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.9, delay: i * 0.07, ease }}
            style={{ transformOrigin: "50% 100%" }}
            className={`mr-[0.25em] inline-block ${i >= words.length - 2 ? "text-brand-500" : ""}`}
          >
            {word}
          </motion.span>
        ))}
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease }}
        className="mt-4 max-w-2xl text-neutral-500 sm:text-lg dark:text-neutral-400"
      >
        Stays with character, welcoming hosts, and destinations that turn ordinary trips into stories worth telling.
      </motion.p>
    </section>
  );
}

function CategoryBar({ categories, active, onSelect }) {
  const scroller = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  // Which sides still have hidden categories; drives the arrows and edge fades.
  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, categories]);

  // Bring the selected category into view, e.g. when the page opens on ?category=Tiny Homes.
  useEffect(() => {
    const el = scroller.current;
    const tab = el?.querySelector('[aria-selected="true"]');
    if (tab) el.scrollTo({ left: tab.offsetLeft - el.clientWidth / 2 + tab.offsetWidth / 2, behavior: "smooth" });
  }, [active, categories]);

  const animRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (!el) return;
    const distance = dir * Math.max(el.clientWidth * 0.65, 260);
    const start = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(start + distance, maxScroll));

    if (animRef.current) {
      animRef.current.stop();
    }

    animRef.current = animate(start, target, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (val) => {
        el.scrollLeft = val;
      },
    });
  };
  const fade = `linear-gradient(to right, ${edges.left ? "transparent, black 56px" : "black"}, ${edges.right ? "black calc(100% - 56px), transparent" : "black"})`;
  const arrow =
    "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-card transition duration-300 ease-smooth hover:scale-110 hover:shadow-lift md:grid dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";

  return (
    <div className="relative">
      <AnimatePresence>
        {edges.left && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => scrollBy(-1)}
            aria-label="Scroll categories left"
            className={`${arrow} left-0`}
          >
            <ChevronLeft className="size-4" />
          </motion.button>
        )}
        {edges.right && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => scrollBy(1)}
            aria-label="Scroll categories right"
            className={`${arrow} right-0`}
          >
            <ChevronRight className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
      <div
        ref={scroller}
        onScroll={measure}
        style={{ maskImage: fade, WebkitMaskImage: fade }}
        className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        role="tablist"
        aria-label="Categories"
      >
        {["Trending", ...categories].map((name) => {
          const Icon = categoryIcons[name];
          const selected = active === name;
          return (
            <button
              key={name}
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(selected ? "" : name)}
              className={`group relative flex shrink-0 flex-col items-center gap-1.5 px-3 pt-2 pb-3 text-xs font-semibold transition ${
                selected ? "text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {Icon && (
                // pops when chosen, springs up on hover
                <motion.span
                  animate={selected ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1, rotate: 0 }}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 14 } }}
                  // keyframes need a timed animation; springs only take two values
                  transition={{ duration: 0.45, ease }}
                  className="grid"
                >
                  <Icon className="size-6" strokeWidth={1.8} />
                </motion.span>
              )}
              <span className="whitespace-nowrap">{name}</span>
              {selected && (
                <motion.span
                  layoutId="category-underline"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-neutral-900 dark:bg-white"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaxSwitch({ checked, onChange, className }) {
  return (
    <label className={`pill cursor-pointer has-focus-visible:ring-4 has-focus-visible:ring-brand-500/25 ${checked ? "pill-active" : ""} ${className}`}>
      <BadgePercent className={`size-4 transition-colors duration-300 ${checked ? "text-brand-500" : "text-neutral-500"}`} />
      <span className="hidden xl:inline">Show prices with GST</span>
      <span className="xl:hidden">Incl. GST</span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={`relative ml-1 h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ease-smooth ${
          checked ? "bg-linear-to-r from-brand-500 to-brand-600 shadow-[0_4px_12px_-4px_rgb(254_66_77/0.7)]" : "bg-neutral-200 dark:bg-neutral-700"
        }`}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="absolute top-1 left-1 size-4 rounded-full bg-white shadow-md"
        />
      </span>
    </label>
  );
}

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const { data: listings, error, loading, reload } = useApi(`/listings?${params}`);

  useEffect(() => {
    getMeta().then((m) => setCategories(m.categories)).catch(() => {});
  }, []);

  const category = params.get("category") || "";
  const activeFilters = FILTER_KEYS.filter((k) => params.get(k)).length;

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  const applyFilters = (values) => {
    setFiltersOpen(false);
    if (values === null) return setParams({});
    update(values);
  };

  return (
    <div className="container-wide">
      <Hero />

      <div className="z-30 -mx-4 mt-4 md:sticky md:top-[81px] border-b border-neutral-200/80 bg-[#ebf0f7]/90 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 xl:-mx-[1in] xl:px-[1in] dark:border-neutral-800 dark:bg-ink/90">
        <div className="flex items-center gap-3 pt-2">
          <div className="min-w-0 flex-1">
            <CategoryBar categories={categories} active={category} onSelect={(c) => update({ category: c })} />
          </div>
          <div className="flex shrink-0 items-center gap-2 pb-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltersOpen(true)}
              aria-label="Filters"
              className={`pill relative focus-visible:ring-4 focus-visible:ring-brand-500/25 focus-visible:outline-none ${activeFilters ? "pill-active" : ""}`}
            >
              <SlidersHorizontal className={`size-4 ${activeFilters ? "text-brand-500" : "text-neutral-500"}`} />
              <span className="hidden sm:inline">Filters</span>
              <AnimatePresence>
                {activeFilters > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-600 text-[11px] font-bold text-white shadow-md ring-2 ring-white dark:ring-ink"
                  >
                    {activeFilters}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <TaxSwitch
              checked={showTax}
              onChange={setShowTax}
              className="hidden md:inline-flex"
            />
          </div>
        </div>
      </div>

      {/* Phones: the tax toggle sits under the bar */}
      <TaxSwitch
        checked={showTax}
        onChange={setShowTax}
        className="mt-4 flex w-full md:hidden [&>span:nth-child(2)]:flex-1"
      />

      {params.get("q") && (
        <p className="mt-6 text-neutral-500 dark:text-neutral-400">
          Results for <b className="text-neutral-900 dark:text-white">“{params.get("q")}”</b>
          {listings && ` · ${listings.length} stay${listings.length === 1 ? "" : "s"}`}
        </p>
      )}

      <div className="mt-8">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !listings ? (
          <div className="listing-grid">
            {Array.from({ length: 18 }, (_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No stays match your search"
            text="Try a different destination, or clear some filters to see more places."
            action={<button className="btn-dark" onClick={() => setParams({})}>Clear all filters</button>}
          />
        ) : (
          <motion.div
            animate={{ opacity: loading ? 0.5 : 1 }}
            className="listing-grid"
          >
            {listings.map((listing, i) => (
              <ListingCard key={listing._id} listing={listing} index={i} showTax={showTax} />
            ))}
          </motion.div>
        )}
      </div>

      <FilterPanel open={filtersOpen} onClose={closeFilters} params={params} categories={categories} onApply={applyFilters} />
    </div>
  );
}
