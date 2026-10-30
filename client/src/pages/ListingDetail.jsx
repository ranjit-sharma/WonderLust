import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronUp, MapPin, MessageSquareText, Pencil, Tag, Trash2 } from "lucide-react";
import { api } from "../lib/api.js";
import { useApi } from "../lib/useApi.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { formatDate, formatPrice } from "../lib/format.js";
import { useMediaQuery } from "../lib/useMediaQuery.js";
import WishlistButton from "../components/WishlistButton.jsx";
import BookingCard from "../components/BookingCard.jsx";
import ListingHero from "../components/ListingHero.jsx";
import StarInput, { Stars } from "../components/StarInput.jsx";
import { ErrorState, PageLoader, Rating, Reveal, Spinner, ease } from "../components/ui.jsx";

const ListingMap = lazy(() => import("../components/ListingMap.jsx"));

function Avatar({ name, className = "size-12 text-lg" }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-900 font-bold text-white uppercase dark:from-neutral-200 dark:to-neutral-400 dark:text-neutral-900 ${className}`}>
      {name?.charAt(0) || "?"}
    </span>
  );
}

function ReviewForm({ listingId, onCreated }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast("Please choose a star rating.", "error");
    setBusy(true);
    try {
      await api(`/listings/${listingId}/reviews`, { method: "POST", body: { review: { rating, comment } } });
      setRating(0);
      setComment("");
      toast("New Review Created!");
      onCreated();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <h3 className="text-lg font-bold">Leave a review</h3>
      <StarInput value={rating} onChange={setRating} />
      <div>
        <label htmlFor="comment" className="label">Your experience</label>
        <textarea id="comment" required rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you love about this stay?" className="field resize-y" />
      </div>
      <button className="btn-dark" disabled={busy}>
        {busy && <Spinner className="size-4" />} Submit review
      </button>
    </form>
  );
}

function ReviewCard({ review, canDelete, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight + 2);
    }
  }, [review.comment]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease }}
      className="card flex flex-col p-5"
    >
      <div className="flex items-center gap-3">
        <Avatar name={review.author?.username} className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">@{review.author?.username || "deleted-user"}</p>
          <p className="text-xs text-neutral-500">{formatDate(review.createdAt)}</p>
        </div>
        <Stars value={review.rating} className="size-3.5" />
      </div>

      <p
        ref={textRef}
        className={`mt-4 flex-1 leading-relaxed text-neutral-700 dark:text-neutral-300 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {review.comment}
      </p>

      {((isClamped || (!expanded && review.comment?.length > 130)) || canDelete) && (
        <div className="mt-3 flex items-center justify-between gap-3 pt-1">
          <div>
            {(isClamped || (!expanded && review.comment?.length > 130)) && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="cursor-pointer text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {canDelete && (
            <button
              onClick={onDelete}
              className="ml-auto inline-flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              <Trash2 className="size-4" /> Delete review
            </button>
          )}
        </div>
      )}
    </motion.article>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { data, error, reload } = useApi(`/listings/${id}`);
  const wide = useMediaQuery("(min-width: 1024px)");
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (error) return <div className="container-page py-16"><ErrorState error={error} onRetry={reload} /></div>;
  if (!data) return <PageLoader />;

  const { listing, averageRating, reviewCount } = data;
  const isOwner = user && listing.owner?._id === user._id;
  const bookingCard = <BookingCard listing={listing} averageRating={averageRating} reviewCount={reviewCount} />;

  // Sort reviews newest first (latest comments show at the top)
  const sortedReviews = [...(listing.reviews || [])].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return String(b._id || "").localeCompare(String(a._id || ""));
  });

  const deleteListing = async () => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api(`/listings/${listing._id}`, { method: "DELETE" });
      toast("Listing Deleted!");
      navigate("/listings");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api(`/listings/${listing._id}/reviews/${reviewId}`, { method: "DELETE" });
      toast("Review Deleted!");
      reload();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <div className="container-page pt-4 pb-28 lg:pb-0">
      <Link to="/listings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
        <ChevronLeft className="size-4" /> All stays
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{listing.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <Rating value={averageRating} count={reviewCount} />
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{[listing.location, listing.state, listing.country].filter(Boolean).join(", ")}</span>
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <WishlistButton listingId={listing._id} variant="button" />
        </div>
      </motion.div>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          {/* Same column as the map, so the photo and the map share one width */}
          <ListingHero listing={listing} />
          <Reveal className="flex items-center gap-4 border-b border-neutral-200 pb-8 dark:border-neutral-800">
            <Avatar name={listing.owner?.username} />
            <div>
              <p className="text-lg font-bold">Hosted by {listing.owner?.username || "Unknown host"}</p>
              {listing.category && (
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  <Tag className="size-3.5" /> {listing.category}
                </p>
              )}
            </div>
          </Reveal>

          <Reveal>
            <h2 className="mb-3 text-xl font-bold">About this place</h2>
            <p className="leading-relaxed whitespace-pre-line text-neutral-700 dark:text-neutral-300">{listing.description}</p>
            {isOwner && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/listings/${listing._id}/edit`} className="btn-dark">
                  <Pencil className="size-4" /> Edit listing
                </Link>
                <button onClick={deleteListing} className="btn-ghost text-brand-600 hover:border-brand-500 dark:text-brand-400">
                  <Trash2 className="size-4" /> Delete
                </button>
              </div>
            )}
          </Reveal>

          {/* Small screens: the booking card sits in the page flow; wide screens: sticky sidebar */}
          {!wide && bookingCard}

          <Reveal className="border-t border-neutral-200 pt-10 dark:border-neutral-800">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold">Where you'll be</h2>
                <p className="text-sm text-neutral-500">Explore the surrounding area</p>
              </div>
              <strong className="text-sm">{listing.location}, {listing.country}</strong>
            </div>
            <div className="h-80 overflow-hidden rounded-card bg-neutral-100 sm:h-[26rem] dark:bg-neutral-900">
              {listing.geometry?.coordinates?.length === 2 && (
                <Suspense fallback={<PageLoader />}>
                  <ListingMap coordinates={listing.geometry.coordinates} title={listing.title} location={[listing.location, listing.country].filter(Boolean).join(", ")} />
                </Suspense>
              )}
            </div>
          </Reveal>

          <section className="border-t border-neutral-200 pt-10 dark:border-neutral-800">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold">
              <Rating value={averageRating} count={reviewCount} className="text-xl" />
              <span>· {reviewCount} review{reviewCount === 1 ? "" : "s"}</span>
            </h2>
            {user && !isOwner && <div className="mb-8"><ReviewForm listingId={listing._id} onCreated={reload} /></div>}
            {listing.reviews.length === 0 ? (
              <p className="flex items-center gap-2 text-neutral-500"><MessageSquareText className="size-5" /> No reviews yet. Be the first to share your stay.</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <AnimatePresence>
                    {(showAllReviews ? sortedReviews : sortedReviews.slice(0, 4)).map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        canDelete={user && review.author?._id === user._id}
                        onDelete={() => deleteReview(review._id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {sortedReviews.length > 4 && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAllReviews((prev) => !prev)}
                      className="inline-block cursor-pointer text-base font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                    >
                      {showAllReviews ? "Show less" : `Show all ${sortedReviews.length} reviews`}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {wide && (
          <aside>
            <div className="sticky top-28">{bookingCard}</div>
          </aside>
        )}
      </div>

      {/* Phones/tablets: price + reserve shortcut pinned to the bottom */}
      {!isOwner && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur-xl lg:hidden dark:border-neutral-800 dark:bg-ink/95"
        >
          <div className="container-page flex items-center justify-between gap-4 py-3">
            <p>
              <span className="text-lg font-extrabold">{formatPrice(listing.price)}</span>
              <span className="text-sm text-neutral-500"> / night</span>
            </p>
            <button
              onClick={() => document.getElementById("reserve")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary"
            >
              Reserve
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
