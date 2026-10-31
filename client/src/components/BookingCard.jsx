import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, CalendarCheck, Luggage, Mail, User, Users } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { bookingTotals, formatDate, formatPrice, GST_RATE, nightsBetween, toDateInput } from "../lib/format.js";
import { Rating, Spinner } from "./ui.jsx";

const statusStyles = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  cancelled: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function BookingCard({ listing, averageRating, reviewCount }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: 2, specialRequests: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hostBookings, setHostBookings] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const today = toDateInput(new Date());
  const dayAfterCheckIn = new Date(`${form.checkIn}T00:00`);
  dayAfterCheckIn.setDate(dayAfterCheckIn.getDate() + 1);
  const minCheckOut = form.checkIn ? toDateInput(dayAfterCheckIn) : today;
  const nights = nightsBetween(form.checkIn, form.checkOut);
  const totals = bookingTotals(nights, listing.price);
  const isOwner = user && listing.owner?._id === user._id;

  useEffect(() => {
    if (isOwner) {
      setLoadingBookings(true);
      api(`/listings/${listing._id}/bookings`)
        .then((data) => setHostBookings(Array.isArray(data) ? data : []))
        .catch(() => setHostBookings([]))
        .finally(() => setLoadingBookings(false));
    }
  }, [isOwner, listing._id]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await api(`/listings/${listing._id}/bookings`, { method: "POST", body: form });
      navigate("/booking-confirmed", { state: result });
    } catch (err) {
      toast(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <div id="reserve" className="card scroll-mt-36 p-4 sm:p-6 md:scroll-mt-28">
      <div className="flex items-baseline justify-between gap-3">
        <p>
          <span className="text-2xl font-extrabold">{formatPrice(Math.round((Number(listing.price) || 0) * (1 + GST_RATE)))}</span>
          <span className="text-neutral-500 dark:text-neutral-400"> / night</span>
        </p>
        <Rating value={averageRating} count={reviewCount} className="text-sm" />
      </div>

      {!user ? (
        <div className="mt-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Log in to choose your dates and reserve this stay.</p>
          <Link to={`/login?next=${encodeURIComponent(location.pathname)}`} className="btn-primary mt-4 w-full">
            Log in to reserve
          </Link>
        </div>
      ) : isOwner ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <CalendarCheck className="size-3.5" /> Host Reservation Manager
              </span>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {hostBookings ? `${hostBookings.length} booking${hostBookings.length === 1 ? "" : "s"}` : "Loading..."}
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              This is your listing. Below are guest reservations placed for this property.
            </p>
          </div>

          {loadingBookings ? (
            <div className="py-6 text-center text-xs text-neutral-500">
              <Spinner className="mx-auto mb-2 size-5" /> Loading reservations...
            </div>
          ) : !hostBookings || hostBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 p-5 text-center text-xs text-neutral-500 dark:border-neutral-800">
              <Luggage className="mx-auto mb-2 size-6 text-neutral-400" />
              No guest bookings yet. When someone reserves your place, their details, dates, and contact information will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Guest Bookings ({hostBookings.length})
              </h4>
              <div className="max-h-80 space-y-2.5 overflow-y-auto no-scrollbar pr-0.5">
                {hostBookings.map((b) => {
                  const bNights = nightsBetween(b.checkIn, b.checkOut);
                  return (
                    <div
                      key={b._id}
                      className="rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 truncate">
                          <User className="size-3.5 text-brand-500 shrink-0" />
                          <span className="truncate">{b.user?.username || "Guest"}</span>
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${statusStyles[b.status] || "bg-emerald-100 text-emerald-700"}`}>
                          {b.status}
                        </span>
                      </div>

                      {b.user?.email && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                          <Mail className="size-3 text-neutral-400 shrink-0" />
                          <a href={`mailto:${b.user.email}`} title={`Email ${b.user.email}`} className="text-brand-500 hover:underline truncate">
                            {b.user.email}
                          </a>
                        </div>
                      )}

                      <div className="mt-2 grid grid-cols-2 gap-1 text-[12px] text-neutral-600 dark:text-neutral-400">
                        <div>
                          <span className="block text-[10px] uppercase text-neutral-400 font-semibold">Dates</span>
                          <span>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] uppercase text-neutral-400 font-semibold">Guests & Nights</span>
                          <span>{b.guests} guest{b.guests === 1 ? "" : "s"} · {bNights}n</span>
                        </div>
                      </div>

                      {b.specialRequests && (
                        <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-[11px] text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300">
                          <strong>Note:</strong> "{b.specialRequests}"
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2 text-xs dark:border-neutral-800">
                        <span className="text-neutral-400">Payout</span>
                        <strong className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                          {formatPrice(b.totalPrice)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Link
            to="/profile"
            className="block text-center text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Manage all reservations in Profile →
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6">
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-neutral-300 dark:border-neutral-700">
            <label htmlFor="check-in" className="border-r border-b border-neutral-300 p-2.5 sm:p-3 dark:border-neutral-700">
              <span className="block text-[11px] font-bold tracking-wide uppercase">Check-in</span>
              <input id="check-in" type="date" required min={today} value={form.checkIn} onChange={set("checkIn")} className="mt-0.5 w-full bg-transparent text-xs sm:text-sm outline-none" />
            </label>
            <label htmlFor="check-out" className="border-b border-neutral-300 p-2.5 sm:p-3 dark:border-neutral-700">
              <span className="block text-[11px] font-bold tracking-wide uppercase">Check-out</span>
              <input id="check-out" type="date" required min={minCheckOut} value={form.checkOut} onChange={set("checkOut")} className="mt-0.5 w-full bg-transparent text-xs sm:text-sm outline-none" />
            </label>
            <label htmlFor="guests" className="col-span-2 p-2.5 sm:p-3">
              <span className="block text-[11px] font-bold tracking-wide uppercase">Guests</span>
              <input id="guests" type="number" required min={1} value={form.guests} onChange={set("guests")} className="mt-0.5 w-full bg-transparent text-xs sm:text-sm outline-none" />
            </label>
          </div>
          <label htmlFor="special-requests" className="mt-3 block">
            <span className="sr-only">Special requests</span>
            <input
              id="special-requests"
              type="text"
              maxLength={300}
              placeholder="Special requests (optional)"
              value={form.specialRequests}
              onChange={set("specialRequests")}
              className="field"
            />
          </label>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={submitting} className="btn-primary mt-4 w-full py-3.5 text-base">
            {submitting && <Spinner />} Reserve
          </motion.button>

          <AnimatePresence initial={false}>
            {nights > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <dl className="mt-5 space-y-3 text-[15px]">
                  <div className="flex justify-between">
                    <dt className="underline decoration-neutral-300 underline-offset-4">
                      {formatPrice(listing.price)} × {nights} night{nights > 1 && "s"}
                    </dt>
                    <dd>{formatPrice(totals.base)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="underline decoration-neutral-300 underline-offset-4">GST (18%)</dt>
                    <dd>{formatPrice(totals.gst)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-3 font-bold dark:border-neutral-800">
                    <dt>Total</dt>
                    <dd>{formatPrice(totals.total)}</dd>
                  </div>
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-3 text-center text-xs text-neutral-500">You won't be charged yet</p>
        </form>
      )}
    </div>
  );
}
