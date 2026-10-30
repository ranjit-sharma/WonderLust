import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import {
  Compass,
  Heart,
  Info,
  LifeBuoy,
  LogOut,
  Luggage,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { useTheme } from "../lib/theme.js";
import { ease } from "./ui.jsx";

import Logo from "./Logo.jsx";
export { Logo };

function SearchBar({ className = "" }) {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => setQ(params.get("q") || ""), [params]);

  const submit = (e) => {
    e.preventDefault();
    // Keep the filters already applied on the listings page.
    const next = new URLSearchParams(pathname === "/listings" ? params : undefined);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    navigate(`/listings?${next}`);
  };

  return (
    <form onSubmit={submit} role="search" className={`group relative ${className}`}>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search destinations, stays, categories…"
        aria-label="Search listings"
        className="h-12 w-full rounded-full border border-neutral-200 bg-white pr-14 pl-5 text-sm shadow-card transition outline-none placeholder:text-neutral-400 hover:shadow-lift focus:border-neutral-300 focus:shadow-lift dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-700"
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="submit"
        aria-label="Search"
        className="absolute top-1.5 right-1.5 grid size-9 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-600 text-white"
      >
        <Search className="size-4" strokeWidth={2.6} />
      </motion.button>
    </form>
  );
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  const Comp = to ? Link : "button";
  return (
    <Comp
      to={to}
      onClick={onClick}
      role="menuitem"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      {Icon && <Icon className="size-4 text-neutral-500" />}
      {children}
    </Comp>
  );
}

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await logout();
      toast("You are logged out!");
      navigate("/listings");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const divider = <hr className="my-1.5 border-neutral-200 dark:border-neutral-800" />;

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white py-1.5 pr-1.5 pl-3.5 transition hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900"
      >
        <Menu className="size-4" />
        <span className="grid size-8 place-items-center rounded-full bg-neutral-800 text-sm font-bold text-white uppercase dark:bg-neutral-200 dark:text-neutral-900">
          {user ? user.username.charAt(0) : <User className="size-4" />}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease }}
            className="absolute top-full right-0 z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-neutral-200 bg-white p-2 shadow-lift dark:border-neutral-800 dark:bg-neutral-900"
          >
            {user ? (
              <>
                <p className="px-3 pt-1.5 pb-2 text-xs text-neutral-500">
                  Signed in as <b className="text-neutral-800 dark:text-neutral-200">{user.username}</b>
                </p>
                <MenuLink to="/profile" icon={User}>Profile</MenuLink>
                <MenuLink to="/wishlist" icon={Heart}>My Wishlist</MenuLink>
              </>
            ) : (
              <>
                <MenuLink to="/login">
                  <span className="font-semibold">Log in</span>
                </MenuLink>
                <MenuLink to="/signup">Sign up</MenuLink>
              </>
            )}
            {divider}
            <MenuLink to="/listings" icon={Compass}>Explore stays</MenuLink>
            <Link
              to="/listings/new"
              role="menuitem"
              className="my-1 flex items-center justify-between gap-3 rounded-xl bg-brand-50 px-3 py-3 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20"
            >
              <span>
                <strong className="block text-sm">Become a host</strong>
                <small className="text-xs text-neutral-500 dark:text-neutral-400">
                  It's easy to start hosting and earn extra income.
                </small>
              </span>
              <Luggage className="size-6 shrink-0 text-brand-500" />
            </Link>
            <MenuLink to="/refer-host" icon={UserPlus}>Refer a host</MenuLink>
            <MenuLink to="/co-hosts" icon={Users}>Find a co-host</MenuLink>
            {divider}
            <MenuLink to="/help" icon={LifeBuoy}>Help Centre</MenuLink>
            <MenuLink to="/about" icon={Info}>About WonderLust</MenuLink>
            {user && (
              <>
                {divider}
                <MenuLink onClick={handleLogout} icon={LogOut}>Log out</MenuLink>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { scrollY, scrollYProgress } = useScroll();
  // spring-smoothed so the progress bar glides instead of jumping with each wheel tick
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggle } = useTheme();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/85 backdrop-blur-xl transition-[box-shadow,border-color] duration-300 dark:bg-ink/85 ${
        scrolled ? "border-neutral-200 shadow-[0_6px_24px_-16px_rgb(0_0_0/0.35)] dark:border-neutral-800" : "border-transparent"
      }`}
    >
      <div className="container-wide flex flex-wrap items-center gap-x-4 gap-y-3 py-3 md:flex-nowrap md:py-4">
        <Logo />
        <SearchBar className="order-last w-full md:order-none md:mx-auto md:max-w-md lg:max-w-lg" />
        <nav className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <NavLink
            to="/listings/new"
            className="hidden rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition hover:bg-neutral-100 xl:block dark:hover:bg-neutral-900"
          >
            Become a host
          </NavLink>
          <motion.button
            whileTap={{ scale: 0.9, rotate: 20 }}
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid size-10 place-items-center rounded-full transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <AccountMenu />
        </nav>
      </div>
      {/* reading-progress bar along the bottom edge of the navbar */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-linear-to-r from-brand-500 to-brand-600"
      />
    </header>
  );
}
