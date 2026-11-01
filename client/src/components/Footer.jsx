import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ArrowUp, ArrowUpRight, Compass, Globe, IndianRupee, MapPin } from "lucide-react";
import { ease, Reveal } from "./ui.jsx";
import Logo from "./Logo.jsx";
import SocialLinks from "./SocialLinks.jsx";

const columns = [
  {
    title: "Support",
    links: [
      ["/help", "Help Centre"],
      ["/support/safety", "Safety"],
      ["/support/cancellation", "Cancellation options"],
      ["/support/neighbourhood-concern", "Report a concern"],
      ["/feedback", "Share feedback"],
    ],
  },
  {
    title: "Explore StayLust",
    links: [
      ["/listings", "Explore stays"],
      ["/listings/new", "Become a host"],
      ["/co-hosts", "Find a co-host"],
      ["/about", "About"],
      ["/questions", "Q&A"],
    ],
  },
  {
    title: "Community",
    links: [
      ["/support/discrimination", "Anti-discrimination"],
      ["/support/accessibility", "Disability support"],
      ["/support/aircover", "AirCover"],
      ["/refer-host", "Refer a host"],
    ],
  },
];

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 text-sm text-neutral-600 transition-colors duration-300 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
    >
      {children}
      <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition duration-300 ease-smooth group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

// Red call-to-action card that overlaps the top edge of the footer.
function FooterCta() {
  return (
    <Reveal className="animate-pan relative z-10 -mt-14 overflow-hidden rounded-card bg-linear-to-br from-brand-500 via-brand-600 to-brand-500 bg-[length:200%_200%] px-4 py-5 text-white shadow-[0_18px_44px_-20px_rgb(254_66_77/0.6)] sm:px-10 sm:py-7">
      <motion.span
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-10 -right-10 text-white/10 sm:-top-14 sm:-right-6"
      >
        <Compass className="size-36 sm:size-52" strokeWidth={1.2} />
      </motion.span>
      <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl items-start gap-3">
          {/* compass badge gives the phone layout a focal point */}
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur sm:hidden">
            <Compass className="size-5" />
          </span>
          <div>
            <h2 className="text-lg leading-tight font-extrabold tracking-tight sm:text-2xl">Ready for your next escape?</h2>
            <p className="mt-1 text-[13px] leading-snug text-white/85 sm:mt-1.5 sm:text-[15px]">
              Find a stay with character, or share your own place and start hosting today.
            </p>
          </div>
        </div>
        {/* side by side on every screen; compact on phones */}
        <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 sm:flex sm:gap-3">
          <Link
            to="/listings"
            className="group btn bg-white px-3 py-2.5 text-[13px] text-brand-600 shadow-lift hover:-translate-y-0.5 hover:bg-white/95 focus-visible:ring-white/40 sm:px-5 sm:text-sm"
          >
            Explore stays
            <ArrowRight className="size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
          </Link>
          <Link
            to="/listings/new"
            className="btn border border-white/50 px-3 py-2.5 text-[13px] text-white hover:-translate-y-0.5 hover:bg-white/10 focus-visible:ring-white/40 sm:px-5 sm:text-sm"
          >
            Become a host
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 sm:mt-20 border-t border-neutral-200/80 bg-[#e3ebf4] dark:border-neutral-800 dark:bg-[#0d0f15]">
      <div className="container-wide">
        <FooterCta />

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-8 gap-y-10 py-10 sm:grid-cols-3 sm:py-14 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <Reveal className="col-span-2 max-w-md sm:col-span-3 lg:col-span-1">
            <Logo clickable={false} />
            <h3 className="mt-4 text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
              Some places you visit. Some places you remember.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              StayLust helps you discover stays with character, welcoming hosts, and destinations that turn ordinary trips into stories worth telling.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <MapPin className="size-3 text-brand-500" /> India
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <IndianRupee className="size-3 text-brand-500" /> INR
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <Globe className="size-3 text-brand-500" /> English
              </span>
            </div>
            <SocialLinks className="mt-6" />
          </Reveal>

          {columns.map((col, i) => (
            <Reveal key={col.title} delay={0.08 * (i + 1)}>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map(([to, label]) => (
                  <li key={to}>
                    <FooterLink to={to}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="container-wide flex flex-col gap-4 py-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} StayLust Private Limited</span>
            <Link to="/privacy" className="transition-colors hover:text-neutral-900 dark:hover:text-white">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-neutral-900 dark:hover:text-white">Terms</Link>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span>
              Developed by{" "}
              <a
                href="https://github.com/ranjit-sharma"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-neutral-800 transition-colors hover:text-brand-600 dark:text-neutral-200 dark:hover:text-brand-400"
              >
                Ranjit Sharma
              </a>
            </span>
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-card transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <ArrowUp className="size-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
