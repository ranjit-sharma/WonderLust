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

    // 1. Instant Optimistic UI Update (0ms latency!)
    const targetState = !saved;
    setWishlisted(listingId, targetState);
    onChange?.(targetState);
    toast(targetState ? "Added to your wishlist." : "Removed from your wishlist.");

    setBusy(true);
    try {
      const res = await api(`/listings/${listingId}/wishlist`, { method: "POST" });
      if (typeof res?.saved === "boolean" && res.saved !== targetState) {
        setWishlisted(listingId, res.saved);
        onChange?.(res.saved);
      }
    } catch (err) {
      // Revert on failure
      setWishlisted(listingId, saved);
      onChange?.(saved);
      toast(err.message || "Failed to update wishlist", "error");
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? "Remove from wishlist" : "Add to wishlist";
  const heart = (
    <span className="relative grid place-items-center">
      <motion.span
        key={String(saved)}
        initial={{ scale: 0.5 }}
        animate={{ scale: [1.35, 0.92, 1] }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Heart
          className={`size-4 sm:size-5 transition-colors duration-200 ${
            saved
              ? "fill-brand-500 text-brand-500"
              : variant === "overlay"
              ? "fill-black/40 text-white"
              : "text-neutral-600 dark:text-neutral-300"
          }`}
          strokeWidth={2.2}
        />
      </motion.span>
      {/* burst ring when an item is saved */}
      <AnimatePresence initial={false}>
        {saved && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-400"
          />
        )}
      </AnimatePresence>
    </span>
  );

  if (variant === "overlay") {
    return (
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={toggle}
        aria-label={label}
        aria-pressed={saved}
        title={label}
        className="relative grid size-6 sm:size-7 place-items-center rounded-full transition hover:scale-110 active:scale-90 after:absolute after:-inset-2 after:content-[''] cursor-pointer"
      >
        {heart}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      aria-pressed={saved}
      className="btn-ghost px-4 py-2.5 cursor-pointer"
    >
      {heart}
      <span>{saved ? "Saved" : "Save"}</span>
    </motion.button>
  );
}
