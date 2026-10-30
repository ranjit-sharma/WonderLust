import { motion } from "motion/react";
import { Link } from "react-router";
import { Compass, LoaderCircle, Star } from "lucide-react";

export const ease = [0.22, 1, 0.36, 1];

// Fades content up the first time it scrolls into view.
export function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </Tag>
  );
}

export function Spinner({ className = "size-5", brand = false }) {
  return (
    <LoaderCircle
      className={`animate-spin ${brand ? "text-brand-500" : ""} ${className}`}
      aria-hidden="true"
    />
  );
}

export function PageLoader({ className = "min-h-[50vh]", message = "Loading" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-brand-500 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient radial glow */}
        <div className="absolute size-24 rounded-full bg-brand-500/20 blur-xl animate-pulse" />

        {/* Outer spinning ring with brand gradient arc */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          className="size-16 rounded-full border-[3px] border-brand-500/20 border-t-brand-500 border-r-brand-500 drop-shadow-[0_0_12px_rgba(254,66,77,0.4)]"
        />

        {/* Counter-rotating inner accent ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
          className="absolute size-11 rounded-full border-2 border-brand-400/25 border-b-brand-500"
        />

        {/* Central Brand Compass Logo with gentle oscillation and breathing pulse */}
        <motion.div
          animate={{
            rotate: [0, -15, 15, 0],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.4,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex items-center justify-center text-brand-500 drop-shadow-[0_0_8px_rgba(254,66,77,0.5)]"
        >
          <Compass className="size-6" strokeWidth={2.4} />
        </motion.div>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="mt-5 text-xs font-bold tracking-widest uppercase text-brand-500"
        >
          {message}
        </motion.p>
      )}
      <span className="sr-only">Loading WonderLust...</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease }}
      className="card mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center"
    >
      {Icon && (
        <motion.span
          initial={{ rotate: -12, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
          className="mb-5 grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10"
        >
          <Icon className="size-8" />
        </motion.span>
      )}
      <h2 className="text-xl font-bold">{title}</h2>
      {text && <p className="mt-2 text-neutral-500 dark:text-neutral-400">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      title={error?.status === 404 ? "We couldn't find that" : "Something went wrong"}
      text={error?.message}
      action={
        onRetry && error?.status !== 404 ? (
          <button className="btn-dark" onClick={onRetry}>
            Try again
          </button>
        ) : (
          <Link to="/listings" className="btn-dark">
            Explore stays
          </Link>
        )
      }
    />
  );
}

export function Rating({ value, count, className = "" }) {
  if (!count) return <span className={`text-neutral-500 dark:text-neutral-400 ${className}`}>New</span>;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Star className="size-3.5 fill-current" aria-hidden="true" />
      <span className="font-semibold">{value.toFixed(1)}</span>
      <span className="text-neutral-500 dark:text-neutral-400">({count})</span>
    </span>
  );
}

// Standard page heading used by account pages.
export function PageHeader({ eyebrow, title, text, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-semibold tracking-wide text-brand-500 uppercase">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {text && <p className="mt-2 max-w-xl text-neutral-500 dark:text-neutral-400">{text}</p>}
      </div>
      {action}
    </div>
  );
}
