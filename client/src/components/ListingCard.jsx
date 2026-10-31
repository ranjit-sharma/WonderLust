import { Link } from "react-router";
import { motion } from "motion/react";
import { Tag } from "lucide-react";
import { formatPrice, GST_RATE, imageUrl } from "../lib/format.js";
import WishlistButton from "./WishlistButton.jsx";
import SmoothImage from "./SmoothImage.jsx";
import { ease, Rating } from "./ui.jsx";

export default function ListingCard({ listing, index = 0, showCount = false, onWishlistChange }) {
  if (!listing) return null;
  const price = Math.round((Number(listing.price) || 0) * (1 + GST_RATE));

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, ease } }}
      viewport={{ once: true, margin: "160px" }}
      // Stagger only the initial viewport row so scroll remains silky smooth without hitching
      transition={{ duration: 0.35, delay: index < 6 ? (index % 6) * 0.04 : 0, ease }}
      className="group relative will-change-transform"
    >
      <Link
        to={`/listings/${listing._id}`}
        className="block rounded-card focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3.6] overflow-hidden rounded-card bg-neutral-200 dark:bg-neutral-800">
          <SmoothImage
            src={imageUrl(listing.image?.url, 600)}
            alt={listing.title}
            // first rows are on screen right away; the rest load as they scroll near
            loading={index < 12 ? "eager" : "lazy"}
            className="size-full object-cover transition-transform duration-[0.8s] ease-smooth group-hover:scale-[1.04]"
          />
          {/* soft shade so the tag and heart read on bright photos */}
          <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/25 to-transparent pointer-events-none" />
        </div>

        <div className="mt-2 sm:mt-3 px-0.5 sm:px-1">
          {/* Line 1: Listing Title (Highlighted) */}
          <h3 className="min-w-0 truncate font-bold text-xs sm:text-base text-neutral-900 dark:text-neutral-100">
            {listing.title}
          </h3>

          {/* Line 2: Address */}
          <p className="mt-0.5 sm:mt-1 min-w-0 truncate text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400">
            {[listing.location, listing.country].filter(Boolean).join(", ")}
          </p>

          {/* Line 3: Price & Star Rating */}
          <div className="mt-0.5 sm:mt-1 flex items-center justify-between gap-1.5 sm:gap-2">
            <p className="text-xs sm:text-[15px]">
              <span className="inline-block font-bold text-neutral-900 dark:text-neutral-100">
                {formatPrice(price)}
              </span>{" "}
              <span className="text-neutral-500 dark:text-neutral-400 text-[11px] sm:text-sm">night</span>
            </p>
            {"averageRating" in listing && (
              <Rating
                value={listing.averageRating}
                count={listing.reviewCount}
                showCount={showCount}
                className="shrink-0 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] sm:text-sm"
              />
            )}
          </div>
        </div>
      </Link>
      {/* Top bar: category tag and wishlist button aligned responsively on both mobile and desktop */}
      <div className="pointer-events-none absolute inset-x-1.5 top-1.5 z-10 flex items-center justify-between gap-1 sm:inset-x-3 sm:top-3 sm:gap-2">
        {listing.category ? (
          <span className="pointer-events-auto inline-flex h-5 sm:h-7 items-center gap-1 sm:gap-1.5 max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] truncate rounded-full bg-black/55 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-white shadow-sm ring-1 ring-white/15 backdrop-blur-md">
            <Tag className="size-2.5 sm:size-3 shrink-0 stroke-[2.2] text-white" />
            <span className="truncate">{listing.category}</span>
          </span>
        ) : (
          <span />
        )}
        <div className="pointer-events-auto shrink-0">
          <WishlistButton listingId={listing._id} onChange={onWishlistChange} />
        </div>
      </div>
    </motion.article>
  );
}

export function ListingCardSkeleton() {
  const bar = "rounded-full bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800";
  return (
    <div aria-hidden="true">
      <div className={`aspect-[4/3.6] rounded-card ${bar.replace("rounded-full ", "")}`} />
      <div className="mt-3 space-y-2 px-1">
        <div className={`h-4 w-3/4 ${bar}`} />
        <div className={`h-3 w-1/2 ${bar}`} />
        <div className={`h-4 w-1/3 ${bar}`} />
      </div>
    </div>
  );
}
