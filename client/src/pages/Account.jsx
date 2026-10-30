import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import {
  Calendar,
  CalendarCheck,
  Heart,
  House,
  Luggage,
  Mail,
  Plus,
  ShieldCheck,
  Star,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useApi } from "../lib/useApi.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { useMediaQuery } from "../lib/useMediaQuery.js";
import { formatDate, formatPrice, imageUrl, nightsBetween } from "../lib/format.js";
import ListingCard from "../components/ListingCard.jsx";
import { accents } from "../lib/categories.js";
import { EmptyState, ErrorState, PageHeader, PageLoader, Reveal, ease } from "../components/ui.jsx";

function CountUp({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease });
    return () => controls.stop();
  }, [count, value]);
  return <motion.span>{rounded}</motion.span>;
}

function Section({ title, action, children, delay = 0 }) {
  return (
    <Reveal delay={delay} as="section" className="card p-3 sm:p-6 rounded-2xl sm:rounded-card">
      <div className="mb-3.5 sm:mb-5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <h2 className="text-sm sm:text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </Reveal>
  );
}

const statusStyles = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  cancelled: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

function BookingRow({ booking, onCancel, onDelete }) {
  if (!booking) return null;
  const listing = booking?.listing;
  return (
    <motion.li
      layout
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col justify-between gap-2 sm:gap-3.5 rounded-xl sm:rounded-card border border-white/70 bg-[#ebf0f7] p-2 sm:p-4 shadow-card hover:shadow-lift transition-all duration-300 dark:border-white/5 dark:bg-[#181b25] min-w-0 overflow-hidden"
    >
      <div className="space-y-1.5 sm:space-y-2 min-w-0">
        {listing?.image?.url && (
          <img
            src={imageUrl(listing.image.url, 320)}
            alt=""
            className="aspect-[16/10] w-full rounded-lg sm:rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
          />
        )}
        <div className="min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-1 sm:gap-1.5">
            {listing?._id ? (
              <Link to={`/listings/${listing._id}`} className="font-bold text-xs sm:text-base hover:underline line-clamp-1 min-w-0 flex-1">
                {listing.title || "Listing"}
              </Link>
            ) : (
              <b className="text-xs sm:text-base min-w-0 flex-1 truncate">Listing unavailable</b>
            )}
            <span className={`rounded-full px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold capitalize shrink-0 ${statusStyles[booking?.status] || statusStyles.pending}`}>
              {booking?.status || "pending"}
            </span>
          </div>
          {listing && (
            <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {[listing.location, listing.country].filter(Boolean).join(", ")}
            </p>
          )}
          <div className="pt-0.5 text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-300 leading-tight">
            <span className="block truncate">{formatDate(booking?.checkIn)} → {formatDate(booking?.checkOut)}</span>
            <span className="text-neutral-400 dark:text-neutral-500">{booking?.guests || 1} guest{(booking?.guests || 1) === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-1.5 border-t border-neutral-100 pt-1.5 sm:pt-2 text-xs dark:border-neutral-800">
        <strong className="text-xs sm:text-base font-extrabold text-neutral-900 dark:text-white truncate">
          {formatPrice(booking?.totalPrice)}
        </strong>
        {listing?._id && (
          <button
            onClick={booking?.status === "cancelled" ? onDelete : onCancel}
            className="text-[10px] sm:text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 cursor-pointer"
          >
            {booking?.status === "cancelled" ? "Delete" : "Cancel"}
          </button>
        )}
      </div>
    </motion.li>
  );
}

function HostBookingRow({ booking, onCancel, onDelete }) {
  if (!booking) return null;
  const listing = booking?.listing;
  const guest = booking?.user;
  const nights = nightsBetween(booking?.checkIn, booking?.checkOut);

  return (
    <motion.li
      layout
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col justify-between gap-2 sm:gap-3.5 rounded-xl sm:rounded-card border border-white/70 bg-[#ebf0f7] p-2 sm:p-4 shadow-card hover:shadow-lift transition-all duration-300 dark:border-white/5 dark:bg-[#181b25] min-w-0 overflow-hidden"
    >
      <div className="space-y-1.5 sm:space-y-2 min-w-0">
        {listing?.image?.url && (
          <img
            src={imageUrl(listing.image.url, 320)}
            alt=""
            className="aspect-[16/10] w-full rounded-lg sm:rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
          />
        )}
        <div className="min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-1 sm:gap-1.5">
            {listing?._id ? (
              <Link to={`/listings/${listing._id}`} className="font-bold text-xs sm:text-base hover:underline line-clamp-1 min-w-0 flex-1">
                {listing.title || "Listing"}
              </Link>
            ) : (
              <b className="text-xs sm:text-base min-w-0 flex-1 truncate">Listing unavailable</b>
            )}
            <span className={`rounded-full px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold capitalize shrink-0 ${statusStyles[booking?.status] || statusStyles.pending}`}>
              {booking?.status || "pending"}
            </span>
          </div>

          {listing && (
            <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {[listing.location, listing.country].filter(Boolean).join(", ")}
            </p>
          )}

          <div className="pt-0.5 space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-neutral-700 dark:text-neutral-300 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <User className="size-3 text-brand-500 shrink-0" />
              <span className="truncate">Guest: <strong className="text-neutral-900 dark:text-white">{guest?.username || "Guest"}</strong></span>
            </div>
            {guest?.email && (
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <Mail className="size-3 text-brand-500 shrink-0" />
                <a href={`mailto:${guest.email}`} className="block truncate text-brand-600 hover:underline dark:text-brand-400 min-w-0">
                  {guest.email}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <Calendar className="size-3 text-brand-500 shrink-0" />
              <span className="truncate min-w-0">{formatDate(booking?.checkIn)} → {formatDate(booking?.checkOut)}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <Users className="size-3 text-brand-500 shrink-0" />
              <span className="truncate">{nights}n · {booking?.guests || 1} guest{(booking?.guests || 1) === 1 ? "" : "s"}</span>
            </div>
          </div>

          {booking?.specialRequests && (
            <div className="mt-1 rounded-md sm:rounded-lg bg-neutral-50 p-1.5 sm:p-2 text-[9px] sm:text-xs text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800 line-clamp-2">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Note: </span>
              "{booking.specialRequests}"
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-1.5 border-t border-neutral-100 pt-1.5 sm:pt-2 text-xs dark:border-neutral-800">
        <div className="min-w-0">
          <span className="text-[9px] sm:text-[10px] text-neutral-400 block sm:inline">Payout </span>
          <strong className="text-xs sm:text-base font-extrabold text-neutral-900 dark:text-neutral-100 truncate block sm:inline">
            {formatPrice(booking?.totalPrice)}
          </strong>
        </div>
        {listing?._id && (
          <button
            onClick={booking?.status === "cancelled" ? onDelete : onCancel}
            className="text-[10px] sm:text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 cursor-pointer self-start sm:self-auto"
          >
            {booking?.status === "cancelled" ? "Delete" : "Cancel"}
          </button>
        )}
      </div>
    </motion.li>
  );
}

export function Profile() {
  const { data, error, reload, setData } = useApi("/profile");
  const { user: authUser } = useAuth();
  const toast = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [showAllHostBookings, setShowAllHostBookings] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [showAllListings, setShowAllListings] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllWishlist, setShowAllWishlist] = useState(false);

  if (error) return <div className="container-page py-16"><ErrorState error={error} onRetry={reload} /></div>;
  if (!data) return <PageLoader />;

  const user = data?.user || authUser || {};
  const listings = Array.isArray(data?.listings) ? data.listings : [];
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  const wishlist = Array.isArray(data?.wishlist) ? data.wishlist : [];
  const bookings = Array.isArray(data?.bookings) ? data.bookings : [];
  const hostBookings = Array.isArray(data?.hostBookings) ? data.hostBookings : [];

  const initialListingCount = isDesktop ? 3 : 2;
  const initialCount = initialListingCount;

  // 2 reservations shown initially, rest in show/view options
  const visibleHostBookings = showAllHostBookings ? hostBookings : hostBookings.slice(0, 2);
  const visibleTrips = showAllTrips ? bookings : bookings.slice(0, 2);

  // listings: 3 on desktop, 2 on mobile
  const visibleListings = showAllListings ? listings : listings.slice(0, initialListingCount);

  // reviews: 3 on desktop, 2 on mobile
  const validReviews = reviews.filter((item) => item?.review);
  const visibleReviews = showAllReviews ? validReviews : validReviews.slice(0, initialListingCount);

  // 4 wishlist items shown initially, rest in show/view options
  const cleanWishlist = wishlist.filter(Boolean);
  const visibleWishlist = showAllWishlist ? cleanWishlist : cleanWishlist.slice(0, 4);

  const bookingAction = async (booking, action, isHost = false) => {
    const verb = action === "cancel" ? "Cancel" : "Delete";
    if (!confirm(`${verb} this reservation?`)) return;
    try {
      const listingId = booking?.listing?._id || booking?.listing;
      if (!listingId) {
        toast("Listing information is unavailable.", "error");
        return;
      }
      const base = `/listings/${listingId}/bookings/${booking._id}`;
      if (action === "cancel") {
        const updated = await api(`${base}/cancel`, { method: "POST" });
        if (isHost) {
          setData({
            ...data,
            hostBookings: hostBookings.map((b) => (b._id === booking._id ? { ...b, status: updated.status } : b)),
          });
          toast("Reservation cancelled.");
        } else {
          setData({
            ...data,
            bookings: bookings.map((b) => (b._id === booking._id ? { ...b, status: updated.status } : b)),
          });
          toast("Your booking has been cancelled.");
        }
      } else {
        await api(base, { method: "DELETE" });
        if (isHost) {
          setData({
            ...data,
            hostBookings: hostBookings.filter((b) => b._id !== booking._id),
          });
          toast("Reservation record deleted.");
        } else {
          setData({
            ...data,
            bookings: bookings.filter((b) => b._id !== booking._id),
          });
          toast("Cancelled booking deleted.");
        }
      }
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const isHost = listings.length > 0;
  const stats = [
    { label: "My Listings", value: listings.length, icon: House },
    ...(isHost
      ? [{ label: "Guest Bookings", value: hostBookings.length, icon: CalendarCheck }]
      : []),
    { label: "My Trips", value: bookings.length, icon: Luggage },
    { label: "Wishlist", value: wishlist.length, icon: Heart },
    ...(!isHost
      ? [{ label: "Reviews", value: reviews.length, icon: Star }]
      : []),
  ];

  return (
    <div className="container-page py-5 sm:py-10">
      <PageHeader eyebrow="Your dashboard" title={`Welcome, ${user.username || authUser?.username || "Guest"} 👋`} />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease }}
            whileHover={{ y: -4 }}
            className="card flex items-center gap-2 p-2.5 sm:gap-4 sm:p-4 rounded-xl sm:rounded-card min-w-0 overflow-hidden"
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg sm:size-12 sm:rounded-2xl ${accents[i % accents.length].tint} ${accents[i % accents.length].text}`}>
              <s.icon className="size-4 sm:size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base sm:text-2xl font-extrabold truncate"><CountUp value={s.value} /></p>
              <p className="text-[10px] sm:text-sm text-neutral-500 truncate">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 sm:mt-6 grid gap-5 sm:gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          {/* Host Reservations Section */}
          {isHost && (
            <Section
              title="Reservations on my listings"
              delay={0}
              action={
                hostBookings.length > 0 ? (
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    {hostBookings.length} reservation{hostBookings.length === 1 ? "" : "s"}
                  </span>
                ) : null
              }
            >
              {hostBookings.length === 0 ? (
                <p className="text-neutral-500 text-xs sm:text-sm">
                  No reservations received yet. When someone books one of your listings, their details, dates, and contact info will appear here.
                </p>
              ) : (
                <>
                  <ul className="grid grid-cols-2 gap-2 sm:gap-4">
                    <AnimatePresence>
                      {visibleHostBookings.map((b) => (
                        <HostBookingRow
                          key={b._id}
                          booking={b}
                          onCancel={() => bookingAction(b, "cancel", true)}
                          onDelete={() => bookingAction(b, "delete", true)}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                  {hostBookings.length > 2 && (
                    <div className="mt-3.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllHostBookings((prev) => !prev)}
                        className="inline-block cursor-pointer text-xs sm:text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                      >
                        {showAllHostBookings ? "Show less" : `Show all ${hostBookings.length} reservations`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </Section>
          )}

          <Section title="My trips">
            {bookings.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm">You have not booked any stays yet.</p>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-2 sm:gap-4">
                  <AnimatePresence>
                    {visibleTrips.map((b) => (
                      <BookingRow
                        key={b._id}
                        booking={b}
                        onCancel={() => bookingAction(b, "cancel", false)}
                        onDelete={() => bookingAction(b, "delete", false)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
                {bookings.length > 2 && (
                  <div className="mt-3.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAllTrips((prev) => !prev)}
                      className="inline-block cursor-pointer text-xs sm:text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                    >
                      {showAllTrips ? "Show less" : `Show all ${bookings.length} bookings`}
                    </button>
                  </div>
                )}
              </>
            )}
          </Section>

          <Section
            title="My listings"
            delay={0.05}
            action={<Link to="/listings/new" className="btn-dark px-2.5 py-1 sm:px-4 sm:py-2 text-[11px] sm:text-sm"><Plus className="size-3 sm:size-4" /> Add listing</Link>}
          >
            {listings.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm">You have not created any listings yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3">
                  <AnimatePresence>
                    {visibleListings.map((l, i) => <ListingCard key={l._id} listing={l} index={i} />)}
                  </AnimatePresence>
                </div>
                {listings.length > initialListingCount && (
                  <div className="mt-3.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAllListings((prev) => !prev)}
                      className="inline-block cursor-pointer text-xs sm:text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                    >
                      {showAllListings ? "Show less" : `Show all ${listings.length} listings`}
                    </button>
                  </div>
                )}
              </>
            )}
          </Section>

          <Section title="My reviews" delay={0.1}>
            {validReviews.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm">You have not written any reviews yet.</p>
            ) : (
              <>
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {visibleReviews.map(({ review, listing }) => (
                    <li key={review._id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 py-3 sm:py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        {listing ? <Link to={`/listings/${listing._id}`} className="font-bold text-xs sm:text-base hover:underline line-clamp-1">{listing.title}</Link> : <b className="text-xs sm:text-base">Listing review</b>}
                        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{review.comment}</p>
                      </div>
                      <span className="inline-flex self-start sm:self-auto shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        <Star className="size-3 fill-current" /> {review.rating}/5
                      </span>
                    </li>
                  ))}
                </ul>
                {validReviews.length > initialListingCount && (
                  <div className="mt-3.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAllReviews((prev) => !prev)}
                      className="inline-block cursor-pointer text-xs sm:text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                    >
                      {showAllReviews ? "Show less" : `Show all ${validReviews.length} reviews`}
                    </button>
                  </div>
                )}
              </>
            )}
          </Section>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <Section
            title="Wishlist"
            action={
              <Link to="/wishlist" className="text-xs sm:text-sm font-semibold underline-offset-4 hover:underline">
                View all ({cleanWishlist.length})
              </Link>
            }
          >
            {cleanWishlist.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm">Your wishlist is empty.</p>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-1 sm:gap-3">
                  {visibleWishlist.map((l) => (
                    <li key={l._id} className="min-w-0">
                      <Link to={`/listings/${l._id}`} className="group flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl border border-white/60 bg-[#ebf0f7] p-2 shadow-sm hover:shadow-card transition dark:border-white/5 dark:bg-[#181b25]">
                        <img
                          src={imageUrl(l.image?.url, 200)}
                          alt=""
                          className="aspect-[4/3] sm:aspect-square w-full sm:size-14 rounded-lg sm:rounded-xl object-cover transition group-hover:scale-105 bg-neutral-100 dark:bg-neutral-800 shrink-0"
                        />
                        <span className="min-w-0 w-full">
                          <span className="block truncate text-xs sm:text-sm font-semibold group-hover:underline">{l.title}</span>
                          <span className="text-[11px] sm:text-sm text-neutral-500 block truncate">{formatPrice(l.price)} / night</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {cleanWishlist.length > 4 && (
                  <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowAllWishlist((prev) => !prev)}
                      className="cursor-pointer text-xs sm:text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                    >
                      {showAllWishlist ? "Show less" : `Show all ${cleanWishlist.length} saved`}
                    </button>
                    <Link to="/wishlist" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                      Full page →
                    </Link>
                  </div>
                )}
              </>
            )}
          </Section>

          <Section title="Profile settings">
            <dl className="space-y-3 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4 border-b border-neutral-100 pb-2 sm:border-0 sm:pb-0 dark:border-neutral-800">
                <dt className="text-neutral-400 sm:text-neutral-500 text-[11px] sm:text-xs uppercase tracking-wider font-medium">Username</dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100 break-all">{user.username || authUser?.username || "—"}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4">
                <dt className="text-neutral-400 sm:text-neutral-500 text-[11px] sm:text-xs uppercase tracking-wider font-medium">Email</dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100 break-all">{user.email || authUser?.email || "—"}</dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}

export function Wishlist() {
  const { data, error, reload, setData } = useApi("/wishlist");

  return (
    <div className="container-wide py-6 sm:py-10">
      <PageHeader
        eyebrow="Places you love"
        title="My Wishlist"
        text="Keep your favorite stays close for your next escape."
        action={<Link to="/listings" className="btn-dark">Explore stays</Link>}
      />
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <PageLoader />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is waiting"
          text="Save a listing with the heart icon and it will appear here."
          action={<Link to="/listings" className="btn-primary">Find a stay</Link>}
        />
      ) : (
        <motion.div layout className="listing-grid">
          <AnimatePresence>
            {data.map((l, i) => (
              <ListingCard
                key={l._id}
                listing={l}
                index={i}
                onWishlistChange={(saved) => !saved && setData(data.filter((x) => x._id !== l._id))}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function AnimatedCheck() {
  return (
    <motion.svg viewBox="0 0 52 52" className="size-16 sm:size-20" initial="hidden" animate="show">
      <motion.circle
        cx="26" cy="26" r="24" fill="none" strokeWidth="3" className="stroke-emerald-500"
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.6, ease } } }}
      />
      <motion.path
        d="M15 27l7 7 15-15" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-500"
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { delay: 0.5, duration: 0.4, ease } } }}
      />
    </motion.svg>
  );
}

export function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  // Arrived without a fresh booking (e.g. page reload): bookings live on the profile.
  if (!state?.booking || !user) return <Navigate to="/profile" replace />;
  const { booking, listing, nights, basePrice, gst } = state;

  const cancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api(`/listings/${listing._id}/bookings/${booking._id}/cancel`, { method: "POST" });
      toast("Your booking has been cancelled.");
      navigate("/profile");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const rows = [
    ["Check-in", formatDate(booking.checkIn)],
    ["Check-out", formatDate(booking.checkOut)],
    ["Guests", booking.guests],
  ];

  return (
    <div className="container-page max-w-xl py-6 sm:py-12 text-center">
      <div className="flex justify-center"><AnimatedCheck /></div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5, ease }}>
        <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold tracking-wide text-emerald-600 uppercase">Reservation confirmed</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">Your stay at {listing.title} is booked</h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Pack your bags! Your spot is 100% reserved. Pay nothing online today.</p>

        <div className="card mt-6 sm:mt-8 overflow-hidden text-left">
          {listing.image?.url && <img src={imageUrl(listing.image.url, 1000)} alt="" className="h-40 w-full object-cover" />}
          <dl className="space-y-3 p-4 sm:p-6 text-xs sm:text-base">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-neutral-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
            ))}
            <hr className="border-neutral-200 dark:border-neutral-800" />
            <div className="flex justify-between"><dt>{nights} night{nights > 1 && "s"} × {formatPrice(listing.price)}</dt><dd>{formatPrice(basePrice)}</dd></div>
            <div className="flex justify-between"><dt>GST</dt><dd>{formatPrice(gst)}</dd></div>
            <div className="flex items-end justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <div>
                <dt className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">Total due at check-in</dt>
                <span className="block text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹0 paid today · Pay when you arrive
                </span>
              </div>
              <div className="text-right">
                <dd className="text-base sm:text-xl font-extrabold text-neutral-900 dark:text-white">{formatPrice(booking.totalPrice)}</dd>
                <span className="block text-[11px] font-medium text-neutral-400">Cash / UPI / Card at stay</span>
              </div>
            </div>
          </dl>
        </div>

        {/* Pay when you visit highlight card */}
        <div className="mt-4 sm:mt-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50/40 p-4 sm:p-5 text-left shadow-xs dark:border-emerald-800/70 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-neutral-900/60">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="grid size-10 sm:size-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Wallet className="size-5 sm:size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
                  Pay when you visit · Zero upfront payment
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-300">
                  <ShieldCheck className="size-3 stroke-[2.5]" /> Guaranteed Stay
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-emerald-900/85 dark:text-emerald-200/85">
                Sit back and relax! You do not need to pay anything right now. When you arrive at{" "}
                <strong className="font-bold text-emerald-950 dark:text-white">{listing.title}</strong>, simply hand over or scan to pay your host{" "}
                <strong className="font-extrabold text-emerald-950 dark:text-white">{formatPrice(booking.totalPrice)}</strong> using Cash, UPI, or Card.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 border-t border-emerald-200/60 pt-2.5 text-[11px] sm:text-xs font-semibold text-emerald-800 dark:border-emerald-800/50 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Pay in person
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Free cancellation anytime before check-in
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Host notified instantly
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/profile" className="btn-dark w-full sm:w-auto">View my bookings</Link>
          <button onClick={cancel} className="btn-ghost w-full sm:w-auto">Cancel booking</button>
        </div>
      </motion.div>
    </div>
  );
}
