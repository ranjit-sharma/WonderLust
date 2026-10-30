import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { motion } from "motion/react";
import { useAuth } from "./lib/auth.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { PageLoader, ease } from "./components/ui.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import Listings from "./pages/Listings.jsx";
import ListingDetail from "./pages/ListingDetail.jsx";
import ListingForm from "./pages/ListingForm.jsx";
import { Login, Signup } from "./pages/Auth.jsx";
import { BookingConfirmation, Profile, Wishlist } from "./pages/Account.jsx";
import {
  About,
  CoHosts,
  Feedback,
  Help,
  NeighbourhoodConcern,
  NotFound,
  Privacy,
  Questions,
  ReferHost,
  SupportDetail,
  Terms,
} from "./pages/Info.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  // Braces matter: scrollTo returns a Promise in newer browsers, and React would call it as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift">
        Skip to content
      </a>
      <Navbar />
      {/* Enter-only transition: navigation never waits on an exit animation.
          Keyed by path only, so changing filters/search doesn't replay it. */}
      <motion.main
        id="main"
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex-1"
      >
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/listings" replace />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/new" element={<RequireAuth><ListingForm /></RequireAuth>} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/listings/:id/edit" element={<RequireAuth><ListingForm /></RequireAuth>} />
            <Route path="/booking-confirmed" element={<BookingConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
            <Route path="/about" element={<About />} />
            <Route path="/co-hosts" element={<CoHosts />} />
            <Route path="/refer-host" element={<ReferHost />} />
            <Route path="/help" element={<Help />} />
            <Route path="/help-center" element={<Navigate to="/help" replace />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/q-and-a" element={<Navigate to="/questions" replace />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/support/neighbourhood-concern" element={<NeighbourhoodConcern />} />
            <Route path="/support/:slug" element={<SupportDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </motion.main>
      <Footer />
    </div>
  );
}
