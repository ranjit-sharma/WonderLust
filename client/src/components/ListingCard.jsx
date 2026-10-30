import { Link } from "react-router";
import { motion } from "motion/react";
import { formatPrice, GST_RATE, imageUrl } from "../lib/format.js";
import WishlistButton from "./WishlistButton.jsx";
import SmoothImage from "./SmoothImage.jsx";
import { ease, Rating } from "./ui.jsx";

export default function ListingCard({ listing, index = 0, showTax = false, onWishlistChange }) {
  const price = showTax ? listing.price * (1 + GST_RATE) : listing.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25, ease } }}
      viewport={{ once: true, margin: "-40px" }}
      // stagger across a row of up to 7 cards
      transition={{ duration: 0.6, delay: (index % 7) * 0.05, ease }}
      className="group relative"
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
            loading={index < 7 ? "eager" : "lazy"}
            className="size-full object-cover transition-transform duration-[1.1s] ease-smooth group-hover:scale-[1.05]"
          />
          {/* soft shade so the tag and heart read on bright photos */}
          <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/25 to-transparent" />

          {listing.category && (
            <span className="absolute top-3 left-3 max-w-[calc(100%-4rem)] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-neutral-800 shadow-sm backdrop-blur dark:bg-neutral-900/80 dark:text-neutral-100">
              {listing.category}
            </span>
          )}
        </div>

        <div className="mt-3 px-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate font-bold text-neutral-900 dark:text-neutral-100">{listing.title}</h3>
            {"averageRating" in listing && (
              <Rating value={listing.averageRating} count={listing.reviewCount} className="shrink-0 text-xs sm:text-sm" />
            )}
          </div>
          <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
            {[listing.location, listing.country].filter(Boolean).join(", ")}
          </p>
          <p className="mt-1 text-[15px]">
            <motion.span
              key={String(showTax)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="inline-block font-bold"
            >
              {formatPrice(price)}
            </motion.span>{" "}
            <span className="text-neutral-500 dark:text-neutral-400">night{showTax && " incl. GST"}</span>
          </p>
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <WishlistButton listingId={listing._id} onChange={onWishlistChange} />
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
