import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import {
  ArrowRight,
  Heart,
  Info,
  LifeBuoy,
  LogOut,
  Luggage,
  Menu,
  MessageSquareText,
  Moon,
  MapPin,
  Search,
  Sparkles,
  Sun,
  X,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { useTheme } from "../lib/theme.js";
import { ease } from "./ui.jsx";

import { api } from "../lib/api.js";
import { formatPrice, imageUrl } from "../lib/format.js";
import { categoryIcons } from "../lib/categories.js";
import Logo from "./Logo.jsx";
export { Logo };

function SearchBar({ className = "" }) {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState(params.get("q") || "");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => setQ(params.get("q") || ""), [params]);

  // Load existing listings once for instant search suggestions
  useEffect(() => {
    let active = true;
    api("/listings")
      .then((data) => {
        if (active && Array.isArray(data)) {
          setAllListings(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Debounce query: require at least 2 characters and a short typing pause (300ms)
  useEffect(() => {
    if (q.trim().length < 2) {
      setDebouncedQ("");
      setOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQ(q.trim());
      if (isFocused) {
        setOpen(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q, isFocused]);

  // Close suggestions when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Derived unique locations from existing listings
  const destinations = useMemo(() => {
    const map = new Map();
    allListings.forEach((l) => {
      if (l.location) {
        const full = [l.location, l.country].filter(Boolean).join(", ");
        if (!map.has(full)) {
          map.set(full, { name: full, count: 1, rawLocation: l.location });
        } else {
          map.get(full).count += 1;
        }
      }
    });
    return Array.from(map.values());
  }, [allListings]);

  // Matching existing listings (only when debounced query is at least 2 chars)
  const matchingListings = useMemo(() => {
    const query = debouncedQ.toLowerCase();
    if (!query || query.length < 2) return [];
    return allListings
      .filter(
        (l) =>
          l.title?.toLowerCase().includes(query) ||
          l.location?.toLowerCase().includes(query) ||
          l.country?.toLowerCase().includes(query) ||
          l.category?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [allListings, debouncedQ]);

  // Matching destinations
  const matchingDestinations = useMemo(() => {
    const query = debouncedQ.toLowerCase();
    if (!query || query.length < 2) return [];
    return destinations
      .filter((d) => d.name.toLowerCase().includes(query))
      .slice(0, 3);
  }, [destinations, debouncedQ]);

  // Matching categories
  const matchingCategories = useMemo(() => {
    const query = debouncedQ.toLowerCase();
    if (!query || query.length < 2) return [];
    return Object.keys(categoryIcons)
      .filter((c) => c.toLowerCase().includes(query))
      .slice(0, 3);
  }, [debouncedQ]);

  const submit = (e) => {
    e?.preventDefault();
    setOpen(false);
    const next = new URLSearchParams(pathname === "/listings" ? params : undefined);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    navigate(`/listings?${next}`);
  };

  const handleSelectListing = (id) => {
    setOpen(false);
    navigate(`/listings/${id}`);
  };

  const handleSelectDestination = (dest) => {
    const loc = (dest.rawLocation || dest.name).trim();
    setQ(loc);
    setOpen(false);
    const next = new URLSearchParams(pathname === "/listings" ? params : undefined);
    next.set("q", loc);
    navigate(`/listings?${next}`);
  };

  const handleSelectCategory = (cat) => {
    setOpen(false);
    navigate(`/listings?category=${encodeURIComponent(cat)}`);
  };

  const handleClear = () => {
    setQ("");
    setDebouncedQ("");
    setOpen(false);
    const next = new URLSearchParams(pathname === "/listings" ? params : undefined);
    next.delete("q");
    navigate(`/listings?${next}`);
  };

  const hasSuggestions =
    matchingListings.length > 0 ||
    matchingDestinations.length > 0 ||
    matchingCategories.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={submit} role="search" className="group relative">
        <input
          type="search"
          value={q}
          onFocus={() => {
            setIsFocused(true);
            if (debouncedQ.length >= 2) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          onChange={(e) => {
            setQ(e.target.value);
          }}
          placeholder="Search destinations, stays…"
          aria-label="Search listings"
          autoComplete="off"
          className="h-11 sm:h-12 w-full rounded-full border border-neutral-200 bg-white pr-20 pl-4 sm:pl-5 text-sm shadow-card transition outline-none placeholder:text-neutral-400 hover:shadow-lift focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 focus:shadow-lift dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-brand-500/50"
        />

        <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex items-center gap-1">
          {q && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileTap={{ scale: 0.85 }}
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="grid size-8 sm:size-9 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="size-3.5 sm:size-4" strokeWidth={2.2} />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            aria-label="Search"
            className="grid size-8 sm:size-9 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-600 text-white shadow-sm"
          >
            <Search className="size-3.5 sm:size-4" strokeWidth={2.6} />
          </motion.button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {open && debouncedQ.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[75vh] overflow-y-auto rounded-2xl border border-neutral-200/90 bg-white/95 p-2 shadow-lift backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/95"
          >
            {!hasSuggestions ? (
              <div className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                <p>No listings found matching "{debouncedQ}"</p>
                <button
                  type="button"
                  onClick={submit}
                  className="mt-2 text-xs font-semibold text-brand-500 hover:underline"
                >
                  Search all stays anyway →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Destinations Section */}
                {matchingDestinations.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Destinations
                    </div>
                    <div className="space-y-0.5">
                      {matchingDestinations.map((dest) => (
                        <button
                          key={dest.name}
                          type="button"
                          onClick={() => handleSelectDestination(dest)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-100 text-brand-500 dark:bg-neutral-800">
                            <MapPin className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                              {dest.name}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {dest.count} {dest.count === 1 ? "stay" : "stays"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories Section */}
                {matchingCategories.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Categories
                    </div>
                    <div className="space-y-0.5">
                      {matchingCategories.map((cat) => {
                        const Icon = categoryIcons[cat];
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleSelectCategory(cat)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                              {Icon ? <Icon className="size-4" /> : <Sparkles className="size-4" />}
                            </div>
                            <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                              {cat}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Existing Listings Section */}
                {matchingListings.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Existing Stays
                    </div>
                    <div className="space-y-1">
                      {matchingListings.map((listing) => (
                        <button
                          key={listing._id}
                          type="button"
                          onClick={() => handleSelectListing(listing._id)}
                          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <img
                            src={imageUrl(listing.image?.url, 120)}
                            alt={listing.title}
                            className="size-11 shrink-0 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {listing.title}
                            </p>
                            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                              {[listing.location, listing.country].filter(Boolean).join(", ")}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                              {formatPrice(listing.price)}
                            </span>
                            <span className="block text-[11px] text-neutral-400">/ night</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer action to search all */}
                <div className="border-t border-neutral-100 pt-1.5 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={submit}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-brand-500 hover:bg-brand-50/60 dark:hover:bg-brand-500/10 transition"
                  >
                    <span>Search all results for "{debouncedQ}"</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
            <MenuLink to="/feedback" icon={MessageSquareText}>Feedback</MenuLink>
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
  const [scrolled, setScrolled] = useState(false);
  const lastScrolled = useRef(false);
  const { dark, toggle } = useTheme();

  useMotionValueEvent(scrollY, "change", (y) => {
    const isScrolled = y > 8;
    if (isScrolled !== lastScrolled.current) {
      lastScrolled.current = isScrolled;
      setScrolled(isScrolled);
    }
  });

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-[#ebf0f7]/90 backdrop-blur-md transition-[box-shadow,border-color] duration-300 dark:bg-[#12151d]/90 will-change-transform ${
        scrolled ? "border-neutral-200/80 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] dark:border-neutral-800" : "border-transparent"
      }`}
    >
      <div className="container-wide flex flex-wrap items-center gap-x-4 gap-y-3 py-3 md:flex-nowrap md:py-4">
        <Logo
          clickable={true}
          iconSize="size-8 md:size-9 lg:size-10"
          textSize="text-xl md:text-2xl lg:text-[1.65rem]"
        />
        <SearchBar className="order-last w-full md:order-none md:mx-auto md:max-w-xs lg:max-w-md xl:max-w-lg" />
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
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-brand-500 to-brand-600"
      />
    </header>
  );
}
