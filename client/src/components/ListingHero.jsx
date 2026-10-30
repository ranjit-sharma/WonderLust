import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { Expand, Tag, X } from "lucide-react";
import { formatPrice, imageUrl } from "../lib/format.js";
import SmoothImage from "./SmoothImage.jsx";
import { ease } from "./ui.jsx";

const RADIUS = 24; // 1.5rem; motion needs it inline to keep corners round while the photo expands

export default function ListingHero({ listing }) {
  const box = useRef(null);
  const [open, setOpen] = useState(false);

  // Gentle parallax: the photo drifts slower than the page while the hero scrolls away.
  const { scrollYProgress } = useScroll({ target: box, offset: ["start start", "end start"] });
  // The photo is 10% taller than its box (overflow above), so an 8% drift never shows an edge.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Height follows the viewport so the photo never swallows the screen */}
      <motion.div
        ref={box}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="relative h-[clamp(14rem,38vh,26rem)] lg:h-[clamp(18rem,52vh,28rem)]"
      >
        {!open && (
          <motion.button
            layoutId={`photo-${listing._id}`}
            onClick={() => setOpen(true)}
            style={{ borderRadius: RADIUS }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            aria-label="View photo full screen"
            className="group absolute inset-0 overflow-hidden bg-neutral-200 shadow-card dark:bg-neutral-800"
          >
            <motion.div style={{ y }} className="absolute inset-x-0 -top-[10%] bottom-0">
              <SmoothImage
                src={imageUrl(listing.image?.url, 1600)}
                alt={listing.title}
                className="size-full object-cover transition-transform duration-[1.2s] ease-smooth group-hover:scale-[1.04]"
              />
            </motion.div>
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent" />

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
              <div className="flex flex-wrap gap-2">
                {listing.category && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/30 backdrop-blur-md">
                    <Tag className="size-3.5" /> {listing.category}
                  </span>
                )}
                <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/30 backdrop-blur-md">
                  {formatPrice(listing.price)} / night
                </span>
              </div>
              <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-neutral-900 opacity-90 shadow-lift transition duration-500 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
                <Expand className="size-3.5" /> <span className="hidden sm:inline">View photo</span>
              </span>
            </div>
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] grid place-items-center p-4 sm:p-10" role="dialog" aria-modal="true" aria-label={listing.title}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              layoutId={`photo-${listing._id}`}
              style={{ borderRadius: RADIUS }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              className="relative max-h-full w-full max-w-6xl overflow-hidden shadow-2xl"
            >
              {/* same URL as the hero, so it is already cached and shows during the expand */}
              <img src={imageUrl(listing.image?.url, 1600)} alt={listing.title} className="max-h-[85dvh] w-full object-contain" />
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setOpen(false)}
              aria-label="Close photo"
              className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/25"
            >
              <X className="size-5" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
