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
  Star,
  User,
  Users,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useApi } from "../lib/useApi.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
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
    <Reveal delay={delay} as="section" className="card p-4 sm:p-6">
      <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <h2 className="text-base sm:text-lg font-bold">{title}</h2>
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
  const listing = booking.listing;
  return (
    <motion.li layout exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3.5 sm:gap-4 rounded-card border border-neutral-200 p-3.5 sm:p-4 sm:flex-row sm:items-center dark:border-neutral-800">
      {listing?.image?.url && <img src={imageUrl(listing.image.url, 320)} alt="" className="h-36 w-full rounded-xl object-cover sm:h-20 sm:w-28 shrink-0 bg-neutral-100 dark:bg-neutral-800" />}
      <div className="min-w-0 flex-1">
        {listing ? (
          <Link to={`/listings/${listing._id}`} className="font-bold text-sm sm:text-base hover:underline line-clamp-1">{listing.title}</Link>
        ) : (
          <b className="text-sm sm:text-base">Listing no longer available</b>
        )}
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <span className={`rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold capitalize ${statusStyles[booking.status]}`}>{booking.status}</span>
        <strong className="text-sm sm:text-base">{formatPrice(booking.totalPrice)}</strong>
        {listing && (
          <button
            onClick={booking.status === "cancelled" ? onDelete : onCancel}
            className="text-xs sm:text-sm font-semibold text-brand-600 hover:underline sm:ml-0 dark:text-brand-400 cursor-pointer"
          >
            {booking.status === "cancelled" ? "Delete" : "Cancel"}
          </button>
        )}
      </div>
    </motion.li>
  );
}

function HostBookingRow({ booking, onCancel, onDelete }) {
  const listing = booking.listing;
  const guest = booking.user;
  const nights = nightsBetween(booking.checkIn, booking.checkOut);

  return (
    <motion.li
      layout
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-3.5 sm:gap-4 rounded-card border border-neutral-200 bg-white p-3.5 sm:p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      <div className="flex flex-col gap-3.5 sm:gap-4 sm:flex-row sm:items-start">
        {listing?.image?.url && (
          <img
            src={imageUrl(listing.image.url, 320)}
            alt=""
            className="h-36 w-full rounded-xl object-cover sm:h-24 sm:w-32 shrink-0 bg-neutral-100 dark:bg-neutral-800"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {listing ? (
                <Link to={`/listings/${listing._id}`} className="font-bold text-sm sm:text-base hover:underline line-clamp-1">
                  {listing.title}
                </Link>
              ) : (
                <b className="text-sm sm:text-base">Listing no longer available</b>
              )}
              {listing && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {[listing.location, listing.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <span className={`rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold capitalize shrink-0 ${statusStyles[booking.status]}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-0.5">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 min-w-0">
              <User className="size-3.5 sm:size-4 text-brand-500 shrink-0" />
              <span className="truncate">
                Guest: <strong className="text-neutral-900 dark:text-white">{guest?.username || "Guest"}</strong>
              </span>
            </div>
            {guest?.email && (
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 min-w-0">
                <Mail className="size-3.5 sm:size-4 text-brand-500 shrink-0" />
                <a
                  href={`mailto:${guest.email}`}
                  title={`Email ${guest.email}`}
                  className="truncate font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {guest.email}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Calendar className="size-3.5 sm:size-4 text-brand-500 shrink-0" />
              <span>
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} ({nights} night{nights === 1 ? "" : "s"})
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Users className="size-3.5 sm:size-4 text-brand-500 shrink-0" />
              <span>
                {booking.guests} guest{booking.guests === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="mt-1.5 rounded-xl bg-neutral-50 p-2.5 text-xs text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Guest note: </span>
              "{booking.specialRequests}"
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-t border-neutral-100 pt-3 text-xs sm:text-sm dark:border-neutral-800">
        <span className="text-[11px] sm:text-xs text-neutral-400">
          Reserved on {formatDate(booking.createdAt)}
        </span>
        <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
          <p>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Payout: </span>
            <strong className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-neutral-100">
              {formatPrice(booking.totalPrice)}
            </strong>
          </p>
          {listing && (
            <button
              onClick={booking.status === "cancelled" ? onDelete : onCancel}
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400 cursor-pointer"
            >
              {booking.status === "cancelled" ? "Delete record" : "Cancel booking"}
            </button>
          )}
        </div>
      </div>
    </motion.li>
  );
}

export function Profile() {
  const { data, error, reload, setData } = useApi("/profile");
  const toast = useToast();

  if (error) return <div className="container-page py-16"><ErrorState error={error} onRetry={reload} /></div>;
  if (!data) return <PageLoader />;

  const { user, listings, reviews, wishlist, bookings, hostBookings = [] } = data;

  const [showAllHostBookings, setShowAllHostBookings] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [showAllListings, setShowAllListings] = useState(false);

  const visibleHostBookings = showAllHostBookings ? hostBookings : hostBookings.slice(0, 4);
  const visibleTrips = showAllTrips ? bookings : bookings.slice(0, 4);
  const visibleListings = showAllListings ? listings : listings.slice(0, 4);

  const bookingAction = async (booking, action, isHost = false) => {
    const verb = action === "cancel" ? "Cancel" : "Delete";
    if (!confirm(`${verb} this reservation?`)) return;
    try {
      const base = `/listings/${booking.listing._id}/bookings/${booking._id}`;
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
    <div className="container-page py-6 sm:py-10">
      <PageHeader eyebrow="Your dashboard" title={`Welcome, ${user.username} 👋`} />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease }}
            whileHover={{ y: -4 }}
            className="card flex items-center gap-2.5 p-3 sm:gap-4 sm:p-4"
          >
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-12 sm:rounded-2xl ${accents[i % accents.length].tint} ${accents[i % accents.length].text}`}>
              <s.icon className="size-5 sm:size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-extrabold truncate"><CountUp value={s.value} /></p>
              <p className="text-[11px] sm:text-sm text-neutral-500 truncate">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
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
                  <ul className="space-y-3.5 sm:space-y-4">
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
                  {hostBookings.length > 4 && (
                    <div className="mt-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllHostBookings((prev) => !prev)}
                        className="inline-block cursor-pointer text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
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
                <ul className="space-y-3">
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
                {bookings.length > 4 && (
                  <div className="mt-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAllTrips((prev) => !prev)}
                      className="inline-block cursor-pointer text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
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
            action={<Link to="/listings/new" className="btn-dark px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"><Plus className="size-3.5 sm:size-4" /> Add listing</Link>}
          >
            {listings.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm">You have not created any listings yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-3">
                  <AnimatePresence>
                    {visibleListings.map((l, i) => <ListingCard key={l._id} listing={l} index={i} />)}
                  </AnimatePresence>
                </div>
                {listings.length > 4 && (
                  <div className="mt-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAllListings((prev) => !prev)}
                      className="inline-block cursor-pointer text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                    >
                      {showAllListings ? "Show less" : `Show all ${listings.length} listings`}
                    </button>
                  </div>
                )}
              </>
            )}
          </Section>

          <Section title="My reviews" delay={0.1}>
            {reviews.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm">You have not written any reviews yet.</p>
            ) : (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {reviews.map(({ review, listing }) => (
                  <li key={review._id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 py-3.5 sm:py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      {listing ? <Link to={`/listings/${listing._id}`} className="font-bold text-sm sm:text-base hover:underline line-clamp-1">{listing.title}</Link> : <b className="text-sm sm:text-base">Listing review</b>}
                      <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{review.comment}</p>
                    </div>
                    <span className="inline-flex self-start sm:self-auto shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      <Star className="size-3 fill-current" /> {review.rating}/5
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Wishlist" action={<Link to="/wishlist" className="text-xs sm:text-sm font-semibold underline-offset-4 hover:underline">View all</Link>}>
            {wishlist.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm">Your wishlist is empty.</p>
            ) : (
              <ul className="space-y-3">
                {wishlist.slice(0, 5).map((l) => (
                  <li key={l._id}>
                    <Link to={`/listings/${l._id}`} className="group flex items-center gap-3">
                      <img src={imageUrl(l.image?.url, 160)} alt="" className="size-12 sm:size-14 rounded-xl object-cover transition group-hover:scale-105 bg-neutral-100 dark:bg-neutral-800 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold group-hover:underline">{l.title}</span>
                        <span className="text-xs sm:text-sm text-neutral-500">{formatPrice(l.price)} / night</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Profile settings">
            <dl className="space-y-3 text-xs sm:text-sm">
              <div className="flex flex-wrap justify-between gap-1 sm:gap-4">
                <dt className="text-neutral-500">Username</dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100 break-all">{user.username}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-1 sm:gap-4">
                <dt className="text-neutral-500">Email</dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100 break-all">{user.email}</dd>
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
        <p className="mt-2 text-xs sm:text-sm text-neutral-500">We look forward to hosting you.</p>

        <div className="card mt-6 sm:mt-8 overflow-hidden text-left">
          {listing.image?.url && <img src={imageUrl(listing.image.url, 1000)} alt="" className="h-40 w-full object-cover" />}
          <dl className="space-y-3 p-4 sm:p-6 text-xs sm:text-base">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-neutral-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
            ))}
            <hr className="border-neutral-200 dark:border-neutral-800" />
            <div className="flex justify-between"><dt>{nights} night{nights > 1 && "s"} × {formatPrice(listing.price)}</dt><dd>{formatPrice(basePrice)}</dd></div>
            <div className="flex justify-between"><dt>GST</dt><dd>{formatPrice(gst)}</dd></div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base sm:text-lg font-bold dark:border-neutral-800"><dt>Total</dt><dd>{formatPrice(booking.totalPrice)}</dd></div>
          </dl>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/profile" className="btn-dark w-full sm:w-auto">View my bookings</Link>
          <button onClick={cancel} className="btn-ghost w-full sm:w-auto">Cancel booking</button>
        </div>
      </motion.div>
    </div>
  );
}
