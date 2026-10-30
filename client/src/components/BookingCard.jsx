import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { bookingTotals, formatPrice, nightsBetween, toDateInput } from "../lib/format.js";
import { Rating, Spinner } from "./ui.jsx";

export default function BookingCard({ listing, averageRating, reviewCount }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: 2, specialRequests: "" });
  const [submitting, setSubmitting] = useState(false);

  const today = toDateInput(new Date());
  const dayAfterCheckIn = new Date(`${form.checkIn}T00:00`);
  dayAfterCheckIn.setDate(dayAfterCheckIn.getDate() + 1);
  const minCheckOut = form.checkIn ? toDateInput(dayAfterCheckIn) : today;
  const nights = nightsBetween(form.checkIn, form.checkOut);
  const totals = bookingTotals(nights, listing.price);
  const isOwner = user && listing.owner?._id === user._id;

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
          <span className="text-2xl font-extrabold">{formatPrice(listing.price)}</span>
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
        <p className="mt-6 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          This is your listing. Guests will reserve it from here.
        </p>
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
