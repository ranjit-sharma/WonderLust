import { useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { CalendarCheck, Heart, House, Plus, Star } from "lucide-react";
import { api } from "../lib/api.js";
import { useApi } from "../lib/useApi.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { formatDate, formatPrice, imageUrl } from "../lib/format.js";
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
    <Reveal delay={delay} as="section" className="card p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
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
    <motion.li layout exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 rounded-card border border-neutral-200 p-4 sm:flex-row sm:items-center dark:border-neutral-800">
      {listing?.image?.url && <img src={imageUrl(listing.image.url, 320)} alt="" className="h-36 w-full rounded-xl object-cover sm:h-20 sm:w-28" />}
      <div className="min-w-0 flex-1">
        {listing ? (
          <Link to={`/listings/${listing._id}`} className="font-bold hover:underline">{listing.title}</Link>
        ) : (
          <b>Listing no longer available</b>
        )}
        <p className="text-sm text-neutral-500">
          {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[booking.status]}`}>{booking.status}</span>
        <strong>{formatPrice(booking.totalPrice)}</strong>
        {listing && (
          <button
            onClick={booking.status === "cancelled" ? onDelete : onCancel}
            className="ml-auto text-sm font-semibold text-brand-600 hover:underline sm:ml-0 dark:text-brand-400"
          >
            {booking.status === "cancelled" ? "Delete" : "Cancel"}
          </button>
        )}
      </div>
    </motion.li>
  );
}

export function Profile() {
  const { data, error, reload, setData } = useApi("/profile");
  const toast = useToast();

  if (error) return <div className="container-page py-16"><ErrorState error={error} onRetry={reload} /></div>;
  if (!data) return <PageLoader />;

  const { user, listings, reviews, wishlist, bookings } = data;

  const bookingAction = async (booking, action) => {
    if (action === "cancel" && !confirm("Cancel this booking?")) return;
    try {
      const base = `/listings/${booking.listing._id}/bookings/${booking._id}`;
      if (action === "cancel") {
        const updated = await api(`${base}/cancel`, { method: "POST" });
        setData({ ...data, bookings: bookings.map((b) => (b._id === booking._id ? { ...b, status: updated.status } : b)) });
        toast("Your booking has been cancelled.");
      } else {
        await api(base, { method: "DELETE" });
        setData({ ...data, bookings: bookings.filter((b) => b._id !== booking._id) });
        toast("Cancelled booking deleted.");
      }
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const stats = [
    { label: "Listings", value: listings.length, icon: House },
    { label: "Bookings", value: bookings.length, icon: CalendarCheck },
    { label: "Reviews", value: reviews.length, icon: Star },
    { label: "Wishlist", value: wishlist.length, icon: Heart },
  ];

  return (
    <div className="container-page py-10">
      <PageHeader eyebrow="Your dashboard" title={`Welcome, ${user.username} 👋`} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease }}
            whileHover={{ y: -4 }}
            className="card flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5"
          >
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${accents[i % accents.length].tint} ${accents[i % accents.length].text}`}>
              <s.icon className="size-6" />
            </span>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold"><CountUp value={s.value} /></p>
              <p className="text-xs sm:text-sm text-neutral-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Section title="My bookings">
            {bookings.length === 0 ? (
              <p className="text-neutral-500">You have not booked any stays yet.</p>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence>
                  {bookings.map((b) => (
                    <BookingRow key={b._id} booking={b} onCancel={() => bookingAction(b, "cancel")} onDelete={() => bookingAction(b, "delete")} />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </Section>

          <Section
            title="My listings"
            delay={0.05}
            action={<Link to="/listings/new" className="btn-dark px-4 py-2"><Plus className="size-4" /> Add listing</Link>}
          >
            {listings.length === 0 ? (
              <p className="text-neutral-500">You have not created any listings yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l, i) => <ListingCard key={l._id} listing={l} index={i} />)}
              </div>
            )}
          </Section>

          <Section title="My reviews" delay={0.1}>
            {reviews.length === 0 ? (
              <p className="text-neutral-500">You have not written any reviews yet.</p>
            ) : (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {reviews.map(({ review, listing }) => (
                  <li key={review._id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      {listing ? <Link to={`/listings/${listing._id}`} className="font-bold hover:underline">{listing.title}</Link> : <b>Listing review</b>}
                      <p className="mt-1 text-sm text-neutral-500">{review.comment}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      <Star className="size-3 fill-current" /> {review.rating}/5
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Wishlist" action={<Link to="/wishlist" className="text-sm font-semibold underline-offset-4 hover:underline">View all</Link>}>
            {wishlist.length === 0 ? (
              <p className="text-neutral-500">Your wishlist is empty.</p>
            ) : (
              <ul className="space-y-3">
                {wishlist.slice(0, 5).map((l) => (
                  <li key={l._id}>
                    <Link to={`/listings/${l._id}`} className="group flex items-center gap-3">
                      <img src={imageUrl(l.image?.url, 160)} alt="" className="size-14 rounded-xl object-cover transition group-hover:scale-105" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold group-hover:underline">{l.title}</span>
                        <span className="text-sm text-neutral-500">{formatPrice(l.price)} / night</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Profile settings">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Username</dt><dd className="truncate font-semibold">{user.username}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Email</dt><dd className="truncate font-semibold">{user.email}</dd></div>
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
    <div className="container-wide py-10">
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
    <motion.svg viewBox="0 0 52 52" className="size-20" initial="hidden" animate="show">
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
    <div className="container-page max-w-xl py-8 sm:py-12 text-center">
      <div className="flex justify-center"><AnimatedCheck /></div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5, ease }}>
        <p className="mt-6 text-sm font-semibold tracking-wide text-emerald-600 uppercase">Reservation confirmed</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Your stay at {listing.title} is booked</h1>
        <p className="mt-2 text-neutral-500">We look forward to hosting you.</p>

        <div className="card mt-8 overflow-hidden text-left">
          {listing.image?.url && <img src={imageUrl(listing.image.url, 1000)} alt="" className="h-40 w-full object-cover" />}
          <dl className="space-y-3 p-4 sm:p-6 text-sm sm:text-base">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-neutral-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
            ))}
            <hr className="border-neutral-200 dark:border-neutral-800" />
            <div className="flex justify-between"><dt>{nights} night{nights > 1 && "s"} × {formatPrice(listing.price)}</dt><dd>{formatPrice(basePrice)}</dd></div>
            <div className="flex justify-between"><dt>GST</dt><dd>{formatPrice(gst)}</dd></div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold dark:border-neutral-800"><dt>Total</dt><dd>{formatPrice(booking.totalPrice)}</dd></div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/profile" className="btn-dark">View my bookings</Link>
          <button onClick={cancel} className="btn-ghost">Cancel booking</button>
        </div>
      </motion.div>
    </div>
  );
}
