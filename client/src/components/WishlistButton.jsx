import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth, useRequireLogin } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";

export default function WishlistButton({ listingId, variant = "overlay", onChange }) {
  const { user, setWishlisted } = useAuth();
  const requireLogin = useRequireLogin();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const saved = Boolean(
    Array.isArray(user?.wishlist) &&
      user.wishlist.some((item) => (typeof item === "string" ? item === listingId : item?._id === listingId))
  );

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireLogin() || busy) return;
    setBusy(true);
    try {
      const res = await api(`/listings/${listingId}/wishlist`, { method: "POST" });
      setWishlisted(listingId, res.saved);
      onChange?.(res.saved);
      toast(res.saved ? "Added to your wishlist." : "Removed from your wishlist.");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? "Remove from wishlist" : "Add to wishlist";
  const heart = (
    <span className="relative grid place-items-center">
      <motion.span key={String(saved)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
        <Heart
          className={`size-4 sm:size-5 transition-colors ${
            saved ? "fill-brand-500 text-brand-500" : variant === "overlay" ? "fill-black/40 text-white" : ""
          }`}
          strokeWidth={2.2}
        />
      </motion.span>
      {/* burst ring when an item is saved */}
      <AnimatePresence initial={false}>
        {saved && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full border-2 border-brand-400"
          />
        )}
      </AnimatePresence>
    </span>
  );

  if (variant === "overlay") {
    return (
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={toggle}
        aria-label={label}
        aria-pressed={saved}
        title={label}
        className="relative grid size-6 sm:size-7 place-items-center rounded-full bg-[#ebf0f7]/90 dark:bg-[#181b25]/90 border border-white/60 dark:border-white/10 shadow-sm transition hover:scale-110 active:scale-95 backdrop-blur-md after:absolute after:-inset-2 after:content-['']"
      >
        {heart}
      </motion.button>
    );
  }

  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={toggle} aria-pressed={saved} className="btn-ghost px-4 py-2.5">
      {heart}
      <span>{saved ? "Saved" : "Save"}</span>
    </motion.button>
  );
}
